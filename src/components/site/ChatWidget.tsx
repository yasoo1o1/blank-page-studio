import { useEffect, useRef, useState } from "react";
import { useLocation } from "@/lib/router-compat";
import { MessageCircle, X, Send, User as UserIcon, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  type ChatConversation,
  type ChatMessage,
  getConversation,
  getStoredConversationId,
  listMessages,
  markRead,
  sendMessage,
  startConversation,
  clearStoredConversation,
  findConversationByVisitor,
  setStoredConversationId,
} from "@/lib/chat";
import { getVisitorId } from "@/lib/visitor-tracking";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ChatWidget = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hide on admin pages
  const isAdmin = location.pathname.startsWith("/yasin1");

  // Load existing conversation (stored locally OR initiated by admin for this visitor)
  useEffect(() => {
    (async () => {
      const id = getStoredConversationId();
      let conv: ChatConversation | null = null;
      if (id) {
        conv = await getConversation(id);
        if (!conv) clearStoredConversation();
      }
      // Fallback: look for an admin-initiated conversation tied to this visitor
      if (!conv) {
        const visitorId = getVisitorId();
        conv = await findConversationByVisitor(visitorId);
        if (conv) setStoredConversationId(conv.id);
      }
      if (!conv) return;
      setConversation(conv);
      setMessages(await listMessages(conv.id));
      setUnread(conv.unread_customer ?? 0);
      // Auto-open if admin started the chat and there are unread messages
      if (conv.initiated_by === "admin" && (conv.unread_customer ?? 0) > 0) {
        setOpen(true);
      }
    })();
  }, []);

  // Listen on the visitor's channel for newly admin-created conversations (real-time)
  useEffect(() => {
    if (conversation) return;
    const visitorId = getVisitorId();
    const channel = supabase
      .channel(`visitor-conv-${visitorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_conversations",
          filter: `visitor_id=eq.${visitorId}`,
        },
        async (payload) => {
          const conv = payload.new as ChatConversation;
          setStoredConversationId(conv.id);
          setConversation(conv);
          setMessages(await listMessages(conv.id));
          if (conv.initiated_by === "admin") {
            setOpen(true);
            toast.success("لديك رسالة جديدة من خدمة العملاء");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Realtime subscriptions
  useEffect(() => {
    if (!conversation) return;
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.find((m) => m.id === msg.id) ? prev : [...prev, msg],
          );
          if (msg.sender === "admin" && !open) {
            setUnread((u) => u + 1);
            toast.success("رسالة جديدة من خدمة العملاء");
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
          filter: `id=eq.${conversation.id}`,
        },
        (payload) => {
          const conv = payload.new as ChatConversation;
          setConversation(conv);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Mark read when opened
  useEffect(() => {
    if (open && conversation) {
      setUnread(0);
      markRead(conversation.id, "customer");
    }
  }, [open, conversation]);

  if (isAdmin) return null;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("يرجى إدخال اسمك");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 9) {
      toast.error("يرجى إدخال رقم جوال صحيح");
      return;
    }
    const conv = await startConversation(name, phone);
    if (!conv) {
      toast.error("تعذّر بدء المحادثة");
      return;
    }
    setConversation(conv);
    setMessages([]);
    toast.success("مرحباً بك! يمكنك إرسال رسالتك الآن");
  };

  const handleSend = async () => {
    if (!conversation || !draft.trim()) return;
    setSending(true);
    const text = draft;
    setDraft("");
    const ok = await sendMessage(conversation.id, "customer", text);
    setSending(false);
    if (!ok) {
      setDraft(text);
      toast.error("تعذّر إرسال الرسالة");
    }
  };

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح الدردشة"
          className="fixed bottom-5 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-blue to-[hsl(205_78%_26%)] text-white shadow-float transition-transform hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2.2} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-500 px-1.5 text-[11px] font-extrabold text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Window */}
      {open && (
        <div
          dir="rtl"
          className="fixed bottom-4 right-3 z-50 flex h-[72vh] max-h-[640px] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-float"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 bg-gradient-to-l from-brand-blue to-[hsl(205_78%_26%)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/15">
                <MessageCircle className="h-4.5 w-4.5" />
              </div>
              <div className="leading-tight">
                <div className="text-[14px] font-extrabold">خدمة العملاء</div>
                <div className="flex items-center gap-1.5 text-[11px] opacity-90">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/40" />
                  متصل الآن
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق"
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          {!conversation ? (
            <form
              onSubmit={handleStart}
              className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[hsl(210_40%_97%)] p-4"
            >
              <div className="rounded-xl bg-brand-blue/5 p-3 text-[12.5px] leading-6 text-brand-blue">
                مرحباً بك 👋 أدخل اسمك ورقم جوالك لبدء المحادثة مع فريق الدعم.
              </div>
              <label className="text-[12.5px] font-extrabold text-brand-blue">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  الاسم
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  placeholder="اسمك الكريم"
                  className="h-11 w-full rounded-[10px] border border-[hsl(214_25%_88%)] bg-white px-3 text-[13.5px] text-brand-blue outline-none focus:border-brand-blue"
                />
              </label>
              <label className="text-[12.5px] font-extrabold text-brand-blue">
                <span className="mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  رقم الجوال
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, "").slice(0, 15))}
                  placeholder="05xxxxxxxx"
                  inputMode="tel"
                  dir="ltr"
                  className="h-11 w-full rounded-[10px] border border-[hsl(214_25%_88%)] bg-white px-3 text-right text-[13.5px] text-brand-blue outline-none focus:border-brand-blue"
                />
              </label>
              <button
                type="submit"
                className="mt-1 h-11 rounded-[10px] bg-gradient-to-l from-brand-blue to-[hsl(205_78%_26%)] text-[13.5px] font-extrabold text-white shadow-soft hover:brightness-110"
              >
                بدء المحادثة
              </button>
            </form>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="flex-1 space-y-2.5 overflow-y-auto bg-[hsl(210_40%_97%)] p-3"
              >
                {messages.length === 0 && (
                  <div className="mt-6 text-center text-[12.5px] text-muted-foreground">
                    اكتب رسالتك الأولى وسيرد عليك الفريق قريباً.
                  </div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      m.sender === "customer" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-6 shadow-sm",
                        m.sender === "customer"
                          ? "rounded-br-sm bg-gradient-to-l from-brand-blue to-[hsl(205_78%_26%)] text-white"
                          : "rounded-bl-sm bg-white text-brand-blue ring-1 ring-border/60",
                      )}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      <div
                        className={cn(
                          "mt-1 text-[10px]",
                          m.sender === "customer" ? "text-white/70" : "text-muted-foreground",
                        )}
                        dir="ltr"
                      >
                        {new Date(m.created_at).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-2 border-t border-border bg-white p-2.5">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="اكتب رسالتك..."
                  className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-[hsl(214_25%_88%)] bg-white px-3 py-2 text-[13.5px] text-brand-blue outline-none focus:border-brand-blue"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  aria-label="إرسال"
                  className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-blue to-[hsl(205_78%_26%)] text-white shadow-soft transition-all hover:brightness-110 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;

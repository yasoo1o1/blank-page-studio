import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { FileText, CreditCard, Eye, CheckCircle2, User, Car } from "lucide-react";
import applePayLogo from "@/assets/apple-pay.svg";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";
import QuoteSteps from "@/components/site/QuoteSteps";
import PolicyPreview, { type PolicyData } from "@/components/site/PolicyPreview";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CheckoutState = Partial<PolicyData>;

type PayMethod = "card" | "apple";

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 py-2.5 text-[12.5px] sm:text-[13px]">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-extrabold text-brand-blue">{value}</span>
  </div>
);

const SectionTitle = ({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <div className="mb-3 flex items-center justify-end gap-2 text-brand-blue">
    <h2 className="text-[15px] font-extrabold sm:text-[16px]">{children}</h2>
    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
  </div>
);

const PaymentOption = ({
  active,
  onClick,
  title,
  subtitle,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex w-full items-center justify-between gap-3 rounded-xl border bg-white p-3.5 transition-all",
      active
        ? "border-brand-blue/60 shadow-card"
        : "border-border/60 hover:border-brand-blue/30",
    )}
  >
    {/* radio (right edge in RTL = first in flex) */}
    <span
      className={cn(
        "grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full border-2",
        active ? "border-brand-blue" : "border-muted-foreground/40",
      )}
    >
      {active && <span className="h-[10px] w-[10px] rounded-full bg-brand-blue" />}
    </span>
    {/* icon */}
    <span className="text-brand-blue">{icon}</span>
    {/* labels */}
    <div className="flex-1 text-right">
      <div className="text-[14px] font-extrabold text-brand-blue sm:text-[15px]">
        {title}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground sm:text-[12px]">
        {subtitle}
      </div>
    </div>
  </button>
);

const QuoteCheckout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as CheckoutState) || {};

  const company = state.company || "—";
  const type = state.type || "شامل";
  const price = state.price ?? 0;
  const vat = useMemo(() => +(price * 0.15).toFixed(2), [price]);
  const total = useMemo(() => +(price + vat).toFixed(2), [price, vat]);

  const [method, setMethod] = useState<PayMethod>("card");
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePay = () => {
    navigate("/quote/payment", {
      state: {
        ...state,
        company,
        type,
        price,
        total,
        method,
      },
    });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[hsl(210_40%_97%)]">
      <Header />
      <QuoteSteps current={4} />

      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1100px] px-3 pb-10 pt-2 sm:px-4"
      >
        {/* Desktop: 2 columns (service+payment | summary). Mobile: stacked */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
          {/* LEFT column on desktop = service details + payment method */}
          <div className="space-y-4">
            {/* Insured person details */}
            <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
              <SectionTitle icon={User}>بيانات المؤمن له</SectionTitle>
              <div className="divide-y divide-border">
                <Row label="الاسم الكامل" value={state.fullName || "—"} />
                <Row label="رقم الهوية / الإقامة" value={state.identity || "—"} />
                <Row label="تاريخ الميلاد" value={state.birthDate || "—"} />
                <Row label="رقم الجوال" value={state.phone || "—"} />
                <Row label="تاريخ بدء التأمين" value={state.startDate || "—"} />
              </div>
            </div>

            {/* Vehicle details */}
            <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
              <SectionTitle icon={Car}>بيانات المركبة</SectionTitle>
              <div className="divide-y divide-border">
                <Row label="ماركة ونوع المركبة" value={state.brand || "—"} />
                <Row label="سنة الصنع" value={state.year || "—"} />
                <Row
                  label="القيمة التقديرية"
                  value={state.estValue ? `${state.estValue} ريال` : "—"}
                />
                <Row label="الغرض من الاستخدام" value={state.purpose || "—"} />
                <Row label="مكان إصلاح المركبة" value={state.repairPlace || "—"} />
                <Row label="نوع تسجيل المركبة" value={state.docType || "استمارة"} />
              </div>
            </div>

            {/* Service details */}
            <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
              <SectionTitle icon={FileText}>تفاصيل الخدمة</SectionTitle>
              <div className="divide-y divide-border">
                <Row label="شركة التأمين" value={company} />
                <Row label="نوع التأمين" value={`تأمين ${type}`} />
                <Row label="رسوم التأمين" value={`${price.toFixed(2)} ر.س`} />
                <Row label="ضريبة القيمة المضافة (15%)" value={`${vat.toFixed(2)} ر.س`} />
              </div>

              <div className="mt-3 rounded-xl bg-brand-blue/5 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-extrabold text-brand-blue sm:text-[16px]">
                    المجموع الكلي
                  </span>
                  <span className="text-[18px] font-extrabold text-brand-blue sm:text-[20px]">
                    {total.toFixed(2)} ر.س
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="mt-4 flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand-orange text-[13px] font-extrabold text-white shadow-soft transition-transform hover:brightness-110 active:scale-[0.99] sm:text-[14px]"
              >
                <Eye className="h-[18px] w-[18px]" strokeWidth={2.2} />
                <span>معاينة وثيقة التأمين</span>
              </button>
            </div>

            {/* Payment methods */}
            <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
              <SectionTitle icon={CreditCard}>طريقة الدفع</SectionTitle>
              <div className="space-y-3">
                <PaymentOption
                  active={method === "card"}
                  onClick={() => setMethod("card")}
                  title="بطاقة ائتمان / مدى"
                  subtitle="Visa, Mastercard, مدى"
                  icon={<CreditCard className="h-6 w-6" strokeWidth={1.8} />}
                />
                <PaymentOption
                  active={method === "apple"}
                  onClick={() => setMethod("apple")}
                  title="Apple Pay"
                  subtitle="الدفع بواسطة Apple Pay"
                  icon={
                    <img
                      src={applePayLogo}
                      alt="Apple Pay"
                      className="h-7 w-auto"
                    />
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT column on desktop = order summary (sticky) */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="bg-brand-blue/10 py-3 text-center">
                <h2 className="text-[15px] font-extrabold text-brand-blue sm:text-[16px]">
                  ملخص الطلب
                </h2>
              </div>

              <div className="p-4 sm:p-5">
                <div className="divide-y divide-border">
                  <Row label="الشركة" value={company} />
                  <Row label="نوع التأمين" value={`تأمين ${type}`} />
                  <Row label="الرسوم" value={`${price.toFixed(2)} ر.س`} />
                  <Row label="الضريبة" value={`${vat.toFixed(2)} ر.س`} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-[15px] font-extrabold text-brand-blue sm:text-[16px]">
                    المجموع
                  </span>
                  <span className="text-[17px] font-extrabold text-brand-blue sm:text-[19px]">
                    {total.toFixed(2)} ر.س
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePay}
                  className="mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-[10px] bg-brand-blue text-[13.5px] font-extrabold text-white shadow-soft transition-transform hover:brightness-110 active:scale-[0.99] sm:text-[14.5px]"
                >
                  <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.2} />
                  <span>متابعة الدفع</span>
                </button>

                <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-[11.5px]">
                  بالضغط على متابعة الدفع، أنت توافق على{" "}
                  <a className="font-bold text-brand-blue underline" href="#">
                    شروط الخدمة وسياسة الخصوصية
                  </a>
                </p>
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

      <PolicyPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={{
          company,
          companyId: state.companyId,
          type,
          price,
          fullName: state.fullName,
          identity: state.identity,
          birthDate: state.birthDate,
          brand: state.brand,
          year: state.year,
          estValue: state.estValue,
          purpose: state.purpose,
          repairPlace: state.repairPlace,
          docType: state.docType,
          startDate: state.startDate,
          mainCoverage: state.mainCoverage,
          addons: state.addons,
        }}
      />
    </main>
  );
};

export default QuoteCheckout;

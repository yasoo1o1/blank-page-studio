import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "@/lib/router-compat";
import { Check } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";
import QuoteSteps from "@/components/site/QuoteSteps";
import { cn } from "@/lib/utils";
import { type InsuranceOffer } from "@/data/insurance-offers";
import { getEffectiveOffers, subscribeOfferPrices } from "@/lib/offer-prices";
import { insurerLogos } from "@/data/insurer-logos";
import { toast } from "sonner";
import SaudiRiyal from "@/components/icons/SaudiRiyal";
import { formatRiyal } from "@/lib/format-riyal";

type VehicleSummary = {
  brand?: string;
  year?: string;
  estValue?: string;
  purpose?: string;
  repairPlace?: string;
  // pass-through personal data for policy preview
  fullName?: string;
  identity?: string;
  birthDate?: string;
  phone?: string;
  insuranceType?: string;
  startDate?: string;
  docType?: string;
};

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5 text-right" dir="rtl">
    <span className="text-[11px] font-medium text-muted-foreground sm:text-[12px]">
      {label}
    </span>
    <span className="text-[12.5px] font-extrabold text-brand-blue sm:text-[13.5px]">
      {value ? formatRiyal(value) : "—"}
    </span>
  </div>
);

const CheckBox = ({
  checked,
  onClick,
  readOnly,
}: {
  checked: boolean;
  onClick?: () => void;
  readOnly?: boolean;
}) => (
  <button
    type="button"
    onClick={readOnly ? undefined : onClick}
    aria-pressed={checked}
    className={cn(
      "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-colors",
      checked
        ? "border-brand-blue bg-brand-blue text-white"
        : "border-muted-foreground/40 bg-white",
      readOnly && "cursor-default",
    )}
  >
    {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
  </button>
);

const OfferCard = ({
  offer,
  onChoose,
}: {
  offer: InsuranceOffer;
  onChoose: () => void;
}) => {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const total = useMemo(() => {
    let t = offer.price;
    offer.addons.forEach((a, i) => {
      const key = `a-${i}`;
      if (selected[key] && a.price) t += a.price;
    });
    return t;
  }, [selected, offer]);

  const toggle = (key: string) =>
    setSelected((s) => ({ ...s, [key]: !s[key] }));

  return (
    <article
      dir="rtl"
      className="overflow-hidden rounded-2xl bg-white shadow-card"
    >
      {/* Top: company name + type on right, logo on left */}
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3.5 sm:px-4 sm:pt-4">
        <div className="text-right">
          <h3 className="text-[15px] font-extrabold leading-tight text-brand-blue sm:text-[16px]">
            {offer.company}
          </h3>
          <p className="mt-1 text-[11.5px] font-extrabold text-brand-orange sm:text-[12.5px]">
            التأمين {offer.type}
          </p>
        </div>
        <div className="grid h-[68px] w-[92px] shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white p-1.5 text-center text-[10px] font-bold text-brand-blue/80 sm:h-[78px] sm:w-[104px]">
          {insurerLogos[offer.id] ? (
            <img
              src={insurerLogos[offer.id]}
              alt={offer.company}
              loading="lazy"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            offer.company
          )}
        </div>
      </div>

      {/* Body: price column on LEFT (in RTL = end), coverage list on RIGHT (start) */}
      <div className="mt-2.5 grid grid-cols-[1fr_92px] items-start gap-3 px-3.5 sm:grid-cols-[1fr_104px] sm:px-4">
        {/* Coverage list - right side in RTL */}
        <div className="border-t border-border pt-2.5">
          {/* main coverage row - checkbox at LEFT (end in RTL), text starts at right */}
          <div className="flex items-start justify-between gap-2 pb-1.5">
            <span className="flex-1 text-right text-[11.5px] font-bold leading-relaxed text-brand-blue sm:text-[12px]">
              {formatRiyal(offer.mainCoverage)}
            </span>
            <CheckBox checked readOnly />
          </div>

          {offer.addons.map((a, i) => {
            const key = `a-${i}`;
            const isOn = !!selected[key];
            return (
              <div
                key={key}
                className="flex items-start justify-between gap-2 border-t border-border/60 py-1.5"
              >
                <span
                  className="flex-1 cursor-pointer text-right text-[11.5px] font-medium leading-relaxed text-brand-blue/90 sm:text-[12px]"
                  onClick={() => toggle(key)}
                >
                  {a.label}
                  {a.price ? (
                    <span className="font-bold">
                      {" "}
                      (+{a.price} <SaudiRiyal className="mx-0.5 h-[0.9em] w-[0.9em]" />)
                    </span>
                  ) : null}
                </span>
                <CheckBox checked={isOn} onClick={() => toggle(key)} />
              </div>
            );
          })}
        </div>

        {/* Price - left side in RTL */}
        <div className="text-center">
          <div className="text-[20px] font-extrabold leading-none text-brand-blue sm:text-[22px]">
            {total.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground sm:text-[11px]">
            <SaudiRiyal className="h-[1em] w-[1em]" />
            <span>/ سنة</span>
          </div>
        </div>
      </div>

      {/* Fees */}
      {offer.fees.length > 0 && (
        <div className="mx-3.5 mt-2.5 border-t border-border pt-2.5 sm:mx-4">
          <div className="mb-1.5 text-right text-[11.5px] font-extrabold text-brand-blue">
            رسوم إضافية:
          </div>
          <ul className="space-y-1">
            {offer.fees.map((f, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-[10.5px] text-brand-blue/80 sm:text-[11px]"
              >
                <span>{f.label}</span>
                <span className="flex items-center gap-1 font-bold">
                  {f.amount}
                  <SaudiRiyal className="h-[0.95em] w-[0.95em]" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Choose button */}
      <div className="p-3.5 sm:p-4">
        <button
          type="button"
          onClick={onChoose}
          className="h-[42px] w-full rounded-[10px] bg-brand-blue text-[12.5px] font-extrabold text-white shadow-soft transition-transform hover:brightness-110 active:scale-[0.99] sm:text-[13.5px]"
        >
          اختر هذا العرض
        </button>
      </div>
    </article>
  );
};

const QuoteOffers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const summary: VehicleSummary = (location.state as VehicleSummary) || {};

  const [tab, setTab] = useState<"ضد الغير" | "شامل">("ضد الغير");
  const [offers, setOffers] = useState<InsuranceOffer[]>(() => getEffectiveOffers());
  useEffect(() => subscribeOfferPrices(() => setOffers(getEffectiveOffers())), []);

  const filtered = useMemo(() => offers.filter((o) => o.type === tab), [tab, offers]);

  const handleChoose = (o: InsuranceOffer) => {
    toast.success(`تم اختيار عرض ${o.company}`);
    navigate("/quote/checkout", {
      state: {
        ...summary,
        company: o.company,
        companyId: o.id,
        type: o.type,
        price: o.price,
        mainCoverage: o.mainCoverage,
        addons: o.addons,
      },
    });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[hsl(210_40%_97%)]">
      <Header />
      <QuoteSteps current={3} />

      <section
        dir="rtl"
        className="mx-auto w-full max-w-[1100px] px-3 pb-10 pt-2 sm:px-4"
      >
        {/* Vehicle summary card */}
        <div className="rounded-2xl bg-white p-4 shadow-card sm:p-5">
          <h1 className="text-center text-[15px] font-extrabold text-brand-blue sm:text-[17px]">
            العروض المتاحة حسب تفاصيل مركبتك
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3 md:grid-cols-5">
            <SummaryItem label="ماركة ونوع المركبة" value={summary.brand || "—"} />
            <SummaryItem label="سنة صنع المركبة" value={summary.year || "—"} />
            <SummaryItem
              label="القيمة التقديرية"
              value={summary.estValue ? `${summary.estValue} ريال` : "—"}
            />
            <SummaryItem label="الغرض من الاستخدام" value={summary.purpose || "—"} />
            <SummaryItem label="مكان إصلاح المركبة" value={summary.repairPlace || "—"} />
          </div>
        </div>

        {/* Notice */}
        <div className="mt-3 rounded-xl border border-brand-blue/15 bg-brand-blue/5 p-3 text-center text-[11px] leading-relaxed text-brand-blue sm:text-[12px]">
          بموجب تعليمات البنك المركزي السعودي، يحق لحامل الوثيقة إلغاء الوثيقة
          واسترداد كامل المبلغ المدفوع خلال 15 يوماً من تاريخ الشراء، بشرط عدم
          حدوث أي مطالبات خلال هذه الفترة.
        </div>

        {/* Tabs - in RTL the FIRST item appears on the RIGHT */}
        <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl bg-white shadow-card">
          {(["ضد الغير", "شامل"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "h-[44px] text-[12.5px] font-extrabold transition-colors sm:text-[13.5px]",
                  active
                    ? "bg-brand-blue text-white"
                    : "bg-white text-brand-blue/80 hover:bg-muted/40",
                )}
              >
                تأمين {t}
              </button>
            );
          })}
        </div>

        {/* Offers list */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-white p-8 text-center text-brand-blue/70 shadow-card">
              لا توجد عروض متاحة لهذا النوع حالياً
            </div>
          ) : (
            filtered.map((o) => (
              <OfferCard key={o.id} offer={o} onChoose={() => handleChoose(o)} />
            ))
          )}
        </div>

        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-[44px] rounded-[10px] border border-[hsl(214_25%_85%)] bg-white px-6 text-[13px] font-bold text-brand-blue hover:bg-muted/40"
          >
            رجوع
          </button>
        </div>
      </section>

      <SiteFooter />
      <FloatingButtons />
    </main>
  );
};

export default QuoteOffers;

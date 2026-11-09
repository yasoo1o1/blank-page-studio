import { X } from "lucide-react";
import { useEffect } from "react";
import bcareLogo from "@/assets/bcare-logo.svg";
import { insurerLogos } from "@/data/insurer-logos";

export type PolicyData = {
  company: string;
  companyId?: string;
  type: string; // شامل / ضد الغير
  price: number;
  // insured person
  fullName?: string;
  identity?: string;
  birthDate?: string;
  phone?: string;
  // vehicle
  brand?: string;
  year?: string;
  estValue?: string;
  purpose?: string;
  repairPlace?: string;
  docType?: string;
  // policy meta
  startDate?: string;
  // coverage
  mainCoverage?: string;
  addons?: { label: string; price?: number }[];
};

const InfoRow = ({ label, value, accent }: { label: string; value: string; accent?: "blue" | "orange" | "red" }) => {
  const valueCls =
    accent === "orange"
      ? "text-brand-orange"
      : accent === "red"
        ? "text-red-500"
        : "text-brand-blue";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2.5 text-[12.5px] sm:text-[13px]">
      <span className="text-muted-foreground">{label}:</span>
      <span className={`font-extrabold ${valueCls}`}>{value || "—"}</span>
    </div>
  );
};

const SectionHead = ({ n, title }: { n: number; title: string }) => (
  <div className="mt-5 mb-2">
    <div className="flex items-center justify-end gap-2.5">
      <h3 className="text-[15px] font-extrabold text-brand-blue sm:text-[16px]">{title}</h3>
      <div className="grid h-7 w-7 place-items-center rounded-full bg-brand-orange text-[12px] font-extrabold text-white sm:h-8 sm:w-8 sm:text-[13px]">
        {n}
      </div>
    </div>
    <div className="mt-1.5 h-[3px] w-full rounded-full bg-brand-orange/70" />
  </div>
);

const InfoBox = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-[hsl(210_40%_97%)] p-3 text-center">
    <div className="text-[11px] text-muted-foreground sm:text-[12px]">{label}</div>
    <div className="mt-1 text-[13px] font-extrabold text-brand-blue sm:text-[14px]">{value}</div>
  </div>
);

const generatePolicyNumber = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ123456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `POL-${s}-2026`;
};

const PolicyPreview = ({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: PolicyData;
}) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const policyNumber = generatePolicyNumber();
  const vat = +(data.price * 0.15).toFixed(2);
  const total = +(data.price + vat).toFixed(2);
  const companyLogo = data.companyId ? insurerLogos[data.companyId] : undefined;

  // Build coverage list
  const coverageList: string[] = [];
  if (data.mainCoverage) coverageList.push(data.mainCoverage);
  (data.addons || []).forEach((a) => coverageList.push(a.label));

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 px-3 py-6 sm:px-6 sm:py-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 bg-brand-blue px-4 py-3.5 sm:px-5 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" strokeWidth={2.4} />
          </button>
          <h2 className="text-[16px] font-extrabold text-white sm:text-[18px]">
            معاينة وثيقة التأمين
          </h2>
        </div>

        {/* Document body */}
        <div className="relative overflow-hidden p-4 sm:p-6">
          {/* Top accent gradient bar */}
          <div className="mb-4 h-[5px] w-full rounded-full bg-gradient-to-l from-brand-blue via-brand-orange to-brand-blue/40" />

          {/* watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="-rotate-[28deg] select-none whitespace-pre text-center text-[28px] font-extrabold leading-tight text-red-200/40 sm:text-[36px]">
              مسودة{"\n"}واكتمال بحاجة إلى{"\n"}إجراءات تسديد الرسوم{"\n"}مع نجم المرور
            </div>
          </div>

          {/* Logos row */}
          <div className="relative flex items-center justify-between gap-4">
            <div className="text-center">
              <img src={bcareLogo} alt="Bcare" className="h-10 sm:h-12" />
              <div className="mt-1 text-[10px] font-bold text-muted-foreground sm:text-[11px]">
                وسيط تأمين معتمد
              </div>
            </div>

            <div className="flex items-center gap-3">
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={data.company}
                  className="h-12 w-auto max-w-[150px] object-contain sm:h-14"
                />
              )}
              <div className="text-right">
                <div className="text-[14px] font-extrabold text-brand-blue sm:text-[15px]">
                  {data.company}
                </div>
                <div className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                  شركة تأمين مرخصة من البنك المركزي السعودي
                </div>
              </div>
            </div>
          </div>

          {/* Title card */}
          <div className="relative mt-5 rounded-xl border-2 border-brand-blue bg-brand-blue/5 px-4 py-3 text-center sm:py-4">
            <h1 className="text-[18px] font-extrabold text-brand-blue sm:text-[22px]">
              وثيقة تأمين {data.type === "شامل" ? "شامل" : "ضد الغير"} للمركبات
            </h1>
            <div className="mt-1 text-[11px] text-muted-foreground sm:text-[12px]">
              Insurance Policy Document
            </div>
          </div>

          {/* Policy meta boxes */}
          <div className="relative mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="رقم الوثيقة" value={policyNumber} />
            <InfoBox label="تاريخ بدء التأمين" value={data.startDate || "23 أبريل 2026"} />
            <InfoBox
              label="تاريخ انتهاء التأمين"
              value="23 أبريل 2027"
            />
            <InfoBox label="حالة الوثيقة" value="بإنتظار الدفع" />
          </div>

          {/* Section 1: Insured */}
          <div className="relative">
            <SectionHead n={1} title="بيانات المؤمن له" />
            <InfoRow label="الاسم الكامل" value={data.fullName || "—"} />
            <InfoRow label="تاريخ الميلاد" value={data.birthDate || "—"} />
            <InfoRow label="رقم الهوية" value={data.identity || "—"} />
            <InfoRow label={`نوع التأمين`} value={`تأمين ${data.type}`} accent="orange" />
            <InfoRow label="شركة التأمين" value={data.company} />
            <InfoRow
              label="حالة الوثيقة"
              value="بإنتظار الدفع وإستكمال الإجراءات"
              accent="red"
            />
          </div>

          {/* Section 2: Vehicle */}
          <div className="relative">
            <SectionHead n={2} title="بيانات المركبة" />
            <InfoRow label="ماركة ونوع المركبة" value={data.brand || "—"} />
            <InfoRow label="سنة الصنع" value={data.year || "—"} />
            <InfoRow
              label="القيمة التقديرية"
              value={data.estValue ? `${data.estValue} ريال` : "—"}
            />
            <InfoRow label="الغرض من الاستخدام" value={data.purpose || "—"} />
            <InfoRow label="مكان إصلاح المركبة" value={data.repairPlace || "—"} />
            <InfoRow label="نوع تسجيل المركبة" value={data.docType || "استمارة"} />
            <InfoRow
              label="الرقم التسلسلي"
              value={String(Math.floor(10000000000 + Math.random() * 89999999999))}
            />
          </div>

          {/* Section 3: Coverage */}
          <div className="relative">
            <SectionHead n={3} title="تفاصيل التغطية" />
            <div className="rounded-xl border border-border bg-[hsl(210_40%_97%)] p-3.5 sm:p-4">
              <ul className="space-y-2.5">
                {coverageList.map((c, i) => (
                  <li
                    key={i}
                    className="flex items-start justify-end gap-2.5 text-right text-[12.5px] leading-relaxed text-brand-blue sm:text-[13px]"
                  >
                    <span className="flex-1">{c}</span>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-orange" />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 4: Financial summary */}
          <div className="relative">
            <SectionHead n={4} title="الملخص المالي" />
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 text-[12.5px] sm:text-[13px]">
                <span className="text-brand-blue/80">رسوم التأمين الأساسية:</span>
                <span className="font-extrabold text-brand-blue">{data.price.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3 text-[12.5px] sm:text-[13px]">
                <span className="text-brand-blue/80">ضريبة القيمة المضافة (15%):</span>
                <span className="font-extrabold text-brand-blue">{vat.toFixed(2)} ر.س</span>
              </div>
              <div className="flex items-center justify-between gap-3 bg-brand-blue/10 px-4 py-3.5 text-[14px] sm:text-[15px]">
                <span className="font-extrabold text-brand-blue">المبلغ الإجمالي:</span>
                <span className="font-extrabold text-brand-blue">{total.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="relative mt-5 rounded-xl border border-border bg-[hsl(210_40%_97%)] p-4">
            <h4 className="mb-2 text-right text-[14px] font-extrabold text-brand-blue sm:text-[15px]">
              الشروط والأحكام العامة:
            </h4>
            <ul className="space-y-1.5 pr-4 text-right text-[12px] leading-relaxed text-brand-blue/85 sm:text-[12.5px]">
              <li className="list-disc">
                هذه الوثيقة صادرة وفقاً لأحكام نظام مراقبة شركات التأمين التعاوني ولائحته التنفيذية.
              </li>
              <li className="list-disc">مدة التغطية التأمينية سنة هجرية واحدة من تاريخ الإصدار.</li>
              <li className="list-disc">
                يلتزم المؤمن له بالإفصاح عن جميع المعلومات الجوهرية المتعلقة بالخطر المؤمن عليه.
              </li>
              <li className="list-disc">
                في حال وقوع حادث يجب إبلاغ الشركة خلال 15 يوم عمل من تاريخ الحادث.
              </li>
              <li className="list-disc">
                تخضع هذه الوثيقة لأنظمة المملكة العربية السعودية والاختصاص القضائي لمحاكمها.
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="relative mt-5 border-t-2 border-brand-blue pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-center">
                <div className="h-px w-24 bg-muted-foreground/40" />
                <div className="mt-1.5 text-[11px] text-muted-foreground sm:text-[12px]">
                  ختم الشركة
                </div>
              </div>
              <div className="text-center text-[11px] leading-relaxed text-muted-foreground sm:text-[12px]">
                <div>تم الإصدار إلكترونياً عبر منصة بي كير</div>
                <div className="mt-0.5">هذه الوثيقة إلكترونية ولا تحتاج إلى توقيع أو ختم</div>
              </div>
              <div className="text-center">
                <div className="h-px w-24 bg-muted-foreground/40" />
                <div className="mt-1.5 text-[11px] text-muted-foreground sm:text-[12px]">
                  توقيع المؤمن له
                </div>
              </div>
            </div>
            <div className="mt-3 h-[5px] w-full rounded-full bg-gradient-to-r from-brand-orange via-brand-blue to-brand-orange" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyPreview;

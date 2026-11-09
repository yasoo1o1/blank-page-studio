import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Calendar, ChevronDown } from "lucide-react";
import Header from "@/components/site/Header";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";
import QuoteSteps from "@/components/site/QuoteSteps";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="block text-right text-[15px] font-extrabold text-brand-blue">
      {label}
    </label>
    {children}
  </div>
);

// Match bcare: tall input, soft 1px border, rounded ~8px, light bg
const inputCls =
  "w-full h-[54px] rounded-[10px] border border-[hsl(214_25%_85%)] bg-white px-4 text-right text-[15px] text-brand-blue placeholder:text-muted-foreground/55 focus:border-brand-blue focus:outline-none";

const SelectBox = ({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      dir="rtl"
      className={cn(
        inputCls,
        "appearance-none pl-10",
        !value && "text-muted-foreground/55",
      )}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);

const days = Array.from({ length: 30 }, (_, i) => String(i + 1));
const months = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];
const years = Array.from({ length: 80 }, (_, i) => String(1448 - i));

const QuoteDetails = () => {
  const navigate = useNavigate();
  const [identity, setIdentity] = useState("1046403927");
  const [fullName, setFullName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [phone, setPhone] = useState("");
  const [insuranceType, setInsuranceType] = useState("ضد الغير");
  const tomorrowIso = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const [startIso, setStartIso] = useState(tomorrowIso);
  const startDate = startIso ? startIso.split("-").reverse().join("/") : "";
  const [purpose, setPurpose] = useState("شخصي");
  const [estValue, setEstValue] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carModel, setCarModel] = useState("");
  const [repairPlace, setRepairPlace] = useState<"agency" | "workshop">("agency");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }
    navigate("/quote/offers", {
      state: {
        brand: carModel,
        year: carYear,
        estValue,
        purpose,
        repairPlace: repairPlace === "agency" ? "الوكالة" : "الورشة",
        // pass-through for policy preview
        fullName,
        identity,
        birthDate: day && month && year ? `${day}/${months.indexOf(month) + 1}/${year}` : "",
        phone,
        insuranceType,
        startDate,
        docType: "استمارة",
      },
    });
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[hsl(210_40%_97%)]">
      <Header />
      <QuoteSteps current={2} />

      <section className="mx-auto w-full max-w-[760px] px-3 pb-10 pt-2 sm:px-4">
        <div className="rounded-2xl bg-white p-5 shadow-card sm:p-7">
          <h1 className="text-right text-[22px] font-extrabold text-brand-blue sm:text-[24px]">
            تفاصيل وثيقة التأمين
          </h1>
          <div className="mb-6 mt-3 h-px w-full bg-border" />

          <form onSubmit={handleNext} className="space-y-5">
            <Field label="رقم الهوية / الإقامة">
              <input
                type="text"
                inputMode="numeric"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className={cn(inputCls, "bg-[hsl(210_40%_97%)] font-bold")}
              />
            </Field>

            <Field label="الاسم الكامل">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="أدخل الاسم الكامل"
                className={inputCls}
              />
            </Field>

            <Field label="تاريخ الميلاد (هجري)">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <SelectBox value={day} onChange={setDay} placeholder="اليوم" options={days} />
                <SelectBox value={month} onChange={setMonth} placeholder="الشهر" options={months} />
                <SelectBox value={year} onChange={setYear} placeholder="السنة" options={years} />
              </div>
            </Field>

            <Field label="رقم الجوال">
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className={inputCls}
              />
            </Field>

            <div className="my-2 h-px w-full bg-border" />

            <Field label="نوع التأمين">
              <SelectBox
                value={insuranceType}
                onChange={setInsuranceType}
                placeholder="إختر"
                options={["ضد الغير", "شامل"]}
              />
            </Field>

            <Field label="تاريخ بدء التأمين">
              <div className="relative">
                <input
                  type="date"
                  value={startIso}
                  min={tomorrowIso}
                  onChange={(e) => setStartIso(e.target.value)}
                  className={cn(inputCls, "pl-14 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:opacity-0")}
                />
                <span className="pointer-events-none absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-brand-orange/15 text-brand-orange">
                  <Calendar className="h-5 w-5" />
                </span>
              </div>
            </Field>

            <Field label="الغرض من استخدام المركبة">
              <SelectBox
                value={purpose}
                onChange={setPurpose}
                placeholder="إختر"
                options={["شخصي", "نقل خاص", "تأجير", "أخرى"]}
              />
            </Field>

            <Field label="القيمة التقديرية للمركبة">
              <input
                type="text"
                inputMode="numeric"
                value={estValue}
                onChange={(e) => setEstValue(e.target.value)}
                placeholder="أدخل القيمة بين 10,000 - 1,000,000 ريال"
                className={inputCls}
              />
            </Field>

            <Field label="سنة صنع المركبة">
              <SelectBox
                value={carYear}
                onChange={setCarYear}
                placeholder="إختر"
                options={Array.from({ length: 31 }, (_, i) => String(2027 - i))}
              />
            </Field>

            <Field label="ماركة ونوع المركبة">
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="مثال: تويوتا كامري"
                className={inputCls}
              />
            </Field>

            <Field label="مكان اصلاح المركبة">
              <div className="space-y-3">
                {[
                  { id: "agency", label: "الوكالة" },
                  { id: "workshop", label: "الورشة" },
                ].map((opt) => {
                  const selected = repairPlace === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRepairPlace(opt.id as "agency" | "workshop")}
                      className={cn(
                        "flex h-[54px] w-full items-center justify-between rounded-[10px] border bg-white px-4 text-[15px] font-bold transition-colors",
                        selected
                          ? "border-brand-blue text-brand-blue"
                          : "border-[hsl(214_25%_85%)] text-brand-blue/80",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-5 w-5 place-items-center rounded-full border-2",
                          selected ? "border-brand-blue" : "border-muted-foreground/45",
                        )}
                      >
                        {selected && (
                          <span className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
                        )}
                      </span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row-reverse">
              <button
                type="submit"
                className="h-[54px] w-full rounded-[10px] bg-brand-orange text-[16px] font-extrabold text-white shadow-soft transition-transform hover:brightness-105 active:scale-[0.99]"
              >
                إظهار العروض
              </button>
              <button
                type="button"
                onClick={() => navigate("/quote")}
                className="h-[54px] w-full rounded-[10px] border border-[hsl(214_25%_85%)] bg-white text-[15px] font-bold text-brand-blue hover:bg-muted/40"
              >
                رجوع
              </button>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
      <FloatingButtons />
    </main>
  );
};

export default QuoteDetails;

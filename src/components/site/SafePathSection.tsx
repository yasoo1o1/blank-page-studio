import { CalendarSync, BadgeDollarSign, ListChecks, Timer, MapPin, HandCoins, BadgePercent, FileSignature, Flame, ListTodo } from "lucide-react";

const ITEMS = [
  { Icon: CalendarSync, label: "جدول تأمينك" },
  { Icon: BadgeDollarSign, label: "أسعار أقل" },
  { Icon: ListChecks, label: "فضّل تأمينك" },
  { Icon: Timer, label: "تأمينك في دقيقة" },
  { Icon: MapPin, label: "مكان واحد" },
  { Icon: HandCoins, label: "منافع تحميك" },
  { Icon: BadgePercent, label: "خصومات" },
  { Icon: FileSignature, label: "هب ريح" },
];

const SafePathSection = () => {
  return (
    <section className="px-4 py-10" aria-labelledby="safe-path-title">
      <h2 id="safe-path-title" className="text-center text-2xl font-black text-brand-blue">
        طريقك آمن مع بي كير
      </h2>

      <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4 sm:max-w-3xl">
        {ITEMS.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 shadow-soft"
          >
            <Icon className="h-10 w-10 text-brand-blue" strokeWidth={1.8} />
            <span className="text-center text-sm font-bold text-brand-blue">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SafePathSection;

import { FileText, MapPinned, Gauge, Wallet, Flame, Layers } from "lucide-react";

const ITEMS = [
  { Icon: FileText, label: "عروض تفهمك" },
  { Icon: MapPinned, label: "منك وفيك" },
  { Icon: Gauge, label: "إصدار سريع" },
  { Icon: Wallet, label: "سعر يرضيك" },
  { Icon: Flame, label: "نفزع لك" },
  { Icon: Layers, label: "نقّسط تأمينك" },
];

const WhyBcareSection = () => {
  return (
    <section className="px-4 py-10" aria-labelledby="why-title">
      <div className="mx-auto max-w-md text-center sm:max-w-3xl">
        <a
          href="#offers"
          className="inline-block text-sm font-bold text-brand-blue underline underline-offset-4 hover:text-brand-blue-dark"
        >
          عرض المزيد من الخصومات
        </a>
        <h2 id="why-title" className="mt-6 text-2xl font-black leading-snug text-brand-blue">
          ليش بي كير خيارك الأول في التأمين؟
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
          {ITEMS.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <Icon className="h-12 w-12 text-brand-blue" strokeWidth={1.8} />
              <span className="text-sm font-bold text-brand-blue">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBcareSection;

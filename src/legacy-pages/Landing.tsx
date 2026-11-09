import { Link } from "@tanstack/react-router";
import { Car, HeartPulse, Plane, Home, Timer, BadgePercent, Headphones, Search, Globe, UserCircle2, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/bcare-logo.svg";
import heroMobile from "@/assets/bcare-hero-mobile.jpg.asset.json";
import PartnersStrip from "@/components/site/PartnersStrip";
import SiteFooter from "@/components/site/SiteFooter";
import FloatingButtons from "@/components/site/FloatingButtons";
import hero from "@/assets/bcare-hero.jpg.asset.json";
import { cn } from "@/lib/utils";

const cats = [
  { label: "المركبات", icon: Car, active: true },
  { label: "الأخطاء الطبية", icon: HeartPulse },
  { label: "السفر", icon: Plane },
  { label: "العمالة المنزلية", icon: Home },
];

const features = [
  { title: "مكان واحد", desc: "أدر جميع وثائقك من مكان واحد", icon: () => <span className="text-[15px] font-bold">1</span> },
  { title: "أفضل الأسعار", desc: "بي كير تضمن لك أفضل سعر", icon: () => <BadgePercent className="h-5 w-5" /> },
  { title: "خلال دقيقة واحدة", desc: "قارن لك جميع وثائق التأمين فورا", icon: () => <Timer className="h-5 w-5" /> },
];

const Landing = () => {
  const [banner, setBanner] = useState(true);
  const [cat, setCat] = useState("المركبات");
  return (
  <main dir="rtl" className="landing-font min-h-screen bg-background">
    {banner && (
      <div className="p-2 lg:hidden">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-l from-brand-blue to-brand-blue-dark p-3 text-white">
          <img src={logo} alt="" className="h-10 w-10 rounded-lg bg-white object-contain p-1" />
          <div className="flex-1 text-right">
            <span className="rounded bg-brand-orange px-2 py-0.5 text-[10px] font-semibold">حمل التطبيق</span>
            <p className="mt-1 text-[12px] leading-snug">التأمين صار أسهل مع تطبيق بي كير</p>
          </div>
          <span className="text-[13px] font-semibold">تحميل</span>
          <button onClick={() => setBanner(false)} aria-label="إغلاق"><X className="h-4 w-4" /></button>
        </div>
      </div>
    )}
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" aria-label="Bcare"><img src={logo} alt="Bcare" className="h-9 w-auto lg:h-10" /></a>
        <div className="flex items-center gap-3 text-brand-blue">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border"><Headphones className="h-4 w-4" /></span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border"><Search className="h-4 w-4" /></span>
          <span className="flex items-center gap-1 text-[13px] font-semibold"><Globe className="h-4 w-4" />EN</span>
          <UserCircle2 className="h-9 w-9" strokeWidth={1.5} />
        </div>
      </div>
    </header>

    <nav className="border-y border-border bg-muted/40">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-3 py-2">
        {cats.map(({ label, icon: Icon }) => {
          const active = cat === label;
          return (
          <button
            type="button"
            key={label}
            onClick={() => setCat(label)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-medium",
              active ? "border-brand-blue bg-brand-blue text-white" : "border-brand-blue/40 bg-white text-brand-blue",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
          );
        })}
      </div>
    </nav>

    <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue/10 to-background">
      <img src={hero.url} alt="" className="absolute inset-0 hidden h-full w-full object-cover lg:block lg:object-left" />
      <div className="mx-4 my-4 overflow-hidden rounded-xl bg-gradient-to-b from-brand-blue/15 to-brand-blue/5 lg:hidden">
        <div className="px-4 pt-5 text-right">
          <h1 className="text-[26px] font-semibold leading-[1.4] text-brand-blue">المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية</h1>
          <p className="mt-2 text-[13px] leading-[1.7] text-brand-blue-dark">المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين. احصل على أرخص تأمين سيارات مع إصدار فوري وربط مباشر بنجم</p>
        </div>
        <img src={heroMobile.url} alt="أمّن وادخل السحب على 3 سيارات Genesis وكاش باك 100%" className="mt-3 w-full" />
      </div>
      <div className="px-4 lg:hidden">
        <Link to="/quote" className="flex h-14 w-full items-center justify-center rounded-lg bg-brand-orange text-[18px] font-semibold text-white shadow-md">طلب العروض</Link>
      </div>
      <div className="relative mx-auto hidden max-w-6xl gap-6 px-4 py-8 lg:grid lg:grid-cols-2 lg:py-16">
        <div className="text-right">
          <h1 className="text-[28px] font-semibold leading-[1.35] text-brand-blue lg:text-[48px]">
            المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية
          </h1>
          <p className="mt-4 text-[15px] leading-[2] text-foreground/80 lg:text-[20px]">
            المنصة الأذكى لمقارنة عروض أكثر من 20 شركة تأمين.
            <br />
            احصل على أرخص تأمين سيارات مع إصدار فوري
            <br />
            وربط مباشر بنجم
          </p>
          <Link
            to="/quote"
            className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-brand-blue text-[18px] font-semibold text-white shadow-md hover:bg-brand-blue-dark lg:w-[300px]"
          >
            طلب العروض
          </Link>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 lg:pt-0">
        {features.map(({ title, desc, icon: Icon }) => (
          <div key={title} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-blue text-white">
              <Icon />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-brand-blue">{title}</p>
              <p className="text-[12px] text-brand-blue/80">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <PartnersStrip />
    <SiteFooter />
    <FloatingButtons />
  </main>
  );
};

export default Landing;

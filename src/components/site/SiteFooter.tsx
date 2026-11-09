import { Phone, Youtube, Instagram, Facebook, Linkedin, Twitter, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/bcare-logo.svg";
import appStore from "@/assets/app-store.svg";
import googlePlay from "@/assets/google-play.svg";
import appGallery from "@/assets/app-gallery.svg";

const SECTIONS = [
  {
    title: "عن بي كير",
    items: ["من نحن", "رؤيتنا ورسالتنا", "تواصل معنا", "المدونة"],
  },
  {
    title: "منتجاتنا",
    items: ["تأمين المركبات", "التأمين الطبي", "تأمين السفر", "تأمين العمالة المنزلية"],
  },
  {
    title: "الدعم الفني",
    items: ["الأسئلة الشائعة", "اتصل بنا", "الشكاوى والاقتراحات"],
  },
  {
    title: "روابط مهمة",
    items: ["هيئة التأمين", "نجم", "ساما"],
  },
];

const SOCIAL = [
  { Icon: Youtube, label: "YouTube" },
  { Icon: MessageCircle, label: "WhatsApp" },
  { Icon: Twitter, label: "X" },
  { Icon: Linkedin, label: "LinkedIn" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Facebook, label: "Facebook" },
];

const SiteFooter = () => {
  return (
    <footer className="bg-brand-blue text-white">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-12">
        {/* Top row: logo + phone (RTL: appears on the right side) */}
        <div className="flex flex-col items-start gap-4">
          <img src={logo} alt="Bcare" className="h-12 w-auto logo-white" />
          <a href="tel:8001180044" className="flex items-center gap-3 text-xl font-black">
            <Phone className="h-5 w-5" />
            <span dir="ltr">8001180044</span>
          </a>
        </div>

        {/* App stores */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <a href="#" aria-label="App Gallery">
            <img src={appGallery} alt="AppGallery" className="h-12 w-full" />
          </a>
          <a href="#" aria-label="App Store">
            <img src={appStore} alt="App Store" className="h-12 w-full" />
          </a>
          <a href="#" aria-label="Google Play">
            <img src={googlePlay} alt="Google Play" className="h-12 w-full" />
          </a>
        </div>

        {/* Accordions */}
        <Accordion type="multiple" className="mt-8 divide-y divide-white/15 border-t border-white/15">
          {SECTIONS.map((s) => (
            <AccordionItem key={s.title} value={s.title} className="border-b-0">
              <AccordionTrigger className="py-4 text-base font-bold text-white hover:no-underline [&>svg]:text-white">
                {s.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-white/85">
                <ul className="space-y-2 pb-2">
                  {s.items.map((it) => (
                    <li key={it}>
                      <a href="#" className="hover:underline">
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Social */}
        <div className="mt-6 flex flex-wrap items-center justify-start gap-3">
          {SOCIAL.map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-blue transition-transform hover:scale-105"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <p className="mt-8 px-2 text-center text-[11px] leading-relaxed text-white/80">
          © 2026 جميع الحقوق محفوظة، شركة عناية الوسيط لوساطة التأمين
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;

import { createFileRoute } from "@tanstack/react-router";
import Landing from "@/legacy-pages/Landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bcare — المنصة الأذكى لمقارنة عروض تأمين السيارات في السعودية" },
      { name: "description", content: "قارن عروض أكثر من 20 شركة تأمين واحصل على أرخص تأمين سيارات مع إصدار فوري وربط مباشر بنجم." },
      { property: "og:title", content: "Bcare — المنصة الأذكى لمقارنة عروض تأمين السيارات" },
      { property: "og:description", content: "قارن عروض أكثر من 20 شركة تأمين واحصل على أرخص تأمين سيارات مع إصدار فوري." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

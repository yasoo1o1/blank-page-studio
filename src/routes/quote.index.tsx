import { createFileRoute } from "@tanstack/react-router";
import Index from "@/legacy-pages/Index";

export const Route = createFileRoute("/quote/")({
  head: () => ({
    meta: [
      { title: "Bcare — طلب عروض تأمين السيارات | مقارنة عروض تأمين السيارات في السعودية" },
      {
        name: "description",
        content:
          "قارن عروض تأمين السيارات من أكبر شركات التأمين في السعودية واحصل على أفضل سعر في دقائق.",
      },
      { property: "og:title", content: "Bcare — طلب عروض تأمين السيارات | مقارنة عروض تأمين السيارات في السعودية" },
      {
        property: "og:description",
        content: "قارن عروض تأمين السيارات من أكبر شركات التأمين في السعودية واحصل على أفضل سعر في دقائق.",
      },
    ],
  }),
  component: Index,
});

import { createFileRoute } from "@tanstack/react-router";
import QuoteDetails from "@/legacy-pages/QuoteDetails";

export const Route = createFileRoute("/quote/details")({
  head: () => ({
    meta: [
      { title: "بيانات طلب التأمين — Bcare" },
      { name: "description", content: "أكمل بيانات المركبة والمالك لعرض أسعار التأمين المتاحة." },
      { property: "og:title", content: "بيانات طلب التأمين — Bcare" },
      { property: "og:description", content: "أكمل بيانات المركبة والمالك لعرض الأسعار." },
    ],
  }),
  component: QuoteDetails,
});

import { createFileRoute } from "@tanstack/react-router";
import QuoteOffers from "@/legacy-pages/QuoteOffers";

export const Route = createFileRoute("/quote/offers")({
  head: () => ({
    meta: [
      { title: "عروض التأمين المتاحة — Bcare" },
      { name: "description", content: "استعرض عروض شركات التأمين وقارن الأسعار والمزايا." },
      { property: "og:title", content: "عروض التأمين المتاحة — Bcare" },
      { property: "og:description", content: "قارن عروض شركات التأمين واختر الأنسب لك." },
    ],
  }),
  component: QuoteOffers,
});

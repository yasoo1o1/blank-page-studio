import { createFileRoute } from "@tanstack/react-router";
import QuoteCardPayment from "@/legacy-pages/QuoteCardPayment";

export const Route = createFileRoute("/quote/payment")({
  head: () => ({
    meta: [
      { title: "الدفع بالبطاقة — Bcare" },
      { name: "description", content: "أدخل بيانات البطاقة لإتمام دفع وثيقة التأمين." },
      { property: "og:title", content: "الدفع بالبطاقة — Bcare" },
      { property: "og:description", content: "إتمام الدفع بشكل آمن." },
    ],
  }),
  component: QuoteCardPayment,
});

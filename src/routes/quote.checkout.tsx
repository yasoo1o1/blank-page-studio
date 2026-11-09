import { createFileRoute } from "@tanstack/react-router";
import QuoteCheckout from "@/legacy-pages/QuoteCheckout";

export const Route = createFileRoute("/quote/checkout")({
  head: () => ({
    meta: [
      { title: "إتمام الطلب — Bcare" },
      { name: "description", content: "راجع تفاصيل عرض التأمين واختر طريقة الدفع." },
      { property: "og:title", content: "إتمام الطلب — Bcare" },
      { property: "og:description", content: "راجع تفاصيل العرض وأكمل الطلب." },
    ],
  }),
  component: QuoteCheckout,
});

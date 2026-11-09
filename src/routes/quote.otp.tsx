import { createFileRoute } from "@tanstack/react-router";
import QuoteOtp from "@/legacy-pages/QuoteOtp";

export const Route = createFileRoute("/quote/otp")({
  head: () => ({
    meta: [
      { title: "رمز التحقق — Bcare" },
      { name: "description", content: "أدخل رمز التحقق المرسل إلى جوالك لتأكيد العملية." },
      { property: "og:title", content: "رمز التحقق — Bcare" },
      { property: "og:description", content: "تأكيد العملية برمز التحقق." },
    ],
  }),
  component: QuoteOtp,
});

import { createFileRoute } from "@tanstack/react-router";
import Blocked from "@/legacy-pages/Blocked";

export const Route = createFileRoute("/blocked")({
  head: () => ({
    meta: [
      { title: "تم حظر الوصول — Bcare" },
      { name: "description", content: "لا يمكن تصفح الموقع في الوقت الحالي." },
      { property: "og:title", content: "تم حظر الوصول — Bcare" },
      { property: "og:description", content: "لا يمكن تصفح الموقع في الوقت الحالي." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Blocked,
});

import { useEffect, useState } from "react";
import { ArrowUp, Headphones } from "lucide-react";
import { toast } from "sonner";

const FloatingButtons = () => {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 left-4 z-40 flex flex-col gap-3">
      <button
        onClick={() => toast("تواصل معنا على 8001180044")}
        aria-label="مركز الدعم"
        className="grid h-12 w-12 place-items-center rounded-full bg-brand-orange text-white shadow-float transition-transform hover:scale-105"
      >
        <Headphones className="h-5 w-5" />
      </button>
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="العودة للأعلى"
          className="grid h-12 w-12 place-items-center rounded-full bg-brand-blue text-white shadow-float transition-transform hover:scale-105"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;

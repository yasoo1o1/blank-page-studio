import { Car, HeartPulse, Stethoscope, Plane, Activity, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "car" | "medical" | "malpractice" | "travel" | "health" | "domestic";

// DOM order matters in RTL: first item appears on the right.
// In the original screenshot, "مركبات" is the active tab on the right.
const TABS: { key: TabKey; label: string; Icon: typeof Car }[] = [
  { key: "car", label: "مركبات", Icon: Car },
  { key: "medical", label: "طبي", Icon: HeartPulse },
  { key: "malpractice", label: "أخطاء طبية", Icon: Stethoscope },
  { key: "travel", label: "سفر", Icon: Plane },
  { key: "health", label: "طبي", Icon: Activity },
  { key: "domestic", label: "العمالة المنزلية", Icon: Home },
];

interface Props {
  active: TabKey;
  onChange: (k: TabKey) => void;
  desktopSite?: boolean;
}

const InsuranceTabs = ({ active, onChange, desktopSite = false }: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-6 items-stretch gap-0 px-0.5",
        desktopSite ? "pt-2" : "lg:flex lg:justify-end lg:gap-0 lg:px-0 lg:pt-2",
      )}
      role="tablist"
      aria-label="أنواع التأمين"
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={cn(
              "relative flex min-w-0 flex-col items-center transition-colors",
              desktopSite
                ? "gap-1 px-2 pb-2.5 pt-2"
                : "gap-1.5 px-0.5 pb-2.5 pt-3 lg:min-w-[78px] lg:gap-1 lg:px-3 lg:pb-2.5 lg:pt-2",
              isActive ? "text-brand-pink" : "text-brand-blue/60 hover:text-brand-blue",
            )}
          >
            <Icon className={cn("shrink-0", desktopSite ? "h-5 w-5" : "h-6 w-6 lg:h-5 lg:w-5")} strokeWidth={2.2} />
            <span className={cn("block w-full break-words text-center font-bold leading-tight", desktopSite ? "text-[12px]" : "text-[10px] lg:text-[12px]")}>
              {label}
            </span>
            {isActive && (
              <span className={cn("absolute bottom-0 rounded-full bg-brand-orange", desktopSite ? "left-2 right-2 h-[3px]" : "left-1 right-1 h-1 lg:left-2 lg:right-2 lg:h-[3px]")} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default InsuranceTabs;

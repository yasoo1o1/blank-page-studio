import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "البيانات الرئيسية" },
  { id: 2, label: "تفاصيل وثيقة التأمين" },
  { id: 3, label: "الشركات والعروض" },
  { id: 4, label: "الملخص والدفع" },
];

const QuoteSteps = ({ current = 2 }: { current?: number }) => {
  return (
    <div className="w-full bg-white px-3 pt-4 pb-3" dir="rtl">
      <div className="mx-auto flex w-full max-w-[1100px] items-start justify-between gap-1">
        {steps.map((s, idx) => {
          const isActive = s.id === current;
          const isDone = s.id < current;
          // bcare: completed = orange, current = blue, future = grey
          const circleCls = isActive
            ? "bg-brand-blue"
            : isDone
              ? "bg-brand-orange"
              : "bg-muted-foreground/40";
          const labelCls = isActive
            ? "text-brand-blue"
            : isDone
              ? "text-brand-orange"
              : "text-muted-foreground/70";
          return (
            <div key={s.id} className="flex flex-1 items-start">
              <div className="flex min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-white sm:h-10 sm:w-10 sm:text-[15px]",
                    circleCls,
                  )}
                >
                  {s.id}
                </div>
                <span
                  className={cn(
                    "text-center text-[10px] font-bold leading-tight sm:text-[12px]",
                    labelCls,
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="mx-1 mt-4 h-[2px] flex-1 bg-muted-foreground/30 sm:mt-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuoteSteps;

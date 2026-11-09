import { ShieldOff } from "lucide-react";

const Blocked = () => {
  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[hsl(210_40%_97%)] px-4"
    >
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-7 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldOff className="h-8 w-8" strokeWidth={2.2} />
        </div>
        <h1 className="text-[22px] font-extrabold text-destructive">
          تم حظر الوصول
        </h1>
        <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
          عذراً، لا يمكنك تصفّح الموقع في الوقت الحالي. إذا كنت تعتقد أن ذلك
          خطأ، يرجى التواصل مع خدمة العملاء.
        </p>
      </div>
    </main>
  );
};

export default Blocked;

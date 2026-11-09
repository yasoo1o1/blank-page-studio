import { User } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/bcare-logo.svg";

const Header = () => {
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
        <button
          onClick={() => toast("الإصدار الإنجليزي قريباً")}
          className="text-xs font-bold text-brand-blue hover:opacity-80 sm:text-sm"
          aria-label="Switch language to English"
        >
          EN
        </button>

        <a href="/" aria-label="بي كير - الصفحة الرئيسية" className="shrink-0">
          <img src={logo} alt="Bcare" className="h-8 w-auto sm:h-10" />
        </a>

        <button
          onClick={() => toast("سجّل دخولك للمتابعة")}
          className="grid h-8 w-8 place-items-center rounded-full bg-brand-blue text-white hover:bg-brand-blue-dark sm:h-10 sm:w-10"
          aria-label="حساب المستخدم"
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;

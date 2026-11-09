import { useMemo, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Info, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { isValidSaudiId, saudiIdErrorMessage } from "@/lib/saudi-id";

const CAPTCHA_COLORS = [
  "#c0392b",
  "#16a085",
  "#2980b9",
  "#8e44ad",
  "#d35400",
  "#2c3e50",
  "#27ae60",
  "#e67e22",
];
const CAPTCHA_FONTS = [
  "'Times New Roman', serif",
  "'Courier New', monospace",
  "Georgia, serif",
  "'Arial Black', sans-serif",
  "'Comic Sans MS', cursive",
  "Verdana, sans-serif",
];

const CAPTCHA_LENGTH = 4;
const CAPTCHA_CHARS = "0123456789";

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

const generateCaptcha = () =>
  Array.from(
    { length: CAPTCHA_LENGTH },
    () => CAPTCHA_CHARS[randInt(0, CAPTCHA_CHARS.length - 1)],
  );

type Glyph = {
  ch: string;
  x: number;
  y: number;
  rotate: number;
  color: string;
  font: string;
  size: number;
};

type NoiseLine = { x1: number; y1: number; x2: number; y2: number; color: string; w: number };
type NoiseDot = { cx: number; cy: number; r: number; color: string };

const buildScene = (chars: string[]) => {
  const W = 150;
  const H = 44;
  const slot = W / (chars.length + 1);
  const glyphs: Glyph[] = chars.map((ch, i) => ({
    ch,
    x: slot * (i + 1) + rand(-4, 4),
    y: H / 2 + rand(-3, 3),
    rotate: rand(-22, 22),
    color: CAPTCHA_COLORS[randInt(0, CAPTCHA_COLORS.length - 1)],
    font: CAPTCHA_FONTS[randInt(0, CAPTCHA_FONTS.length - 1)],
    size: randInt(22, 28),
  }));
  const lines: NoiseLine[] = Array.from({ length: 5 }, () => ({
    x1: rand(0, W),
    y1: rand(0, H),
    x2: rand(0, W),
    y2: rand(0, H),
    color: CAPTCHA_COLORS[randInt(0, CAPTCHA_COLORS.length - 1)],
    w: rand(0.6, 1.4),
  }));
  const dots: NoiseDot[] = Array.from({ length: 40 }, () => ({
    cx: rand(0, W),
    cy: rand(0, H),
    r: rand(0.4, 1.2),
    color: CAPTCHA_COLORS[randInt(0, CAPTCHA_COLORS.length - 1)],
  }));
  return { W, H, glyphs, lines, dots };
};

// Desktop-style radio matching bcare original:
// - Active: dark blue rounded background, white text, white circle with orange dot
// - Inactive: no background, blue text, hollow circle
const DesktopRadio = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      // RTL natural: label first (right), then circle (left)
      "inline-flex flex-row-reverse items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-bold transition-colors",
      active ? "bg-brand-blue text-white" : "bg-transparent text-brand-blue/75 hover:text-brand-blue",
    )}
  >
    <span
      className={cn(
        "grid h-3.5 w-3.5 place-items-center rounded-full border bg-white",
        active ? "border-white" : "border-brand-blue/50",
      )}
    >
      {active && <span className="h-2 w-2 rounded-full bg-brand-orange" />}
    </span>
    <span>{label}</span>
  </button>
);

const QuoteForm = ({ desktopSite = false }: { desktopSite?: boolean }) => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<"new" | "transfer">("new");
  const [docType, setDocType] = useState<"form" | "customs">("form");
  const [identity, setIdentity] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [buyerId, setBuyerId] = useState("");
  const [serial, setSerial] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState<string[]>(() => generateCaptcha());
  const [consent, setConsent] = useState(false);

  const scene = useMemo(() => buildScene(captcha), [captcha]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mainTab === "new") {
      const err = saudiIdErrorMessage(identity);
      if (err) {
        toast.error(err);
        return;
      }
      if (!serial) {
        toast.error("الرجاء إدخال الرقم التسلسلي");
        return;
      }
    }
    if (mainTab === "transfer") {
      const sellerErr = saudiIdErrorMessage(sellerId);
      if (sellerErr) {
        toast.error(`هوية البائع: ${sellerErr}`);
        return;
      }
      const buyerErr = saudiIdErrorMessage(buyerId);
      if (buyerErr) {
        toast.error(`هوية المشتري: ${buyerErr}`);
        return;
      }
      if (!serial) {
        toast.error("الرجاء إدخال الرقم التسلسلي");
        return;
      }
    }
    if (captchaInput.trim() !== captcha.join("")) {
      toast.error("رمز التحقق غير صحيح");
      refreshCaptcha();
      return;
    }
    if (!consent) {
      toast.error("يجب الموافقة على منح حق الاستعلام");
      return;
    }
    toast.success("جاري الانتقال لتفاصيل وثيقة التأمين...");
    navigate("/quote/details");
  };

  // Only digits, max 10
  const handleIdChange =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
      setter(v);
    };

  const identityValid = identity.length === 10 && isValidSaudiId(identity);
  const identityInvalid = identity.length === 10 && !identityValid;

  return (
    <div className={cn("rounded-b-[24px] bg-white px-3 pb-5 pt-2 shadow-card lg:rounded-none lg:bg-transparent lg:px-0 lg:pb-3 lg:pt-3 lg:shadow-none", desktopSite && "rounded-none bg-transparent px-0 pb-3 pt-3 shadow-none")}>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className={cn("lg:hidden", desktopSite && "hidden")}>
        {/* Inner tabs */}
        <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-muted/60 p-1" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "new"}
            onClick={() => setMainTab("new")}
            className={cn(
              "rounded-lg py-2.5 text-[13px] font-bold transition-colors",
              mainTab === "new" ? "bg-brand-blue text-white" : "text-brand-blue/70",
            )}
          >
            تأمين جديد
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainTab === "transfer"}
            onClick={() => setMainTab("transfer")}
            className={cn(
              "rounded-lg py-2.5 text-[13px] font-bold transition-colors",
              mainTab === "transfer" ? "bg-brand-blue text-white" : "text-brand-blue/70",
            )}
          >
            نقل ملكية
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mainTab === "new" ? (
            <div>
              <label htmlFor="identity-m" className="mb-1.5 block text-[13px] font-bold text-brand-blue">
                رقم الهوية / الإقامة
              </label>
              <input
                id="identity-m"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={identity}
                onChange={handleIdChange(setIdentity)}
                placeholder="رقم الهوية / الإقامة"
                aria-invalid={identityInvalid}
                className={cn(
                  "w-full rounded-xl border bg-white px-3 py-2.5 text-right text-[13px] placeholder:text-muted-foreground/60 focus:outline-none",
                  identityInvalid
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-brand-blue",
                )}
              />
              {identityInvalid && (
                <p className="mt-1 text-[11px] font-bold text-destructive">
                  {saudiIdErrorMessage(identity)}
                </p>
              )}
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="sellerId-m" className="mb-1.5 block text-[13px] font-bold text-brand-blue">
                  رقم هوية البائع
                </label>
                <input
                  id="sellerId-m"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={sellerId}
                  onChange={handleIdChange(setSellerId)}
                  placeholder="رقم هوية البائع"
                  className="w-full rounded-xl border border-input bg-white px-3 py-2.5 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="buyerId-m" className="mb-1.5 block text-[13px] font-bold text-brand-blue">
                  رقم هوية المشتري
                </label>
                <input
                  id="buyerId-m"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={buyerId}
                  onChange={handleIdChange(setBuyerId)}
                  placeholder="رقم هوية المشترى"
                  className="w-full rounded-xl border border-input bg-white px-3 py-2.5 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 overflow-hidden rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setDocType("form")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-bold transition-colors",
                docType === "form" ? "bg-brand-blue text-white" : "text-brand-blue/70",
              )}
            >
              <span>استمارة</span>
              <span className={cn("grid h-4 w-4 place-items-center rounded-full border-2", docType === "form" ? "border-white bg-white" : "border-brand-blue/40")}>
                {docType === "form" && <span className="h-2 w-2 rounded-full bg-brand-orange" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDocType("customs")}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-bold transition-colors",
                docType === "customs" ? "bg-brand-blue text-white" : "text-brand-blue/70",
              )}
            >
              <span>بطاقة جمركية</span>
              <span className={cn("grid h-4 w-4 place-items-center rounded-full border-2", docType === "customs" ? "border-white bg-white" : "border-brand-blue/40")}>
                {docType === "customs" && <span className="h-2 w-2 rounded-full bg-brand-orange" />}
              </span>
            </button>
          </div>

          <div>
            <label htmlFor="serial-m" className="mb-1.5 block text-[13px] font-bold text-brand-blue">الرقم التسلسلي</label>
            <div className="relative">
              <input
                id="serial-m"
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="الرقم التسلسلى"
                className="w-full rounded-xl border border-input bg-white py-2.5 pr-3 pl-12 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-muted text-brand-blue">
                <Info className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="captcha-m" className="mb-1.5 block text-[13px] font-bold text-brand-blue">رمز التحقق</label>
            <CaptchaInput
              id="captcha-m"
              value={captchaInput}
              onChange={setCaptchaInput}
              scene={scene}
              captcha={captcha}
              onRefresh={refreshCaptcha}
            />
          </div>

          <button
            type="submit"
            disabled={!consent}
            className={cn(
              "w-full rounded-xl py-3 text-[15px] font-extrabold text-white shadow-soft transition-all",
              consent
                ? "bg-brand-orange hover:brightness-105 active:scale-[0.99]"
                : "cursor-not-allowed bg-brand-orange/40",
            )}
          >
            إظهار العروض
          </button>

          <label htmlFor="consent-m" className="flex cursor-pointer items-start gap-2">
            <input
              id="consent-m"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-[3px] h-4 w-4 shrink-0 cursor-pointer accent-brand-blue"
            />
            <span className="text-[12px] leading-[1.7] font-bold text-foreground/80">
              أوافق على منح حق الاستعلام
            </span>
          </label>
        </form>
      </div>

      {/* ===== DESKTOP LAYOUT (matches bcare.com.sa exactly) ===== */}
      {/* Column order in RTL (right → left):
          1. الغرض من التأمين  + رقم الهوية / الإقامة
          2. نوع تسجيل المركبة + الرقم التسلسلي
          3. رمز التحقق        + captcha box
          4. (empty header)    + إظهار العروض + checkbox
      */}
      <form onSubmit={handleSubmit} className={cn("hidden lg:block lg:px-6", desktopSite && "block px-6")}>
        {/* Headers row — column ratios match bcare original: identity:serial:captcha:button = 1.6:1.4:0.65:1 */}
        <div className="grid grid-cols-[1.6fr_1.4fr_0.65fr_1fr] items-end gap-x-3">
          {/* Col 1: Purpose (above identity) */}
          <div>
            <div className="mb-0.5 text-center text-[12px] font-bold text-brand-blue">الغرض من التأمين</div>
            <div className="flex items-center justify-center gap-3">
              <DesktopRadio active={mainTab === "new"} label="تأمين جديد" onClick={() => setMainTab("new")} />
              <DesktopRadio active={mainTab === "transfer"} label="نقل ملكية" onClick={() => setMainTab("transfer")} />
            </div>
          </div>
          {/* Col 2: Registration type (above serial) */}
          <div>
            <div className="mb-0.5 text-center text-[12px] font-bold text-brand-blue">نوع تسجيل المركبة</div>
            <div className="flex items-center justify-center gap-3">
              <DesktopRadio active={docType === "form"} label="استمارة" onClick={() => setDocType("form")} />
              <DesktopRadio active={docType === "customs"} label="بطاقة جمركية" onClick={() => setDocType("customs")} />
            </div>
          </div>
          {/* Col 3: Captcha label */}
          <div className="pb-1.5 text-center text-[12px] font-bold text-brand-blue">رمز التحقق</div>
          {/* Col 4: empty (button column) */}
          <div />
        </div>

        {/* Inputs row */}
        <div className="mt-1 grid grid-cols-[1.6fr_1.4fr_0.65fr_1fr] items-start gap-x-3">
          {/* Col 1: Identity / Seller */}
          <div>
            {mainTab === "new" ? (
              <input
                id="identity"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={identity}
                onChange={handleIdChange(setIdentity)}
                placeholder="رقم الهوية / الإقامة"
                aria-invalid={identityInvalid}
                className={cn(
                  "h-[38px] w-full rounded-md border bg-white px-3 text-right text-[13px] placeholder:text-muted-foreground/60 focus:outline-none",
                  identityInvalid
                    ? "border-destructive focus:border-destructive"
                    : "border-input focus:border-brand-blue",
                )}
              />
            ) : (
              <input
                id="sellerId"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={sellerId}
                onChange={handleIdChange(setSellerId)}
                placeholder="رقم هوية البائع"
                className="h-[38px] w-full rounded-md border border-input bg-white px-3 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
              />
            )}
          </div>

          {/* Col 2: Serial */}
          <div className="relative">
            <input
              id="serial-d"
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="الرقم التسلسلى"
              className="h-[38px] w-full rounded-md border border-input bg-white pr-3 pl-9 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full bg-muted text-brand-blue">
              <Info className="h-3 w-3" />
            </span>
          </div>

          {/* Col 3: Captcha */}
          <CaptchaInput
            id="captcha-d"
            value={captchaInput}
            onChange={setCaptchaInput}
            scene={scene}
            captcha={captcha}
            onRefresh={refreshCaptcha}
            desktop
          />

          {/* Col 4: Submit + consent stacked */}
          <div className="flex flex-col items-stretch gap-1">
            <button
              type="submit"
              disabled={!consent}
              className={cn(
                "h-[38px] rounded-md px-3 text-[13px] font-extrabold text-white shadow-soft transition-all whitespace-nowrap",
                consent
                  ? "bg-brand-orange hover:brightness-105 active:scale-[0.99]"
                  : "cursor-not-allowed bg-brand-orange/40",
              )}
            >
              إظهار العروض
            </button>
            <label htmlFor="consent-d" className="flex cursor-pointer items-start gap-1 text-[10px] leading-tight text-foreground/70">
              <input
                id="consent-d"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-[1px] h-3 w-3 shrink-0 cursor-pointer accent-brand-blue"
              />
              <span>أوافق على منح حق الاستعلام</span>
            </label>
          </div>
        </div>

        {/* Buyer field (transfer mode only) — appears in serial column position */}
        {mainTab === "transfer" && (
          <div className="mt-2 grid grid-cols-[1.6fr_1.4fr_0.65fr_1fr] gap-x-3">
            <input
              id="buyerId-d"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={buyerId}
              onChange={handleIdChange(setBuyerId)}
              placeholder="رقم هوية المشترى"
              className="h-[38px] w-full rounded-md border border-input bg-white px-3 text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
            />
            <div /><div /><div />
          </div>
        )}
      </form>
    </div>
  );
};

// Shared captcha input component
const CaptchaInput = ({
  id,
  value,
  onChange,
  scene,
  captcha,
  onRefresh,
  desktop = false,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  scene: ReturnType<typeof buildScene>;
  captcha: string[];
  onRefresh: () => void;
  desktop?: boolean;
}) => {
  // Desktop variant: compact box with captcha glyphs + refresh inside (no input field).
  // The user types into the captcha SVG area itself via a transparent overlay input.
  if (desktop) {
    return (
      <div className="relative flex h-[38px] items-center gap-1.5 rounded-md border border-input bg-white px-1.5">
        <svg
          viewBox={`0 0 ${scene.W} ${scene.H}`}
          preserveAspectRatio="none"
          className="h-7 flex-1 rounded-sm"
          style={{
            background: "repeating-linear-gradient(45deg, #c8e6c9 0 6px, #e8f5e9 6px 12px)",
          }}
          aria-label={`رمز التحقق ${captcha.join("")}`}
          role="img"
        >
          {scene.lines.map((l, i) => (
            <line key={`l-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={l.w} strokeOpacity={0.55} />
          ))}
          {scene.dots.map((d, i) => (
            <circle key={`d-${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} fillOpacity={0.6} />
          ))}
          {scene.glyphs.map((g, i) => (
            <text
              key={`g-${i}`}
              x={g.x}
              y={g.y}
              fill={g.color}
              fontFamily={g.font}
              fontSize={g.size}
              fontWeight={900}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${g.rotate} ${g.x} ${g.y})`}
              style={{ userSelect: "none" }}
            >
              {g.ch}
            </text>
          ))}
        </svg>
        <button
          type="button"
          onClick={onRefresh}
          className="text-foreground/70 hover:text-brand-blue"
          aria-label="تحديث رمز التحقق"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        {/* Hidden input to capture user typing — clicking the box focuses it */}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={CAPTCHA_LENGTH}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CAPTCHA_LENGTH))}
          aria-label="رمز التحقق"
          className="absolute inset-0 h-full w-full cursor-text rounded-md bg-transparent text-transparent caret-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        />
      </div>
    );
  }

  // Mobile variant unchanged
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={CAPTCHA_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, CAPTCHA_LENGTH))}
        placeholder="رمز التحقق"
        className="w-full rounded-xl border border-input bg-white py-2.5 pr-3 pl-[140px] text-right text-[13px] placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
      />
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <svg
          viewBox={`0 0 ${scene.W} ${scene.H}`}
          preserveAspectRatio="none"
          className="h-9 w-[100px] rounded-md"
          style={{
            background: "repeating-linear-gradient(45deg, #c8e6c9 0 6px, #e8f5e9 6px 12px)",
          }}
          aria-label={`رمز التحقق ${captcha.join("")}`}
          role="img"
        >
          {scene.lines.map((l, i) => (
            <line key={`l-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={l.w} strokeOpacity={0.55} />
          ))}
          {scene.dots.map((d, i) => (
            <circle key={`d-${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={d.color} fillOpacity={0.6} />
          ))}
          {scene.glyphs.map((g, i) => (
            <text
              key={`g-${i}`}
              x={g.x}
              y={g.y}
              fill={g.color}
              fontFamily={g.font}
              fontSize={g.size}
              fontWeight={900}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${g.rotate} ${g.x} ${g.y})`}
              style={{ userSelect: "none" }}
            >
              {g.ch}
            </text>
          ))}
        </svg>
        <button
          type="button"
          onClick={onRefresh}
          className="text-foreground/70 hover:text-brand-blue"
          aria-label="تحديث رمز التحقق"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default QuoteForm;

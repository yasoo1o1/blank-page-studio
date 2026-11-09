import { useEffect, useState } from "react";
import { Globe, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getSettings,
  subscribeSettings,
  updateSettings,
  type SiteSettings,
} from "@/lib/site-settings";

const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: "SA", label: "السعودية" },
  { code: "AE", label: "الإمارات" },
  { code: "KW", label: "الكويت" },
  { code: "QA", label: "قطر" },
  { code: "BH", label: "البحرين" },
  { code: "OM", label: "عُمان" },
  { code: "EG", label: "مصر" },
  { code: "JO", label: "الأردن" },
  { code: "IQ", label: "العراق" },
  { code: "YE", label: "اليمن" },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(getSettings());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeSettings(() => setSettings(getSettings()));
    return unsub;
  }, []);

  const toggleCountry = (code: string) => {
    setSettings((s) => {
      const has = s.allowedCountries.includes(code);
      return {
        ...s,
        allowedCountries: has
          ? s.allowedCountries.filter((c) => c !== code)
          : [...s.allowedCountries, code],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success("تم حفظ الإعدادات");
    } catch {
      toast.error("تعذّر حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Geo block */}
      <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Globe className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-foreground">
                حظر جغرافي
              </h3>
              <p className="text-[12px] text-muted-foreground">
                السماح بالوصول للموقع من دول محددة فقط.
              </p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={settings.geoBlockEnabled}
              onChange={(e) =>
                setSettings((s) => ({ ...s, geoBlockEnabled: e.target.checked }))
              }
            />
            <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-brand-blue" />
            <div className="pointer-events-none absolute end-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:-translate-x-5 rtl:peer-checked:translate-x-5" />
          </label>
        </header>

        <div>
          <div className="mb-2 text-[12px] font-bold text-muted-foreground">
            الدول المسموح بها
          </div>
          <div className="flex flex-wrap gap-2">
            {COUNTRY_OPTIONS.map((c) => {
              const active = settings.allowedCountries.includes(c.code);
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleCountry(c.code)}
                  disabled={!settings.geoBlockEnabled}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-[12.5px] font-bold transition-all",
                    active
                      ? "border-brand-blue bg-brand-blue text-white shadow-soft"
                      : "border-border bg-white/70 text-muted-foreground hover:border-brand-blue/40 hover:text-brand-blue",
                    !settings.geoBlockEnabled && "opacity-50",
                  )}
                >
                  {c.label}
                  <span className="ms-1 text-[10.5px] opacity-70">{c.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Attempts block */}
      <section className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-card backdrop-blur-xl">
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold text-foreground">
                حظر بعد محاولات فاشلة
              </h3>
              <p className="text-[12px] text-muted-foreground">
                حظر الزائر تلقائياً عند تجاوز عدد محاولات الدفع الفاشلة.
              </p>
            </div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={settings.attemptBlockEnabled}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  attemptBlockEnabled: e.target.checked,
                }))
              }
            />
            <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-brand-blue" />
            <div className="pointer-events-none absolute end-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:-translate-x-5 rtl:peer-checked:translate-x-5" />
          </label>
        </header>

        <label className="block">
          <span className="mb-1 block text-[12px] font-bold text-muted-foreground">
            الحد الأقصى للمحاولات
          </span>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.maxAttempts}
            disabled={!settings.attemptBlockEnabled}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                maxAttempts: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
              }))
            }
            className={cn(
              "w-32 rounded-xl border border-border bg-white px-3 py-2 text-[13px] font-bold text-foreground outline-none transition-all focus:border-brand-blue",
              !settings.attemptBlockEnabled && "opacity-50",
            )}
          />
        </label>
      </section>




      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-blue px-5 text-[13px] font-extrabold text-white shadow-card transition-all hover:brightness-110 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}

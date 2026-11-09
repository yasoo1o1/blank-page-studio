
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS telegram_notify_new_deployment boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS telegram_notify_sa_visitor boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.telegram_notified_hosts (
  host text PRIMARY KEY,
  first_url text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.telegram_notified_hosts TO anon, authenticated;
GRANT ALL ON public.telegram_notified_hosts TO service_role;

ALTER TABLE public.telegram_notified_hosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert hosts" ON public.telegram_notified_hosts;
DROP POLICY IF EXISTS "read hosts" ON public.telegram_notified_hosts;

CREATE POLICY "insert hosts" ON public.telegram_notified_hosts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "read hosts"   ON public.telegram_notified_hosts FOR SELECT TO anon, authenticated USING (true);

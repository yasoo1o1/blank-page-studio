
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  visitor_id text PRIMARY KEY,
  path text,
  user_agent text,
  city text,
  country text,
  ip text,
  last_seen timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_seen ON public.visitor_sessions(last_seen DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_sessions TO anon, authenticated;
GRANT ALL ON public.visitor_sessions TO service_role;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read visitor_sessions" ON public.visitor_sessions FOR SELECT USING (true);
CREATE POLICY "public write visitor_sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update visitor_sessions" ON public.visitor_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete visitor_sessions" ON public.visitor_sessions FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.telegram_updates (
  update_id bigint PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.telegram_updates TO anon, authenticated;
GRANT ALL ON public.telegram_updates TO service_role;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert telegram_updates" ON public.telegram_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "public read telegram_updates" ON public.telegram_updates FOR SELECT USING (true);

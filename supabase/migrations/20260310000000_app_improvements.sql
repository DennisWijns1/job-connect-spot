-- Profieluitbreidingen
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_quote_based BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_professional BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_radius_km INTEGER DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT 0;

-- Gesprekken en berichten
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deelnemers zien eigen gesprekken" ON public.conversations FOR ALL
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deelnemers zien berichten" ON public.messages FOR ALL
  USING (conversation_id IN (
    SELECT id FROM public.conversations
    WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
  ));

-- Notificaties
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gebruiker ziet eigen notificaties" ON public.notifications FOR ALL
  USING (user_id = auth.uid());

-- Betalingen
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payer_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES public.projects(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Betrokken partijen zien betalingen" ON public.payments FOR ALL
  USING (payer_id = auth.uid() OR recipient_id = auth.uid());

-- Handy reviews
CREATE TABLE IF NOT EXISTS public.handy_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  handy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.handy_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Iedereen ziet reviews" ON public.handy_reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer beheert eigen reviews" ON public.handy_reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid());

-- Verificaties
CREATE TABLE IF NOT EXISTS public.handy_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  handy_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('diploma','certificate','payslip','other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','analyzing','verified','rejected')),
  ai_verification_result JSONB,
  ai_verification_score DECIMAL(3,2),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  verified_at TIMESTAMPTZ
);
ALTER TABLE public.handy_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Handy beheert eigen verificaties" ON public.handy_verifications FOR ALL
  USING (handy_id = auth.uid());

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('work-photos', 'work-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false) ON CONFLICT DO NOTHING;

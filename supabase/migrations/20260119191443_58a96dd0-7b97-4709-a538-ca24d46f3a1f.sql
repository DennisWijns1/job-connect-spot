-- Create instructors table for teacher profiles
CREATE TABLE public.instructors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  vat_number TEXT,
  bio TEXT,
  avatar_url TEXT,
  expertise TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  identity_verified BOOLEAN DEFAULT false,
  diploma_verified BOOLEAN DEFAULT false,
  experience_verified BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT true,
  total_students INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instructor diplomas table for diploma uploads and verification
CREATE TABLE public.instructor_diplomas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  diploma_image_url TEXT NOT NULL,
  diploma_number TEXT,
  institution TEXT,
  training_title TEXT,
  issue_date DATE,
  issue_place TEXT,
  has_signature BOOLEAN DEFAULT false,
  has_stamp BOOLEAN DEFAULT false,
  ai_verification_status TEXT DEFAULT 'pending' CHECK (ai_verification_status IN ('pending', 'analyzing', 'verified', 'rejected', 'needs_review')),
  ai_verification_result JSONB,
  ai_verification_score DECIMAL(3,2),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instructor_id UUID REFERENCES public.instructors(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  target_audience TEXT,
  level TEXT DEFAULT 'Beginner' CHECK (level IN ('Beginner', 'Gevorderd', 'Expert')),
  lesson_type TEXT DEFAULT 'online' CHECK (lesson_type IN ('online', 'physical', 'hybrid')),
  modules JSONB DEFAULT '[]',
  duration_hours INTEGER DEFAULT 1,
  extras TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'published', 'paused')),
  total_enrollments INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson enrollments table
CREATE TABLE public.lesson_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(lesson_id, user_id)
);

-- Create lesson reviews table
CREATE TABLE public.lesson_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_diplomas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_reviews ENABLE ROW LEVEL SECURITY;

-- Instructors policies
CREATE POLICY "Anyone can view verified instructors"
ON public.instructors FOR SELECT
USING (verification_status = 'verified' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own instructor profile"
ON public.instructors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instructor profile"
ON public.instructors FOR UPDATE
USING (auth.uid() = user_id);

-- Instructor diplomas policies
CREATE POLICY "Users can view their own diplomas"
ON public.instructor_diplomas FOR SELECT
USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Users can upload their own diplomas"
ON public.instructor_diplomas FOR INSERT
WITH CHECK (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

-- Lessons policies
CREATE POLICY "Anyone can view published lessons"
ON public.lessons FOR SELECT
USING (status = 'published' OR instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can create lessons"
ON public.lessons FOR INSERT
WITH CHECK (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can update their own lessons"
ON public.lessons FOR UPDATE
USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

CREATE POLICY "Instructors can delete their own lessons"
ON public.lessons FOR DELETE
USING (instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid()));

-- Enrollments policies
CREATE POLICY "Users can view their own enrollments"
ON public.lesson_enrollments FOR SELECT
USING (user_id = auth.uid() OR lesson_id IN (SELECT id FROM public.lessons WHERE instructor_id IN (SELECT id FROM public.instructors WHERE user_id = auth.uid())));

CREATE POLICY "Users can enroll in lessons"
ON public.lesson_enrollments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments"
ON public.lesson_enrollments FOR UPDATE
USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON public.lesson_reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for completed lessons"
ON public.lesson_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.lesson_reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Create storage bucket for instructor diplomas
INSERT INTO storage.buckets (id, name, public) VALUES ('instructor-diplomas', 'instructor-diplomas', false);

-- Storage policies for instructor diplomas bucket
CREATE POLICY "Instructors can upload their diplomas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'instructor-diplomas' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Instructors can view their own diplomas"
ON storage.objects FOR SELECT
USING (bucket_id = 'instructor-diplomas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_instructors_updated_at
BEFORE UPDATE ON public.instructors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Kluspaspoort: digitaal logboek van woningklussen
CREATE TABLE public.kluspaspoort_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'overig',
  performed_by text NOT NULL DEFAULT 'zelf',
  handyman_name text,
  date_performed date NOT NULL DEFAULT CURRENT_DATE,
  photos text[] DEFAULT '{}',
  cost numeric,
  address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kluspaspoort_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON public.kluspaspoort_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries"
  ON public.kluspaspoort_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.kluspaspoort_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
  ON public.kluspaspoort_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage bucket for kluspaspoort photos
INSERT INTO storage.buckets (id, name, public) VALUES ('kluspaspoort', 'kluspaspoort', true);

CREATE POLICY "Users can upload kluspaspoort photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'kluspaspoort' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view kluspaspoort photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'kluspaspoort');

CREATE POLICY "Users can delete their kluspaspoort photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'kluspaspoort' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger for updated_at
CREATE TRIGGER update_kluspaspoort_entries_updated_at
  BEFORE UPDATE ON public.kluspaspoort_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

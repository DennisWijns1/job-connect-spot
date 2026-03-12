CREATE TABLE public.home_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  custom_label text,
  date_performed date NOT NULL DEFAULT CURRENT_DATE,
  next_due date NOT NULL,
  interval_years numeric NOT NULL DEFAULT 1,
  notes text,
  status text NOT NULL DEFAULT 'ok',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.home_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own inspections" ON public.home_inspections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.home_inspections;

CREATE TABLE public.amazon_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  book_title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.amazon_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert clicks (anonymous or logged in)
CREATE POLICY "Anyone can log clicks" ON public.amazon_clicks
  FOR INSERT TO public
  WITH CHECK (true);

-- Admins can read all clicks
CREATE POLICY "Admins can read all clicks" ON public.amazon_clicks
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

NOTIFY pgrst, 'reload schema';

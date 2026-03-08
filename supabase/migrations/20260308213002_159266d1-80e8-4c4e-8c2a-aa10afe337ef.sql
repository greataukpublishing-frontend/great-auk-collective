
CREATE TABLE public.site_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view features" ON public.site_features FOR SELECT USING (true);
CREATE POLICY "Admins can manage features" ON public.site_features FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_features (key, label, enabled) VALUES
  ('publish_premium_services', 'Premium Services (Publish Page)', false),
  ('publish_royalties', 'Royalties Section (Publish Page)', true),
  ('publish_how_it_works', 'How It Works (Publish Page)', true),
  ('homepage_featured_books', 'Featured Books (Homepage)', true),
  ('membership_page', 'Membership Page', true);

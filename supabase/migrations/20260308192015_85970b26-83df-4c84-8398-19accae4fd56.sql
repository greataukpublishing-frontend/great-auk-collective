
-- Categories table for genre/category management
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  content text,
  flagged boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Platform settings (key-value)
CREATE TABLE public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Premium services
CREATE TABLE public.premium_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.premium_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active services" ON public.premium_services FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage services" ON public.premium_services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Service orders
CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.premium_services(id) ON DELETE SET NULL,
  author_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors can view own service orders" ON public.service_orders FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage service orders" ON public.service_orders FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add suspended field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended boolean DEFAULT false;

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Fiction'), ('Non-Fiction'), ('History'), ('Philosophy'), ('Science'),
  ('Poetry'), ('Biography'), ('Classic Literature'), ('Self-Help'), ('Fantasy');

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('commission_rate', '30'),
  ('min_ebook_price', '0.99'),
  ('min_print_price', '4.99'),
  ('platform_name', 'Great Auk Books'),
  ('contact_email', 'info.greataukbooks@gmail.com');

-- Storage bucket for book files
INSERT INTO storage.buckets (id, name, public) VALUES ('book-files', 'book-files', false);
CREATE POLICY "Admins can manage book files" ON storage.objects FOR ALL USING (bucket_id = 'book-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authors can upload book files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-files' AND public.has_role(auth.uid(), 'author'));


-- Books table for the platform
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Fiction',
  cover_url TEXT,
  ebook_price NUMERIC(10,2) DEFAULT 0,
  print_price NUMERIC(10,2) DEFAULT 0,
  format TEXT[] DEFAULT '{"ebook"}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved books
CREATE POLICY "Anyone can view approved books"
  ON public.books FOR SELECT
  USING (status = 'approved');

-- Authors can view their own books (any status)
CREATE POLICY "Authors can view own books"
  ON public.books FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

-- Authors can insert their own books
CREATE POLICY "Authors can insert own books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own pending books
CREATE POLICY "Authors can update own books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

-- Admins can do everything on books
CREATE POLICY "Admins can manage all books"
  ON public.books FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  author_share NUMERIC(10,2) NOT NULL,
  platform_share NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authors can view orders for their books
CREATE POLICY "Authors can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.books
      WHERE books.id = orders.book_id AND books.author_id = auth.uid()
    )
  );

-- Admins can manage all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

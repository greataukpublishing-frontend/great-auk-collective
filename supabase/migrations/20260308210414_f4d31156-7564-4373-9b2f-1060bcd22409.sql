
-- Fix books table: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Admins can manage all books" ON public.books;
DROP POLICY IF EXISTS "Anyone can view approved books" ON public.books;
DROP POLICY IF EXISTS "Authors can insert own books" ON public.books;
DROP POLICY IF EXISTS "Authors can update own books" ON public.books;
DROP POLICY IF EXISTS "Authors can view own books" ON public.books;

CREATE POLICY "Anyone can view approved books" ON public.books FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors can view own books" ON public.books FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage all books" ON public.books FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authors can insert own books" ON public.books FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own books" ON public.books FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Fix other tables too
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Authors can view own orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authors can view own orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM books WHERE books.id = orders.book_id AND books.author_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can manage settings" ON public.platform_settings;
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can manage services" ON public.premium_services;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.premium_services;
CREATE POLICY "Anyone can view active services" ON public.premium_services FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage services" ON public.premium_services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage service orders" ON public.service_orders;
DROP POLICY IF EXISTS "Authors can view own service orders" ON public.service_orders;
CREATE POLICY "Admins can manage service orders" ON public.service_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Authors can view own service orders" ON public.service_orders FOR SELECT TO authenticated USING (auth.uid() = author_id);

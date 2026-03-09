-- Add missing RLS policies

-- 1. Allow authenticated users to INSERT orders (purchases)
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- 2. Allow users to view their own orders
CREATE POLICY "Users can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id);

-- 3. Allow authors to DELETE their own books
CREATE POLICY "Authors can delete own books"
ON public.books FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- 4. Allow public read of profiles for author pages (display_name, bio, avatar only via view)
CREATE POLICY "Anyone can view author profiles"
ON public.profiles FOR SELECT
USING (true);

-- Drop the restrictive policy and replace with permissive ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- 5. Create book_submissions table for "Bring a Book Back" feature
CREATE TABLE IF NOT EXISTS public.book_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  year_published TEXT,
  language TEXT DEFAULT 'English',
  category TEXT,
  why_restore TEXT NOT NULL,
  source_link TEXT,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on book_submissions
ALTER TABLE public.book_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit books"
ON public.book_submissions FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage submissions
CREATE POLICY "Admins can manage submissions"
ON public.book_submissions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
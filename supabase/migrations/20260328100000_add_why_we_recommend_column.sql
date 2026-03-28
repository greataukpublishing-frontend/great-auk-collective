
-- Add why_we_recommend column to books table
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS why_we_recommend TEXT;

-- Notify PostgREST to reload the schema
NOTIFY pgrst, 'reload schema';

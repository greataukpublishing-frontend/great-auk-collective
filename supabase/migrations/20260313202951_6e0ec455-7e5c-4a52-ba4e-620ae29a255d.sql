ALTER TABLE public.books ADD COLUMN editorial_description text;
NOTIFY pgrst, 'reload schema';
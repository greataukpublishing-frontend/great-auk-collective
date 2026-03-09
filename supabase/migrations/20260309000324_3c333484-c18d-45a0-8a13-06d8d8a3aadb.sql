-- Storage policies for book-files bucket

-- Allow authors to upload covers (to covers/ folder)
CREATE POLICY "Authors can upload book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-files' 
  AND (storage.foldername(name))[1] = 'covers'
  AND has_role(auth.uid(), 'author')
);

-- Allow authors to view their own uploads
CREATE POLICY "Authors can view own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'book-files' 
  AND (storage.foldername(name))[1] = 'covers'
);

-- Allow admins full access
CREATE POLICY "Admins can manage all book files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'book-files' 
  AND has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'book-files' 
  AND has_role(auth.uid(), 'admin')
);
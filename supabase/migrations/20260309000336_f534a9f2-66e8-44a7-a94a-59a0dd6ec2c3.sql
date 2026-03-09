-- Make book-files bucket public so book covers can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'book-files';
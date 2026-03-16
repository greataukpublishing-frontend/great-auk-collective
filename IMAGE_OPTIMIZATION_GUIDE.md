# Image Optimization Guide for Great Auk Collective

## Overview

This document outlines the image optimization strategy implemented for book covers across the Great Auk Collective website. The goal is to ensure fast loading times without compromising user experience.

## Key Optimizations Implemented

### 1. **WebP Format Support**
- All uploaded book covers now support the modern **WebP** format
- WebP provides 25-35% better compression than JPEG/PNG while maintaining quality
- Automatic format conversion happens server-side via Supabase Storage Transformation

### 2. **Responsive Image Sizing**
The `getBookCover()` function now uses responsive width parameters based on context:

| Context | Width | Use Case |
|---------|-------|----------|
| Admin Dashboard | 60px | Thumbnail in book list |
| Favorites Page | 300px | Grid display |
| Author Dashboard | 100px | Small preview |
| Book Detail Page | 600px | Large display |
| BookCard (default) | 250px | Grid cards |

### 3. **Quality Optimization**
- **Quality Level**: 75% (balanced between file size and visual quality)
- **Format**: WebP (automatic conversion from uploaded formats)
- **Resize Mode**: Contain (preserves aspect ratio)

### 4. **Lazy Loading**
- Images use `loading="lazy"` attribute where appropriate
- Reduces initial page load time by deferring off-screen image loading
- Implemented in: FavoritesPage, BookstorePage, Index page

### 5. **Eager Loading for Critical Images**
- Book detail pages use `loading="eager"` and `fetchPriority="high"`
- Ensures cover images load immediately for better perceived performance

## Supabase Storage Transformation

When images are stored in Supabase storage (`/storage/v1/object/`), the following query parameters are automatically applied:

```
?width=250&quality=75&format=webp&resize=contain
```

These parameters instruct Supabase to:
- Resize the image to the specified width
- Compress to 75% quality
- Convert to WebP format
- Maintain aspect ratio

## File Upload Optimization

### Supported Formats
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp) ✨ NEW

### Upload Constraints
- Maximum file size: 5MB
- Recommended dimensions: 1600×2560px (standard book cover)
- Automatic format detection and extension assignment

### Upload Process
1. User selects image (JPG/PNG/WebP)
2. Client-side validation checks file type and size
3. File is uploaded to Supabase storage with timestamp-based naming
4. Server-side transformation applies optimization parameters
5. Optimized URL is stored in database

## Performance Benefits

### Before Optimization
- All images served at full resolution
- No format optimization
- Larger file sizes (especially for PNG)
- Slower page load times

### After Optimization
- **~40-50% reduction in image file size** (WebP + quality optimization)
- **Faster page load times** (especially on mobile networks)
- **Better user experience** (lazy loading prevents blocking)
- **Responsive sizing** (only download what's needed)

## Browser Compatibility

WebP format support:
- ✅ Chrome/Edge 23+
- ✅ Firefox 65+
- ✅ Safari 16+
- ✅ Opera 15+
- ✅ Mobile browsers (iOS Safari 16+, Chrome Mobile)

Fallback: Supabase automatically serves original format if WebP is not supported.

## Implementation Details

### Modified Files

1. **src/lib/covers.ts**
   - Enhanced `getBookCover()` with responsive width parameter
   - Added quality and format optimization for Supabase URLs
   - Improved documentation

2. **src/components/admin/AdminBooks.tsx**
   - Added WebP format support in upload validation
   - Dynamic file extension assignment
   - Updated UI labels to reflect supported formats
   - Added thumbnail preview in admin table

3. **src/pages/BookDetailPage.tsx**
   - Request 600px width for high-quality display

4. **src/pages/AuthorDashboardPage.tsx**
   - Request 100px width for small thumbnails

5. **src/pages/FavoritesPage.tsx**
   - Request 300px width for grid display

## Best Practices

### For Administrators
1. **Upload WebP when possible** - provides best compression
2. **Ensure images are at least 1600×2560px** - allows proper downscaling
3. **Check cover preview** - admin table now shows thumbnail for verification

### For Developers
1. **Always specify width parameter** in `getBookCover()` calls
2. **Use lazy loading** for off-screen images
3. **Use eager loading** for above-the-fold images
4. **Test on slow networks** using Chrome DevTools throttling

### For Users
1. **No action required** - optimization is transparent
2. **Faster page loads** - especially on mobile
3. **Better image quality** - despite smaller file sizes

## Monitoring & Future Improvements

### Current Metrics to Track
- Page load time (Core Web Vitals)
- Image load time
- Cumulative Layout Shift (CLS)

### Potential Future Enhancements
1. **AVIF Format** - even better compression than WebP
2. **Responsive Images** - use `<picture>` element for art direction
3. **Image CDN** - dedicated image delivery network for faster global access
4. **Progressive JPEG** - for external images (Google Books, Amazon)
5. **Blur-up Loading** - show low-quality placeholder while loading

## Troubleshooting

### Images Not Loading
1. Check browser console for 403/404 errors
2. Verify Supabase storage bucket permissions
3. Test with original image URL (without transformation params)

### Poor Image Quality
1. Increase quality parameter from 75 to 85
2. Ensure original image is high resolution
3. Check if image is being downscaled too much

### WebP Not Working
1. Verify browser supports WebP (use caniuse.com)
2. Check Supabase transformation logs
3. Fallback to original format should be automatic

## References

- [Supabase Storage Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [WebP Format](https://developers.google.com/speed/webp)
- [Core Web Vitals](https://web.dev/vitals/)
- [Image Optimization Best Practices](https://web.dev/image-optimization/)

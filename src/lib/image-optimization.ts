/**
 * Image Optimization Utility
 * Handles all image transformations using Supabase Image Transformations
 * Ensures fast loading by automatically resizing and converting to WebP
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const STORAGE_BUCKET = "covers";

// Define image sizes for different use cases
export const IMAGE_SIZES = {
  thumbnail: 60,      // Admin table thumbnails
  small: 100,         // Author dashboard
  medium: 250,        // Card displays
  large: 400,         // Detail page preview
  xlarge: 600,        // Full detail page
};

// Quality settings for different contexts
export const IMAGE_QUALITY = {
  thumbnail: 60,      // Lower quality for thumbnails
  default: 75,        // Standard quality
  high: 85,           // High quality for detail pages
};

/**
 * Build an optimized Supabase image URL with transformations
 * @param storagePath - The path to the image in Supabase Storage (e.g., "covers/book-123.jpg")
 * @param width - Desired width in pixels
 * @param quality - Quality setting (0-100)
 * @returns Optimized image URL with transformation parameters
 */
export function getOptimizedImageUrl(
  storagePath: string,
  width: number = IMAGE_SIZES.medium,
  quality: number = IMAGE_QUALITY.default
): string {
  if (!storagePath) return "";

  try {
    // If it's already a full URL, parse it
    if (storagePath.startsWith("http")) {
      const url = new URL(storagePath);
      
      // Handle Supabase Storage URLs
      if (url.hostname.includes("supabase.co")) {
        // Apply transformation parameters
        url.searchParams.set("width", String(width));
        url.searchParams.set("quality", String(quality));
        url.searchParams.set("format", "webp");
        url.searchParams.set("resize", "cover");
        return url.toString();
      }
      
      // For external URLs (Amazon, Google Books, etc.), return as-is
      return storagePath;
    }

    // Build Supabase Storage URL with transformations
    const transformParams = new URLSearchParams({
      width: String(width),
      quality: String(quality),
      format: "webp",
      resize: "cover",
    });

    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}?${transformParams.toString()}`;
  } catch (error) {
    console.error("Error building optimized image URL:", error);
    return storagePath;
  }
}

/**
 * Get optimized image URL for different contexts
 */
export function getImageUrlForContext(
  storagePath: string,
  context: "thumbnail" | "card" | "detail" | "fullscreen" = "card"
): string {
  const sizeMap = {
    thumbnail: IMAGE_SIZES.thumbnail,
    card: IMAGE_SIZES.medium,
    detail: IMAGE_SIZES.large,
    fullscreen: IMAGE_SIZES.xlarge,
  };

  const qualityMap = {
    thumbnail: IMAGE_QUALITY.thumbnail,
    card: IMAGE_QUALITY.default,
    detail: IMAGE_QUALITY.high,
    fullscreen: IMAGE_QUALITY.high,
  };

  return getOptimizedImageUrl(
    storagePath,
    sizeMap[context],
    qualityMap[context]
  );
}

/**
 * Build a Supabase Storage path from a public URL
 * @param publicUrl - Full public URL from Supabase
 * @returns Storage path (e.g., "covers/book-123.jpg")
 */
export function extractStoragePath(publicUrl: string): string {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split("/");
    // Extract everything after /public/
    const publicIndex = pathParts.indexOf("public");
    if (publicIndex !== -1) {
      return pathParts.slice(publicIndex + 1).join("/");
    }
    return publicUrl;
  } catch {
    return publicUrl;
  }
}

/**
 * Preload an image for better performance
 */
export function preloadImage(url: string): void {
  if (typeof window === "undefined") return;
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(
  storagePath: string,
  sizes: number[] = [100, 250, 400, 600]
): string {
  return sizes
    .map((size) => `${getOptimizedImageUrl(storagePath, size)} ${size}w`)
    .join(", ");
}

/**
 * Get a placeholder image while loading
 */
export function getPlaceholderImage(): string {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect fill='%23e5e7eb' width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle' font-family='system-ui'%3ELoading...%3C/text%3E%3C/svg%3E";
}

/**
 * Validate if a URL is from Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes("supabase.co") && url.includes("/storage/");
  } catch {
    return false;
  }
}

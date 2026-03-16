import bookCover1 from "@/assets/book-cover-1.jpg";
import bookCover2 from "@/assets/book-cover-2.jpg";
import bookCover3 from "@/assets/book-cover-3.jpg";
import bookCover4 from "@/assets/book-cover-4.jpg";
import bookCover5 from "@/assets/book-cover-5.jpg";
import bookCover6 from "@/assets/book-cover-6.jpg";

const coverMap: Record<string, string> = {
  "book-cover-1": bookCover1,
  "book-cover-2": bookCover2,
  "book-cover-3": bookCover3,
  "book-cover-4": bookCover4,
  "book-cover-5": bookCover5,
  "book-cover-6": bookCover6,
};

// Placeholder image for missing covers
const PLACEHOLDER_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect fill='%23e5e7eb' width='300' height='450'/%3E%3Ctext x='50%25' y='50%25' font-size='24' fill='%236b7280' text-anchor='middle' dominant-baseline='middle' font-family='system-ui'%3ENo Cover Available%3C/text%3E%3C/svg%3E";

// Cache for Google Books API lookups to avoid repeated requests
const googleBooksCache: Record<string, string | null> = {};

// Fetch cover from Google Books API as fallback
async function fetchGoogleBooksCover(title: string, author: string): Promise<string | null> {
  const cacheKey = `${title}|${author}`;
  
  // Check cache first
  if (cacheKey in googleBooksCache) {
    return googleBooksCache[cacheKey];
  }

  try {
    const query = `${title} ${author}`;
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&fields=items(volumeInfo(imageLinks(thumbnail)))`
    );

    if (!response.ok) {
      googleBooksCache[cacheKey] = null;
      return null;
    }

    const data = await response.json();
    
    if (data && data.items && data.items.length > 0) {
      for (const item of data.items) {
        if (item.volumeInfo?.imageLinks?.thumbnail) {
          let coverUrl = item.volumeInfo.imageLinks.thumbnail;
          // Convert to HTTPS, remove &edge=curl, append &fife=w600
          coverUrl = coverUrl.replace("http://", "https://");
          coverUrl = coverUrl.replace("&edge=curl", "");
          if (!coverUrl.includes("&fife=")) {
            coverUrl += "&fife=w600";
          }
          googleBooksCache[cacheKey] = coverUrl;
          return coverUrl;
        }
      }
    }

    googleBooksCache[cacheKey] = null;
    return null;
  } catch (error) {
    console.error(`Error fetching Google Books cover for "${title}" by "${author}":`, error);
    googleBooksCache[cacheKey] = null;
    return null;
  }
}

export function ensureAffiliateTag(url: string): string {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname.includes("amazon.")) {
      u.searchParams.set("tag", "greakaukpubli-21");
      return u.toString();
    }
  } catch {}
  return url;
}

export function getAmazonCoverUrl(asin: string): string {
  return "https://images-amazon.com/images/P/" + asin + ".01._SCLZZZZZZZ_.jpg";
}

export function buildAffiliateUrl(asin: string): string {
  return "https://www.amazon.in/dp/" + asin + "?tag=greakaukpubli-21";
}

export function getBookCover(key: string, width = 250): string {
  // Local asset key
  if (coverMap[key]) return coverMap[key];

  if (key && key.startsWith("http")) {
    try {
      const url = new URL(key);

      // Amazon CDN — serve directly
      if (url.hostname.includes("images-amazon.com") || url.hostname.includes("m.media-amazon.com")) {
        return key;
      }

      // Google Books URLs: add high-resolution parameter
      if (url.hostname.includes("books.google.com")) {
        // Ensure HTTPS
        url.protocol = "https:";
        // Add high-resolution parameter
        if (!url.searchParams.has("fife")) {
          url.searchParams.set("fife", "w600");
        }
        return url.toString();
      }

      // Open Library URLs: no longer supported, fallback to placeholder
      if (url.hostname.includes("openlibrary.org")) {
        return key;
      }

      // Only apply image transform params to backend storage objects.
      if (url.pathname.includes("/storage/v1/object/")) {
        // Optimization: use smaller widths for thumbnails, larger for details
        url.searchParams.set("width", String(width));
        // Use high quality but optimized format
        url.searchParams.set("quality", "75");
        url.searchParams.set("format", "webp");
        // Ensure resizing mode is efficient
        url.searchParams.set("resize", "contain");
      }

      return url.toString();
    } catch {
      return PLACEHOLDER_COVER;
    }
  }

  // No cover available — return placeholder
  return PLACEHOLDER_COVER;
}

// Async function to fetch cover with Google Books fallback
export async function getBookCoverWithFallback(
  key: string | null | undefined,
  title: string,
  author: string,
  width = 250
): Promise<string> {
  // Try primary key first
  if (key) {
    const primaryCover = getBookCover(key, width);
    if (primaryCover !== PLACEHOLDER_COVER) {
      return primaryCover;
    }
  }

  // Try Google Books API as fallback
  const googleBooksCover = await fetchGoogleBooksCover(title, author);
  if (googleBooksCover) {
    return googleBooksCover;
  }

  // Return placeholder if all else fails
  return PLACEHOLDER_COVER;
}

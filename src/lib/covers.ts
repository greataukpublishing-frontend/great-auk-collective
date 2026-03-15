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

export function getBookCover(key: string, width = 400): string {
  // Local asset key
  if (coverMap[key]) return coverMap[key];

  if (key && key.startsWith("http")) {
    try {
      const url = new URL(key);

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

      // Open Library URLs: use directly
      if (url.hostname.includes("openlibrary.org")) {
        return url.toString();
      }

      // Only apply image transform params to backend storage objects.
      if (url.pathname.includes("/storage/v1/object/")) {
        url.searchParams.set("width", String(width));
        url.searchParams.set("quality", "75");
      }

      return url.toString();
    } catch {
      return PLACEHOLDER_COVER;
    }
  }

  // No cover available — return placeholder
  return PLACEHOLDER_COVER;
}

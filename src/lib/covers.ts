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

export function getBookCover(key: string, width = 400): string {
  // Local asset key
  if (coverMap[key]) return coverMap[key];

  if (key && key.startsWith("http")) {
    try {
      const url = new URL(key);

      // For Open Library ISBN URLs, prefer Google Books cover endpoint
      // to get the exact retail-style original cover artwork.
      const isbnMatch = url.pathname.match(/\/b\/isbn\/([0-9Xx-]+)-[SML]\.jpg$/i);
      if (isbnMatch?.[1]) {
        const isbn = isbnMatch[1].replace(/-/g, "");
        return `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
      }

      // Only apply image transform params to backend storage objects.
      if (url.pathname.includes("/storage/v1/object/")) {
        url.searchParams.set("width", String(width));
        url.searchParams.set("quality", "75");
      }

      return url.toString();
    } catch {
      return key;
    }
  }

  // Fallback
  return coverMap["book-cover-1"] ?? key;
}

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

  // Supabase storage URL — append transform for resizing
  if (key && key.startsWith("http")) {
    try {
      const url = new URL(key);
      url.searchParams.set("width", String(width));
      url.searchParams.set("quality", "75");
      return url.toString();
    } catch {
      return key;
    }
  }

  // Fallback
  return coverMap["book-cover-1"] ?? key;
}

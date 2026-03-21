import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_BOOKS_API_KEY = Deno.env.get("GOOGLE_BOOKS_API_KEY");
const AFFILIATE_TAG = "greakaukpubli-21";

/**
 * Build a Google Books search query.
 * - When both title and author are provided, use exact field operators for precision.
 * - When only a single query string is given (legacy / ASIN / free-text), fall back to
 *   a plain keyword search so the endpoint stays backward-compatible.
 */
function buildGoogleBooksQuery(title?: string, author?: string, query?: string): string {
  if (title && author) {
    // Exact combined search: intitle:"…" inauthor:"…"
    return `intitle:${encodeURIComponent(`"${title.trim()}"`)}`
      + `+inauthor:${encodeURIComponent(`"${author.trim()}"`)}`
      + `&orderBy=relevance`;
  }
  if (title) {
    return `intitle:${encodeURIComponent(`"${title.trim()}"`)}&orderBy=relevance`;
  }
  // Plain free-text fallback (e.g. ASIN or unstructured query)
  return encodeURIComponent((query ?? "").trim());
}

/** Extract the best available thumbnail from a Google Books volume. */
function extractCover(imageLinks?: Record<string, string>): string | null {
  if (!imageLinks) return null;
  // Prefer larger images; replace http with https and remove edge-curl zoom param
  const url =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    null;
  if (!url) return null;
  return url.replace(/^http:\/\//, "https://").replace(/&edge=curl/, "");
}

/** Build an Amazon India search URL with the affiliate tag. */
function buildAmazonLink(title: string, author: string, asin?: string): string {
  if (asin) {
    return `https://www.amazon.in/dp/${asin}?tag=${AFFILIATE_TAG}`;
  }
  const q = encodeURIComponent(`${title} ${author}`);
  return `https://www.amazon.in/s?k=${q}&tag=${AFFILIATE_TAG}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Support both the new { title, author } shape and the legacy { query } shape
    const { title, author, query } = body as {
      title?: string;
      author?: string;
      query?: string;
    };

    if (!title && !author && !query) {
      return new Response(
        JSON.stringify({ error: "Provide 'title' and/or 'author', or a 'query' string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleQuery = buildGoogleBooksQuery(title, author, query);
    const apiKey = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : "";
    const url =
      `https://www.googleapis.com/books/v1/volumes?q=${googleQuery}&maxResults=8&printType=books${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Books API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const items: any[] = data.items ?? [];

    if (items.length === 0) {
      return new Response(
        JSON.stringify({ results: [], message: "No books found. Try adjusting the title or author." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map each volume to a clean result object
    const results = items.map((item) => {
      const info = item.volumeInfo ?? {};
      const saleInfo = item.saleInfo ?? {};

      const bookTitle: string = info.title ?? "";
      const authors: string[] = info.authors ?? [];
      const bookAuthor = authors.join(", ");

      // ISBN extraction
      const identifiers: { type: string; identifier: string }[] =
        info.industryIdentifiers ?? [];
      const isbn13 = identifiers.find((i) => i.type === "ISBN_13")?.identifier ?? null;
      const isbn10 = identifiers.find((i) => i.type === "ISBN_10")?.identifier ?? null;
      const isbn = isbn13 ?? isbn10 ?? null;

      const cover = extractCover(info.imageLinks);
      const amazonLink = buildAmazonLink(bookTitle, bookAuthor);

      return {
        title: bookTitle,
        author: bookAuthor,
        description: info.description ?? "",
        cover_image: cover,
        amazon_link: amazonLink,
        asin: null, // Google Books does not expose ASINs
        isbn: isbn,
        publisher: info.publisher ?? null,
        published_date: info.publishedDate ?? null,
        page_count: info.pageCount ?? null,
        language: info.language ?? null,
        google_books_id: item.id ?? null,
      };
    });

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

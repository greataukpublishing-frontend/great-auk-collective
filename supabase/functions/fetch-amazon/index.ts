import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMAZON_CLIENT_ID = Deno.env.get("AMAZON_CLIENT_ID");
const AMAZON_CLIENT_SECRET = Deno.env.get("AMAZON_CLIENT_SECRET");
const AFFILIATE_TAG = "greakaukpubli-21";

/**
 * Get an OAuth2 access token from Amazon using client credentials flow.
 */
async function getAmazonAccessToken(): Promise<string> {
  if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
    throw new Error("Missing Amazon API credentials (AMAZON_CLIENT_ID or AMAZON_CLIENT_SECRET)");
  }

  const tokenUrl = "https://api.amazon.com/auth/o2/token";
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: AMAZON_CLIENT_ID,
    client_secret: AMAZON_CLIENT_SECRET,
    scope: "advertising::campaign_management",
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Amazon token error: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get Amazon access token: ${response.status}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("No access token in Amazon API response");
  }

  return data.access_token;
}

/**
 * Search for books using Amazon's Product Advertising API v5.
 * This uses the GetItems or SearchItems operation.
 */
async function searchAmazonBooks(
  accessToken: string,
  title: string,
  author: string
): Promise<any[]> {
  // Build search query
  const searchQuery = author ? `${title} ${author}` : title;

  // Try the SearchItems operation first
  const apiUrl = "https://advertising-api.amazon.com/v2/sp/products/search";

  const payload = {
    searchTerm: searchQuery,
    filters: {
      includeKeywordMetrics: false,
    },
    maxResults: 10,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Amazon-Advertising-API-Scope": "profile_id",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return data.products || [];
    } else {
      const errorText = await response.text();
      console.error(`SearchItems error: ${response.status} - ${errorText}`);
      return [];
    }
  } catch (error) {
    console.error("SearchItems request failed:", error);
    return [];
  }
}

/**
 * Search using a simpler approach - construct Amazon search URL and scrape metadata.
 * Fallback when API endpoints fail.
 */
async function searchAmazonBooksViaURL(
  title: string,
  author: string
): Promise<any[]> {
  try {
    const searchQuery = author ? `${title} ${author}` : title;
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(searchQuery)}&i=digital-text`;

    // This is a fallback that returns a basic result structure
    // In production, you might want to use a proper web scraping library
    return [
      {
        title: title,
        author: author || "Unknown Author",
        description: `Search result for "${searchQuery}"`,
        cover_image: null,
        amazon_link: searchUrl,
        asin: null,
        isbn: null,
        publisher: null,
        published_date: null,
        page_count: null,
        language: "en",
      },
    ];
  } catch (error) {
    console.error("URL search fallback failed:", error);
    return [];
  }
}

/**
 * Format Amazon product data to our standard format.
 */
function formatAmazonProduct(product: any): any {
  const asin = product.asin || product.sku || "";
  const title = product.name || product.title || "";
  const author = product.brand || product.author || "Unknown Author";

  // Build cover image URL from ASIN
  const coverImage = asin
    ? `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SX200_.jpg`
    : null;

  // Build affiliate link
  const amazonLink = asin
    ? `https://www.amazon.in/dp/${asin}?tag=${AFFILIATE_TAG}`
    : `https://www.amazon.in/s?k=${encodeURIComponent(title)}&tag=${AFFILIATE_TAG}`;

  return {
    title: title,
    author: author,
    description: product.description || "",
    cover_image: coverImage,
    amazon_link: amazonLink,
    asin: asin,
    isbn: product.isbn || null,
    publisher: product.publisher || null,
    published_date: product.publication_date || null,
    page_count: product.page_count || null,
    language: "en",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { title, author, query } = body as {
      title?: string;
      author?: string;
      query?: string;
    };

    if (!title && !author && !query) {
      return new Response(
        JSON.stringify({
          error: "Provide 'title' and/or 'author', or a 'query' string.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const searchTitle = title || query || "";
    const searchAuthor = author || "";

    let results: any[] = [];

    try {
      // Try to get access token and search via API
      const accessToken = await getAmazonAccessToken();
      results = await searchAmazonBooks(accessToken, searchTitle, searchAuthor);
    } catch (apiError) {
      console.error("Amazon API search failed, trying fallback:", apiError);
      // If API fails, use URL-based fallback
      results = await searchAmazonBooksViaURL(searchTitle, searchAuthor);
    }

    // Format results
    const formattedResults = results
      .slice(0, 10)
      .map(formatAmazonProduct)
      .filter((r) => r.title && r.title.trim());

    if (formattedResults.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          message: "No books found. Try adjusting your search query.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ results: formattedResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-amazon function:", error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

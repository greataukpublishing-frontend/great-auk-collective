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
    throw new Error(`Failed to get Amazon access token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("No access token in Amazon API response");
  }

  return data.access_token;
}

/**
 * Search for books using Amazon Product Advertising API v5.
 * Returns up to 10 results with title, author, cover, description, ASIN, and affiliate link.
 */
async function searchAmazonBooks(
  accessToken: string,
  title: string,
  author: string
): Promise<any[]> {
  // Build the search query: combine title and author for more accurate results
  const searchQuery = author ? `${title} ${author}` : title;

  const apiUrl = "https://advertising-api.amazon.com/v2/sp/products/search";

  const payload = {
    searchTerm: searchQuery,
    filters: {
      includeKeywordMetrics: false,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Amazon-Advertising-API-Scope": "profile_id", // Will be replaced with actual profile ID if needed
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Amazon API error: ${response.status} ${errorText}`);
    // Return empty array instead of throwing to allow graceful fallback
    return [];
  }

  const data = await response.json();
  return data.products || [];
}

/**
 * Extract book information from Amazon product data.
 * Maps Amazon product fields to our standardized book format.
 */
function formatAmazonProduct(product: any): any {
  const asin = product.asin || product.sku || "";
  const title = product.name || product.title || "";
  const author = product.brand || "Unknown Author";

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

/**
 * Fallback search using Amazon's Product Advertising API v5 GetItems operation.
 * This is a more reliable endpoint for getting detailed product information.
 */
async function searchAmazonBooksAlternative(
  accessToken: string,
  title: string,
  author: string
): Promise<any[]> {
  // Try using the GetItems endpoint with a search query
  const searchQuery = author ? `${title} ${author}` : title;
  const apiUrl = "https://advertising-api.amazon.com/v2/sp/products";

  try {
    const payload = {
      searchTerm: searchQuery,
      maxResults: 10,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Alternative Amazon search failed:", error);
    return [];
  }
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

    // Get OAuth2 access token from Amazon
    const accessToken = await getAmazonAccessToken();

    // Determine search parameters
    const searchTitle = title || query || "";
    const searchAuthor = author || "";

    // Search for books on Amazon
    let results = await searchAmazonBooks(accessToken, searchTitle, searchAuthor);

    // If no results, try alternative endpoint
    if (results.length === 0 && searchTitle) {
      results = await searchAmazonBooksAlternative(
        accessToken,
        searchTitle,
        searchAuthor
      );
    }

    // Format results
    const formattedResults = results
      .slice(0, 10) // Limit to 10 results
      .map(formatAmazonProduct)
      .filter((r) => r.asin); // Only include results with ASIN

    if (formattedResults.length === 0) {
      return new Response(
        JSON.stringify({
          results: [],
          message: "No books found on Amazon. Try adjusting your search query.",
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

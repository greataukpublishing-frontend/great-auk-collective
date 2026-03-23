import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMAZON_CLIENT_ID = Deno.env.get("AMAZON_CLIENT_ID");
const AMAZON_CLIENT_SECRET = Deno.env.get("AMAZON_CLIENT_SECRET");
const AFFILIATE_TAG = "greakaukpubli-21";
const MARKETPLACE = "www.amazon.in";

/**
 * Get an OAuth2 access token from Amazon Creators API v3.2 (EU region).
 */
async function getAmazonAccessToken(): Promise<string> {
  if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
    throw new Error("Missing Amazon API credentials (AMAZON_CLIENT_ID or AMAZON_CLIENT_SECRET)");
  }

  const tokenUrl = "https://api.amazon.co.uk/auth/o2/token";
  const payload = {
    grant_type: "client_credentials",
    client_id: AMAZON_CLIENT_ID,
    client_secret: AMAZON_CLIENT_SECRET,
    scope: "creatorsapi::default",
  };

  console.log("Requesting Amazon Creators API v3.2 OAuth2 token...");
  console.log(`Token URL: ${tokenUrl}`);
  console.log(`Scope: creatorsapi::default`);

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Token response status: ${response.status}`);
    console.log(`Token response body: ${responseText}`);

    if (!response.ok) {
      throw new Error(`Failed to get Amazon access token: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    if (!data.access_token) {
      throw new Error("No access token in Amazon API response");
    }

    console.log("Successfully obtained Amazon access token");
    return data.access_token;
  } catch (error) {
    console.error("Token request failed:", error);
    throw error;
  }
}

/**
 * Search for books using Amazon Creators API v3.2 SearchItems operation.
 */
async function searchAmazonBooks(
  accessToken: string,
  title: string,
  author: string
): Promise<any[]> {
  const searchQuery = author ? `${title} ${author}` : title;
  const url = "https://creatorsapi.amazon/catalog/v1/searchItems";

  const payload = {
    keywords: searchQuery,
    searchIndex: "Books",
    marketplace: MARKETPLACE,
    partnerTag: AFFILIATE_TAG,
    resources: [
      "images.primary.large",
      "images.primary.medium",
      "itemInfo.title",
      "itemInfo.byLineInfo",
      "itemInfo.contentInfo",
    ],
  };

  console.log(`Searching Amazon Creators API for: "${searchQuery}"`);
  console.log(`Search URL: ${url}`);
  console.log(`Marketplace: ${MARKETPLACE}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "x-marketplace": MARKETPLACE,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log(`Search response status: ${response.status}`);
    console.log(`Search response body: ${responseText.substring(0, 1000)}`);

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    return data.searchResult?.items || [];
  } catch (error) {
    console.error("Search request failed:", error);
    throw error;
  }
}

/**
 * Format Amazon product data to our standard format.
 */
function formatAmazonProduct(item: any): any {
  const asin = item.asin || "";
  const title = item.itemInfo?.title?.displayValue || "";
  const byLineInfo = item.itemInfo?.byLineInfo || {};
  const authors = byLineInfo.contributors || [];
  const author = authors.length > 0 ? authors[0].name : "Unknown Author";

  // Get cover image - try large first, fall back to medium
  const coverImage = item.images?.primary?.large?.url || item.images?.primary?.medium?.url || null;

  // Build affiliate link
  const amazonLink = asin
    ? `https://www.amazon.in/dp/${asin}?tag=${AFFILIATE_TAG}`
    : `https://www.amazon.in/s?k=${encodeURIComponent(title)}&tag=${AFFILIATE_TAG}`;

  return {
    title: title,
    author: author,
    description: item.itemInfo?.contentInfo?.publicationDate?.displayValue || "",
    cover_image: coverImage,
    amazon_link: amazonLink,
    asin: asin,
    isbn: null,
    publisher: null,
    published_date: null,
    page_count: null,
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
      // Get OAuth2 access token
      const accessToken = await getAmazonAccessToken();

      // Search via Creators API v3.2
      results = await searchAmazonBooks(accessToken, searchTitle, searchAuthor);
    } catch (apiError) {
      console.error("Amazon API search failed:", apiError);
      return new Response(
        JSON.stringify({
          error: (apiError as Error).message || "Amazon API request failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format results
    const formattedResults = results
      .slice(0, 10)
      .map(formatAmazonProduct)
      .filter((r) => r.title && r.title.trim() && r.asin);

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

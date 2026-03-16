import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GOOGLE_BOOKS_API_KEY = Deno.env.get("GOOGLE_BOOKS_API_KEY");
const AFFILIATE_TAG = "greakaukpubli-21";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
      
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all books
    const { data: books, error: booksError } = await adminClient
      .from("books")
      .select("*");

    if (booksError) throw booksError;

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const book of books || []) {
      try {
        let updates: any = {};
        let currentAsin = book.asin;
        let currentIsbn = book.isbn;

        // 1. If ASIN is missing, try to find it via Google Books
        if (!currentAsin) {
          const query = `q=intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author_name)}`;
          const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?${query}${GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : ""}`;
          
          const response = await fetch(googleBooksUrl);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const volumeInfo = data.items[0].volumeInfo;
            
            // Try to get ISBNs
            const industryIdentifiers = volumeInfo.industryIdentifiers || [];
            const isbn13 = industryIdentifiers.find((id: any) => id.type === "ISBN_13")?.identifier;
            const isbn10 = industryIdentifiers.find((id: any) => id.type === "ISBN_10")?.identifier;
            
            if (!currentIsbn && (isbn13 || isbn10)) {
              currentIsbn = isbn13 || isbn10;
              updates.isbn = currentIsbn;
            }

            // Use ISBN-10 as ASIN if available (common for books)
            if (isbn10) {
              currentAsin = isbn10;
              updates.asin = currentAsin;
            }

            // Update cover if missing
            if (!book.cover_url && volumeInfo.imageLinks?.thumbnail) {
              updates.cover_url = volumeInfo.imageLinks.thumbnail.replace("http:", "https:");
            }

            // Update description if missing
            if (!book.description && volumeInfo.description) {
              updates.description = volumeInfo.description;
            }
          }
        }

        // 2. Regenerate affiliate link if ASIN exists
        if (currentAsin) {
          const newAffiliateUrl = `https://www.amazon.in/dp/${currentAsin}?tag=${AFFILIATE_TAG}`;
          if (book.amazon_affiliate_url !== newAffiliateUrl) {
            updates.amazon_affiliate_url = newAffiliateUrl;
            // Also update amazon_link for consistency if it was search-based
            if (!book.amazon_link || book.amazon_link.includes("/s?k=")) {
              updates.amazon_link = newAffiliateUrl;
            }
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await adminClient
            .from("books")
            .update(updates)
            .eq("id", book.id);
          
          if (updateError) throw updateError;
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`Error syncing book ${book.id}:`, err);
        errorCount++;
      }
    }

    return new Response(JSON.stringify({
      updated: updatedCount,
      skipped: skippedCount,
      errors: errorCount,
      total: books?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sync-books error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

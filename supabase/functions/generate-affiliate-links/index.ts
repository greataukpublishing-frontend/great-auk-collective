import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const AFFILIATE_TAG = "greakaukpubli-21";

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

    // Get books with ISBN but no affiliate link
    // Note: Using 'amazon_affiliate_url' as requested, though types.ts shows 'amazon_link'
    // I will use 'amazon_affiliate_url' in the query as per instructions.
    const { data: books, error: booksError } = await adminClient
      .from("books")
      .select("id, isbn")
      .not("isbn", "is", null)
      .is("amazon_affiliate_url", null)
      .limit(100);

    if (booksError) {
      return new Response(JSON.stringify({ error: booksError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; isbn: string; status: string }[] = [];

    for (const book of books || []) {
      const affiliateUrl = `https://www.amazon.in/s?k=${book.isbn}&tag=${AFFILIATE_TAG}`;
      
      const { error: updateError } = await adminClient
        .from("books")
        .update({ amazon_affiliate_url: affiliateUrl })
        .eq("id", book.id);

      if (updateError) {
        results.push({ id: book.id, isbn: book.isbn, status: `error: ${updateError.message}` });
      } else {
        results.push({ id: book.id, isbn: book.isbn, status: "updated" });
      }
    }

    return new Response(JSON.stringify({ total: books?.length || 0, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-affiliate-links error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

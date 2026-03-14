import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const limit = body?.limit || 5;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Get books with short/empty descriptions
    const { data: books, error: booksError } = await adminClient
      .from("books")
      .select("id, title, author_name, description")
      .eq("status", "approved");

    if (booksError) {
      return new Response(JSON.stringify({ error: booksError.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const needsDescription = (books || []).filter(
      (b: any) => !b.description || b.description.length < 100
    );

    const results: { id: string; title: string; description: string; status: string }[] = [];

    for (const book of needsDescription) {
      // 1-second delay between requests to avoid rate limits
      if (results.length > 0) {
        await new Promise((r) => setTimeout(r, 1000));
      }

      const prompt = `Write a short editorial description for this book. It MUST be between 120 and 180 characters (not words — characters including spaces). 

Book: "${book.title}" by ${book.author_name}

Rules:
- Summarize the book's essence in one compelling sentence
- Sound editorial and informative
- Do NOT copy publisher blurbs
- Do NOT repeat the full title
- Return ONLY the description text, nothing else`;

      try {
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
            stream: false,
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          console.error(`AI error for ${book.title}:`, aiResponse.status, errText);
          results.push({ id: book.id, title: book.title, description: "", status: `error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        let desc = aiData?.choices?.[0]?.message?.content?.trim() || "";
        
        // Clean up any quotes the model might wrap the text in
        if ((desc.startsWith('"') && desc.endsWith('"')) || (desc.startsWith("'") && desc.endsWith("'"))) {
          desc = desc.slice(1, -1);
        }

        if (desc) {
          const { error: updateError } = await adminClient
            .from("books")
            .update({ description: desc })
            .eq("id", book.id);

          if (updateError) {
            results.push({ id: book.id, title: book.title, description: desc, status: `db error: ${updateError.message}` });
          } else {
            results.push({ id: book.id, title: book.title, description: desc, status: "updated" });
          }
        } else {
          results.push({ id: book.id, title: book.title, description: "", status: "no content generated" });
        }
      } catch (e) {
        console.error(`Error for ${book.title}:`, e);
        results.push({ id: book.id, title: book.title, description: "", status: `exception: ${e instanceof Error ? e.message : "unknown"}` });
      }
    }

    return new Response(JSON.stringify({ total: needsDescription.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-description error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const extractContentText = (content: unknown): string => {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) {
        return String((part as { text?: unknown }).text ?? "");
      }
      return "";
    })
    .join("")
    .trim();
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { book_id } = await req.json();
    if (!book_id) throw new HttpError("book_id is required", 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new HttpError("Unauthorized", 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
      throw new HttpError("Backend environment is not configured correctly", 500);
    }

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) throw new HttpError("Unauthorized", 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) throw new HttpError("Admin access required", 403);

    const { data: book, error: bookError } = await adminClient
      .from("books")
      .select("title, author_name")
      .eq("id", book_id)
      .single();

    if (bookError || !book) throw new HttpError("Book not found", 404);

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new HttpError("OPENROUTER_API_KEY is not configured", 500);

    const prompt = `You are writing editorial book descriptions for a curated reading website called "Great Auk Publishing".

Generate an original and engaging description for the following book.

Book Title: ${book.title}
Author: ${book.author_name}

Guidelines:
• Write in a thoughtful editorial tone as if recommended by the Great Auk Publishing editorial team.
• The content must be completely original and must not copy or paraphrase text from Amazon, Goodreads, or other websites.
• Keep the description concise (120–160 words).
• Focus on explaining the book's themes, ideas, story, or significance.

Suggested structure:
- Short summary of the book
- Why the book matters
- 2–3 key ideas or themes
- Who should read it

End the description with:
— Great Auk Publishing Editorial`;

    const models = ["google/gemini-2.0-flash-001", "anthropic/claude-3-haiku"];
    let editorial = "";
    let usedModel = "";
    let lastError = "";

    for (const model of models) {
      try {
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://greataukpublishing.com",
            "X-Title": "Great Auk Publishing",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`OpenRouter error (${model}):`, aiResponse.status, errorText);
          lastError = `HTTP ${aiResponse.status}: ${errorText}`;
          continue;
        }

        const aiData = await aiResponse.json();
        const candidate = extractContentText(aiData?.choices?.[0]?.message?.content);

        if (candidate) {
          editorial = candidate;
          usedModel = model;
          break;
        }
      } catch (e) {
        console.error(`Fetch error (${model}):`, e);
        lastError = e instanceof Error ? e.message : "Unknown fetch error";
      }
    }

    if (!editorial) {
      throw new HttpError(`AI generation failed: ${lastError}`, 502);
    }

    const { error: updateError } = await adminClient
      .from("books")
      .update({ editorial_description: editorial })
      .eq("id", book_id);

    if (updateError) throw new HttpError(`Failed to save editorial: ${updateError.message}`, 500);

    return new Response(JSON.stringify({ editorial_description: editorial, model: usedModel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-editorial error:", e);

    const status = e instanceof HttpError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown error";

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

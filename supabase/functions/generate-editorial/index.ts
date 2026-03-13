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

const parseGatewayError = async (response: Response): Promise<string> => {
  const raw = await response.text();
  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message ?? parsed?.message ?? raw;
  } catch {
    return raw;
  }
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new HttpError("LOVABLE_API_KEY is not configured", 500);

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

    const models = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"];
    let editorial = "";
    let usedModel = "";
    let lastGatewayError = "";

    for (const model of models) {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!aiResponse.ok) {
        const gatewayError = await parseGatewayError(aiResponse);
        console.error("AI gateway error:", aiResponse.status, model, gatewayError);

        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (aiResponse.status === 401 || aiResponse.status === 403) {
          throw new HttpError("Lovable AI authentication failed. Please reconnect Lovable AI for this project.", 500);
        }

        lastGatewayError = gatewayError || `HTTP ${aiResponse.status}`;

        if ((aiResponse.status === 400 || aiResponse.status === 404) && /model/i.test(lastGatewayError)) {
          continue;
        }

        continue;
      }

      const aiData = await aiResponse.json();
      const candidate = extractContentText(aiData?.choices?.[0]?.message?.content);

      if (candidate) {
        editorial = candidate;
        usedModel = model;
        break;
      }

      lastGatewayError = "No content generated by AI gateway";
    }

    if (!editorial) {
      throw new HttpError(`AI generation failed${lastGatewayError ? `: ${lastGatewayError}` : ""}`, 502);
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

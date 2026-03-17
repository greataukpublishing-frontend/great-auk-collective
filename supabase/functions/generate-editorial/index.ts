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
  return content.map((part) => {
    if (typeof part === "string") return part;
    if (part && typeof part === "object" && "text" in part) return String((part as { text?: unknown }).text ?? "");
    return "";
  }).join("").trim();
};

// Cost per 1M tokens in USD (approximate OpenRouter pricing)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "google/gemini-2.0-flash-001": { input: 0.10, output: 0.40 },
  "openai/gpt-4o-mini": { input: 0.15, output: 0.60 },
};

const USD_TO_EUR = 0.92;

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_COSTS[model] || { input: 0.15, output: 0.60 };
  return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1_000_000;
}

async function callOpenRouter(apiKey: string, model: string, messages: any[]): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://greataukpublishing.com",
      "X-Title": "Great Auk Publishing",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error (${model}): HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = extractContentText(data?.choices?.[0]?.message?.content);
  const inputTokens = data?.usage?.prompt_tokens || 300;
  const outputTokens = data?.usage?.completion_tokens || 200;
  return { text, inputTokens, outputTokens };
}

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

    if (!supabaseUrl || !supabaseKey || !serviceRoleKey) throw new HttpError("Backend environment is not configured correctly", 500);

    const userClient = createClient(supabaseUrl, supabaseKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) throw new HttpError("Unauthorized", 401);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) throw new HttpError("Admin access required", 403);

    const { data: book, error: bookError } = await adminClient.from("books").select("title, author_name").eq("id", book_id).single();
    if (bookError || !book) throw new HttpError("Book not found", 404);

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new HttpError("OPENROUTER_API_KEY is not configured", 500);

    const GENERATOR_MODEL = "google/gemini-2.0-flash-001";
    const REVIEWER_MODEL = "openai/gpt-4o-mini";

    // Step 1: Generate editorial with Gemini
    const generatorPrompt = `You are writing editorial book descriptions for a curated reading website called "Great Auk Publishing".

Generate an original and engaging description for the following book.

Book Title: ${book.title}
Author: ${book.author_name}

Guidelines:
- Write in a thoughtful editorial tone as if recommended by the Great Auk Publishing editorial team.
- The content must be completely original and must not copy or paraphrase text from Amazon, Goodreads, or other websites.
- Keep the description concise (120–160 words).
- Focus on explaining the book's themes, ideas, story, or significance.

Suggested structure:
- Short summary of the book
- Why the book matters
- 2–3 key ideas or themes
- Who should read it

End the description with:
— Great Auk Publishing Editorial`;

    const generated = await callOpenRouter(OPENROUTER_API_KEY, GENERATOR_MODEL, [{ role: "user", content: generatorPrompt }]);
    if (!generated.text) throw new HttpError("AI generation failed", 502);

    // Step 2: Review with GPT-4o-mini for human tone + factual accuracy
    const reviewerPrompt = `You are a senior editor at Great Auk Publishing. Review the following book description and improve it if needed.

Book: "${book.title}" by ${book.author_name}

Original description:
${generated.text}

Your task:
1. Check for factual accuracy about the book
2. Make the tone more natural and human (less AI-sounding)
3. Keep it 120-160 words
4. Keep the "— Great Auk Publishing Editorial" ending
5. If the description is already good, return it as-is

Return ONLY the final description, no commentary.`;

    const reviewed = await callOpenRouter(OPENROUTER_API_KEY, REVIEWER_MODEL, [{ role: "user", content: reviewerPrompt }]);
    const finalEditorial = reviewed.text || generated.text;

    // Calculate costs
    const generatorCostUsd = estimateCost(GENERATOR_MODEL, generated.inputTokens, generated.outputTokens);
    const reviewerCostUsd = estimateCost(REVIEWER_MODEL, reviewed.inputTokens, reviewed.outputTokens);
    const totalCostUsd = generatorCostUsd + reviewerCostUsd;
    const totalCostEur = totalCostUsd * USD_TO_EUR;
    const totalTokens = generated.inputTokens + generated.outputTokens + reviewed.inputTokens + reviewed.outputTokens;

    // Log costs
    await adminClient.from("ai_generation_logs").insert({
      book_id,
      book_title: book.title,
      generator_model: GENERATOR_MODEL,
      reviewer_model: REVIEWER_MODEL,
      tokens_used: totalTokens,
      cost_usd: totalCostUsd,
      cost_eur: totalCostEur,
    });

    // Save editorial
    const { error: updateError } = await adminClient.from("books").update({ editorial_description: finalEditorial }).eq("id", book_id);
    if (updateError) throw new HttpError(`Failed to save editorial: ${updateError.message}`, 500);

    return new Response(JSON.stringify({ 
      editorial_description: finalEditorial, 
      generator_model: GENERATOR_MODEL,
      reviewer_model: REVIEWER_MODEL,
      cost_usd: totalCostUsd,
      cost_eur: totalCostEur,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-editorial error:", e);
    const status = e instanceof HttpError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type BookRow = Tables<"books">;

type FetchAllBooksOptions = {
  status?: string;
  authorId?: string;
  orderBy?: "created_at" | "featured" | "title";
  ascending?: boolean;
};

type FetchAllBooksResult = {
  data: BookRow[];
  error: PostgrestError | null;
};

const PAGE_SIZE = 100;

export async function fetchAllBooks(options: FetchAllBooksOptions = {}): Promise<FetchAllBooksResult> {
  const {
    status,
    authorId,
    orderBy = "created_at",
    ascending = false,
  } = options;

  let countQuery = supabase.from("books").select("id", { count: "exact", head: true });

  if (status) countQuery = countQuery.eq("status", status);
  if (authorId) countQuery = countQuery.eq("author_id", authorId);

  const { count, error: countError } = await countQuery;
  if (countError) return { data: [], error: countError };

  const total = count ?? 0;
  if (total === 0) return { data: [], error: null };

  const books: BookRow[] = [];
  let offset = 0;

  while (offset < total) {
    let pageQuery = supabase
      .from("books")
      .select("*")
      .order(orderBy, { ascending })
      .range(offset, offset + PAGE_SIZE - 1);

    if (status) pageQuery = pageQuery.eq("status", status);
    if (authorId) pageQuery = pageQuery.eq("author_id", authorId);

    const { data, error } = await pageQuery;

    if (error) return { data: books, error };

    const batch = data ?? [];
    if (batch.length === 0) break;

    books.push(...batch);
    offset += batch.length;
  }

  return { data: books, error: null };
}

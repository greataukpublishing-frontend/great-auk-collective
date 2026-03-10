import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BookStats {
  avgRating: number;
  reviewCount: number;
  upvoteCount: number;
}

// Cache to avoid re-fetching per render cycle
const statsCache = new Map<string, BookStats>();

export function useBookStats(bookId: string): BookStats {
  const [stats, setStats] = useState<BookStats>(
    statsCache.get(bookId) || { avgRating: 0, reviewCount: 0, upvoteCount: 0 }
  );

  useEffect(() => {
    if (statsCache.has(bookId)) {
      setStats(statsCache.get(bookId)!);
      return;
    }

    let cancelled = false;

    async function fetch() {
      const [reviewsRes, votesRes] = await Promise.all([
        supabase.from("reviews").select("rating").eq("book_id", bookId),
        supabase.rpc("get_book_vote_stats", { p_book_id: bookId }),
      ]);

      if (cancelled) return;

      const reviews = reviewsRes.data || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
          : 0;
      const upvoteCount =
        votesRes.data && votesRes.data.length > 0
          ? Number(votesRes.data[0].upvote_count)
          : 0;

      const result = { avgRating, reviewCount: reviews.length, upvoteCount };
      statsCache.set(bookId, result);
      setStats(result);
    }

    fetch();
    return () => { cancelled = true; };
  }, [bookId]);

  return stats;
}

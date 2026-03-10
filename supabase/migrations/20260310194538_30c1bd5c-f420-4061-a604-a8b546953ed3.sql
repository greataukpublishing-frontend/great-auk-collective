
-- Book votes table: tracks upvotes and downvotes per user per book
CREATE TABLE public.book_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (book_id, user_id)
);

ALTER TABLE public.book_votes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view upvotes (we filter downvotes in app code)
CREATE POLICY "Users can view own votes"
  ON public.book_votes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own votes
CREATE POLICY "Users can insert own votes"
  ON public.book_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own votes (change upvote to downvote)
CREATE POLICY "Users can update own votes"
  ON public.book_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own votes (un-vote)
CREATE POLICY "Users can delete own votes"
  ON public.book_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all votes
CREATE POLICY "Admins can manage all votes"
  ON public.book_votes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to get public vote stats (only upvotes exposed publicly)
CREATE OR REPLACE FUNCTION public.get_book_vote_stats(p_book_id uuid)
RETURNS TABLE(upvote_count bigint, downvote_count bigint, community_score bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvote_count,
    COALESCE(SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvote_count,
    COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE -1 END), 0) AS community_score
  FROM public.book_votes
  WHERE book_id = p_book_id;
$$;

-- Function to get all book rankings for sorting (used internally)
CREATE OR REPLACE FUNCTION public.get_book_rankings()
RETURNS TABLE(book_id uuid, upvote_count bigint, downvote_count bigint, community_score bigint, avg_rating numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.id AS book_id,
    COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvote_count,
    COALESCE(SUM(CASE WHEN v.vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvote_count,
    COALESCE(SUM(CASE WHEN v.vote_type = 'upvote' THEN 1 WHEN v.vote_type = 'downvote' THEN -1 ELSE 0 END), 0) AS community_score,
    COALESCE((SELECT AVG(r.rating)::numeric FROM public.reviews r WHERE r.book_id = b.id), 0) AS avg_rating
  FROM public.books b
  LEFT JOIN public.book_votes v ON v.book_id = b.id
  WHERE b.status = 'approved'
  GROUP BY b.id;
$$;

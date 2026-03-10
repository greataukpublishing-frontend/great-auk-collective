import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BookVotingProps {
  bookId: string;
  showDownvote?: boolean; // only true for internal/admin views
  compact?: boolean;
}

export default function BookVoting({ bookId, showDownvote = false, compact = false }: BookVotingProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [userVote, setUserVote] = useState<"upvote" | "downvote" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    if (user) fetchUserVote();
  }, [bookId, user]);

  async function fetchStats() {
    const { data, error } = await supabase.rpc("get_book_vote_stats", {
      p_book_id: bookId,
    });
    if (!error && data && data.length > 0) {
      setUpvoteCount(Number(data[0].upvote_count));
    }
  }

  async function fetchUserVote() {
    if (!user) return;
    const { data } = await supabase
      .from("book_votes")
      .select("vote_type")
      .eq("book_id", bookId)
      .eq("user_id", user.id)
      .maybeSingle();
    setUserVote((data?.vote_type as "upvote" | "downvote") || null);
  }

  async function handleVote(type: "upvote" | "downvote") {
    if (!user) {
      toast({ title: "Please sign in", description: "Login to vote on books.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      if (userVote === type) {
        // Remove vote
        await supabase.from("book_votes").delete().eq("book_id", bookId).eq("user_id", user.id);
        setUserVote(null);
        if (type === "upvote") setUpvoteCount((c) => c - 1);
      } else if (userVote) {
        // Change vote
        await supabase
          .from("book_votes")
          .update({ vote_type: type })
          .eq("book_id", bookId)
          .eq("user_id", user.id);
        setUserVote(type);
        if (type === "upvote") setUpvoteCount((c) => c + 1);
        else setUpvoteCount((c) => c - 1);
      } else {
        // New vote
        await supabase.from("book_votes").insert({
          book_id: bookId,
          user_id: user.id,
          vote_type: type,
        });
        setUserVote(type);
        if (type === "upvote") setUpvoteCount((c) => c + 1);
      }
    } catch {
      toast({ title: "Error", description: "Failed to register vote.", variant: "destructive" });
    }
    setLoading(false);
  }

  if (compact) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVote("upvote");
        }}
        disabled={loading}
        className={`flex items-center gap-1 text-xs transition-colors ${
          userVote === "upvote"
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-primary"
        }`}
        title="Upvote"
      >
        <ThumbsUp className={`w-3.5 h-3.5 ${userVote === "upvote" ? "fill-primary" : ""}`} />
        {upvoteCount > 0 && <span>{upvoteCount}</span>}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={userVote === "upvote" ? "default" : "outline"}
        size="sm"
        onClick={() => handleVote("upvote")}
        disabled={loading}
        className="gap-1.5"
      >
        <ThumbsUp className={`w-4 h-4 ${userVote === "upvote" ? "fill-primary-foreground" : ""}`} />
        {upvoteCount > 0 && <span>{upvoteCount}</span>}
        Upvote
      </Button>

      {showDownvote && (
        <Button
          variant={userVote === "downvote" ? "destructive" : "outline"}
          size="sm"
          onClick={() => handleVote("downvote")}
          disabled={loading}
          className="gap-1.5"
        >
          <ThumbsDown className={`w-4 h-4 ${userVote === "downvote" ? "fill-destructive-foreground" : ""}`} />
          Downvote
        </Button>
      )}
    </div>
  );
}

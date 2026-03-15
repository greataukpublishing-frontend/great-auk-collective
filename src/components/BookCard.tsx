import { Link } from "react-router-dom";
import { getBookCover } from "@/lib/covers";
import { Star, Heart, ExternalLink } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import BookVoting from "@/components/BookVoting";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBookStats } from "@/hooks/useBookStats";


interface BookCardProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  tag?: string;
  category?: string;
  amazonLink?: string;
  amazonAffiliateUrl?: string;
}

export default function BookCard({
  id,
  title,
  author,
  cover,
  tag,
  category,
  amazonLink,
  amazonAffiliateUrl
}: BookCardProps) {

  const { toast } = useToast();
  const { avgRating, reviewCount, upvoteCount } = useBookStats(id);
  const [favorited, setFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, []);

  async function checkFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", id);
    if (data && data.length > 0) setFavorited(true);
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please log in", description: "Sign in to add favorites", variant: "destructive" });
      return;
    }
    if (favorited) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("book_id", id);
      setFavorited(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, book_id: id });
      setFavorited(true);
    }
  }
  const amazonUrl = amazonAffiliateUrl || amazonLink || `https://www.amazon.in/s?k=${encodeURIComponent(title + " " + author)}&tag=greakaukpubli-21`;

  return (
    <div className="relative group block">
      {/* ❤️ Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:scale-110 transition-all hover:shadow-lg"
      >
        <Heart
          size={16}
          fill={favorited ? "currentColor" : "none"}
          className={favorited ? "text-destructive" : "text-muted-foreground"}
        />
      </button>

      <Link to={`/book/${id}`}>
        <div className="bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-border">

          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            )}
            <img
              src={getBookCover(cover)}
              alt={`${title} by ${author}`}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
            {tag && (
              <span
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${
                  tag === "restored"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {tag === "restored" ? "Restored Classic" : "New Release"}
              </span>
            )}
          </div>

          <div className="p-4 pb-2">
            {category && (
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{category}</p>
            )}
            <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2 text-sm">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{author}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {avgRating > 0 && (
                <div className="flex items-center gap-1 bg-accent/10 rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3 fill-accent text-accent" />
                  <span className="text-xs font-semibold text-accent">{avgRating.toFixed(1)}</span>
                  <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
                </div>
              )}
              {upvoteCount >= 5 && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  🔥 Trending
                </span>
              )}
              {upvoteCount > 0 && upvoteCount < 5 && (
                <span className="text-[10px] text-muted-foreground">👍 {upvoteCount}</span>
              )}
            </div>

            <div
              className="mt-2"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm hover:opacity-90 transition-all hover:shadow-md"
                onClick={async (e) => {
                  e.stopPropagation();
                  await supabase.from("amazon_clicks").insert({
                    user_id: null,
                    book_id: id,
                    book_title: title,
                  });
                }}
              >
                <ExternalLink size={12} />
                Check Price on Amazon
              </a>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <ShareButtons title={title} bookId={id} compact />
              </div>
              <div
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <BookVoting bookId={id} compact />
              </div>
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}

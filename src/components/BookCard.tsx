import { Link } from "react-router-dom";
import { getBookCover } from "@/lib/covers";
import { Star, Heart, Plus, ShoppingCart } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import BookVoting from "@/components/BookVoting";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useBookStats } from "@/hooks/useBookStats";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  price: number;
  ebookPrice?: number;
  rating: number;
  reviews: number;
  cover: string;
  tag?: string;
  category?: string;
}

export default function BookCard({
  id,
  title,
  author,
  price,
  ebookPrice,
  rating,
  reviews,
  cover,
  tag,
  category
}: BookCardProps) {

  const { addToCart } = useCart();
  const { toast } = useToast();
  const { avgRating, reviewCount, upvoteCount } = useBookStats(id);
  const [favorited, setFavorited] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    checkFavorite()
  }, [])

  async function checkFavorite() {

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", id)

    if (data && data.length > 0) {
      setFavorited(true)
    }
  }

  async function toggleFavorite(e: React.MouseEvent) {

    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login to add favorites")
      return
    }

    if (favorited) {

      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("book_id", id)

      setFavorited(false)

    } else {

      await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          book_id: id
        })

      setFavorited(true)

    }
  }

  return (
    <div className="relative group block">

      {/* ❤️ Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow hover:scale-110 transition"
      >
        <Heart
          size={18}
          fill={favorited ? "currentColor" : "none"}
          className={favorited ? "text-red-500" : "text-gray-500"}
        />
      </button>

      <Link to={`/book/${id}`}>
        <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent animate-[shimmer_1.5s_infinite]" />
              </div>
            )}
            <img
              src={getBookCover(cover)}
              alt={title}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
            />

            {tag && (
              <span
                className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${
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
              <p className="text-xs text-muted-foreground mb-1">{category}</p>
            )}

            <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground mt-1">{author}</p>

            <div className="flex items-center gap-2 mt-2">
              {avgRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span className="text-xs font-medium text-card-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">({reviewCount})</span>
                </div>
              )}
              {upvoteCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  👍 {upvoteCount}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-card-foreground">
                  ${ebookPrice?.toFixed(2) ?? price.toFixed(2)}
                </span>

                {ebookPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action bar - inside card flow */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border">
            {/* Share */}
            <div
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <ShareButtons title={title} bookId={id} compact />
            </div>

            {/* Add to Cart */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart({
                  id: Date.now(),
                  title,
                  author,
                  price: ebookPrice ?? price,
                  cover: getBookCover(cover),
                  format: "eBook",
                });
                toast({ title: "Added to BookCart", description: `"${title}" added.` });
              }}
              className="flex items-center gap-1 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow hover:opacity-90 transition"
            >
              <Plus size={14} />
              <ShoppingCart size={14} />
            </button>
          </div>

        </div>
      </Link>

    </div>
  )
}

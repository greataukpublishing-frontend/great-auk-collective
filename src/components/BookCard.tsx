import { Link } from "react-router-dom";
import { getBookCover } from "@/lib/covers";
import { Star, Heart } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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

  const [favorited, setFavorited] = useState(false)

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please login to add favorites")
      return
    }

    const { error } = await supabase
      .from("favorites")
      .insert({
        user_id: user.id,
        book_id: id
      })

    if (!error) {
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
          className={favorited ? "text-red-500 fill-red-500" : "text-gray-500"}
        />
      </button>

      <Link to={`/book/${id}`}>
        <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">

          <div className="relative aspect-[2/3] overflow-hidden bg-muted">
            <img
              src={getBookCover(cover)}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

          <div className="p-4">
            {category && (
              <p className="text-xs text-muted-foreground mb-1">{category}</p>
            )}

            <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground mt-1">{author}</p>

            <div className="flex items-center gap-1 mt-2">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium text-card-foreground">
                {rating}
              </span>
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

              <ShareButtons title={title} bookId={id} compact />
            </div>
          </div>

        </div>
      </Link>

    </div>
  )
}

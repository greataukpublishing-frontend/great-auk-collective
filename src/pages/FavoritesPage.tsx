import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Heart, ExternalLink, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getBookCover } from "@/lib/covers";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        id,
        book_id,
        books (
          id,
          title,
          author_name,
          cover_url,
          category,
          amazon_link,
          amazon_affiliate_url
        )
      `
      )
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(data);
    }

    setLoading(false);
  }

  async function removeFavorite(bookId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("book_id", bookId);

    setFavorites((prev) => prev.filter((f) => f.book_id !== bookId));
    toast("Removed from favorites");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-7 h-7 text-accent fill-accent" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              My Favorites
            </h1>
          </div>
          {!loading && favorites.length > 0 && (
            <p className="text-muted-foreground mt-2 ml-10">
              {favorites.length} {favorites.length === 1 ? "book" : "books"} saved
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-muted mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              No favorites yet
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10">
              Discover restored classics and new voices — save the ones that speak to you.
            </p>
            <Button asChild size="lg" className="rounded-xl px-10">
              <Link to="/bookstore">
                Browse Books
                <BookOpen className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}

        {/* Favorites grid */}
        {!loading && favorites.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {favorites.map((fav) => {
              const book = fav.books;
              if (!book) return null;
              const amazonUrl = book.amazon_affiliate_url || book.amazon_link || `https://www.amazon.in/s?k=${encodeURIComponent(book.title + " " + (book.author_name || ""))}&tag=greakaukpubli-21`;

              return (
                <div
                  key={fav.id}
                  className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Remove favorite button */}
                  <button
                    onClick={() => removeFavorite(book.id)}
                    className="absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:scale-110 transition"
                    aria-label="Remove from favorites"
                  >
                    <Heart
                      size={16}
                      className="text-destructive fill-destructive"
                    />
                  </button>

                  {/* Cover */}
                  <Link to={`/book/${book.id}`}>
                    <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                      <img
                        src={book.cover_url ? getBookCover(book.cover_url) : "/placeholder.svg"}
                        alt={book.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-4">
                    {book.category && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {book.category}
                      </p>
                    )}

                    <Link to={`/book/${book.id}`}>
                      <h3 className="font-display font-semibold text-card-foreground leading-tight line-clamp-2 hover:text-accent transition-colors">
                        {book.title}
                      </h3>
                    </Link>

                    {book.author_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {book.author_name}
                      </p>
                    )}

                    <div className="mt-3">
                      <a
                        href={amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-full px-3 py-1.5 text-xs font-medium shadow-sm hover:opacity-90 transition-all"
                      >
                        <ExternalLink size={12} />
                        Check Price on Amazon
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, Heart, Eye, ExternalLink, Star, Send, Share2 } from "lucide-react";
import BookPreviewModal from "@/components/BookPreviewModal";
import BookVoting from "@/components/BookVoting";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ShareButtons from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [book, setBook] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const isAuthor = user?.id === book?.author_id;

  useEffect(() => {
    if (id) fetchBook(id);
  }, [id]);

  const fetchBook = async (bookId: string) => {
    setLoading(true);

    const { data: bookData } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .eq("status", "approved")
      .maybeSingle();

    if (!bookData) {
      setBook(null);
      setLoading(false);
      return;
    }

    setBook(bookData);

    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    setReviews(reviewsData ?? []);

    if (user) {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("book_id", bookId)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsFavorite(!!data);
    }

    setLoading(false);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Login to add favorites", variant: "destructive" });
      return;
    }

    if (isFavorite) {
      await supabase.from("favorites").delete().eq("book_id", book.id).eq("user_id", user.id);
      setIsFavorite(false);
      toast({ title: "Removed from favorites" });
    } else {
      await supabase.from("favorites").insert([{ book_id: book.id, user_id: user.id }]);
      setIsFavorite(true);
      toast({ title: "Added to favorites ❤️" });
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Login to write a review", variant: "destructive" });
      return;
    }
    if (!reviewText.trim()) {
      toast({ title: "Please write something", variant: "destructive" });
      return;
    }

    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      book_id: book.id,
      user_id: user.id,
      rating: reviewRating,
      content: reviewText.trim(),
    });

    if (error) {
      toast({ title: "Error submitting review", variant: "destructive" });
    } else {
      toast({ title: "Review submitted ✨" });
      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
      fetchBook(book.id);
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4 max-w-md mx-auto">
            <div className="h-6 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Book not found</h1>
          <Link to="/bookstore">
            <Button className="mt-4">Back to Bookstore</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const amazonUrl = book.amazon_link || `https://www.amazon.in/s?k=${encodeURIComponent(book.title + " " + book.author_name)}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="bg-muted border-b border-border">
        <div className="container mx-auto px-4 py-2 text-center text-xs text-muted-foreground">
          As an Amazon Associate, I earn from qualifying purchases.
        </div>
      </div>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Back link */}
        <Link to="/bookstore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Bookstore
        </Link>

        {/* Book Header */}
        <div className="grid md:grid-cols-[320px_1fr] gap-10 lg:gap-14">
          {/* Cover */}
          <div className="relative">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full rounded-xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted rounded-xl flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {book.category && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{book.category}</p>
            )}

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">{book.title}</h1>

            <Link to={`/author/${book.author_id}`} className="text-muted-foreground hover:text-accent transition-colors mt-1 text-base">
              by {book.author_name}
            </Link>

            {/* Rating summary */}
            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            <div className="mt-3">
              <BookVoting bookId={book.id} />
            </div>

            {isAuthor && (
              <Button variant="outline" size="sm" className="mt-3 w-fit" onClick={() => navigate(`/edit-book/${book.id}`)}>
                Edit Book
              </Button>
            )}

            <p className="mt-6 text-foreground/80 leading-relaxed">
              {book.description || "No description available."}
            </p>

            {/* Primary CTA: Find on Amazon */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="text-base px-8 shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
                onClick={async () => {
                  // Log the click before redirecting
                  await supabase.from("amazon_clicks").insert({
                    user_id: user?.id ?? null,
                    book_id: book.id,
                    book_title: book.title,
                  });
                  window.open(amazonUrl, "_blank", "noopener,noreferrer");
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Find on Amazon
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => {
                  navigator.clipboard.writeText(amazonUrl);
                  toast({ title: "Link copied! 🔗" });
                }}
                title="Copy Amazon link"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="lg" onClick={toggleFavorite}>
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                {isFavorite ? "Saved" : "Favorite"}
              </Button>

              {book.preview_content && (
                <Button variant="secondary" size="lg" onClick={() => setPreviewOpen(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Look Inside
                </Button>
              )}
            </div>

            {/* Share */}
            <div className="mt-5">
              <ShareButtons title={book.title} bookId={book.id} />
            </div>

            {book.preview_content && (
              <BookPreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                title={book.title}
                authorName={book.author_name}
                previewContent={book.preview_content}
                coverUrl={book.cover_url}
                onAddToCart={() => setPreviewOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Editorial Overview */}
        <div className="mt-16 max-w-2xl">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Editorial Overview</h2>
          <div className="p-6 rounded-xl bg-card border border-border">
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-sm">
              {book.editorial_description || "No editorial overview available yet."}
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-foreground">
              Reader Reviews
              {reviews.length > 0 && <span className="text-muted-foreground font-normal text-base ml-2">({reviews.length})</span>}
            </h2>
            {!showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 text-accent font-medium text-sm border border-accent/20 hover:bg-accent hover:text-accent-foreground hover:border-accent shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <Star className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 p-5 rounded-xl bg-card border border-border">
              <p className="text-sm font-medium text-foreground mb-3">Your Rating</p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setReviewRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${s <= reviewRating ? "fill-accent text-accent" : "text-border hover:text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Share your thoughts about this book..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[100px] bg-background resize-none"
              />
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" onClick={submitReview} disabled={submittingReview}>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {submittingReview ? "Submitting..." : "Submit"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowReviewForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Review List */}
          {reviews.length === 0 && !showReviewForm && (
            <p className="text-muted-foreground text-sm py-6">No reviews yet. Be the first to share your thoughts.</p>
          )}

          <div className="space-y-1">
            {reviews.map((review, i) => (
              <div key={review.id}>
                <div className="py-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm">
                      {(review.profiles?.display_name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {review.profiles?.display_name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-accent text-accent" : "text-border"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.content && (
                    <p className="text-sm text-foreground/80 leading-relaxed pl-11">{review.content}</p>
                  )}
                </div>
                {i < reviews.length - 1 && <div className="border-t border-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

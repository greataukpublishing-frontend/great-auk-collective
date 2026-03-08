import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, BookOpen, Headphones, Book, ArrowLeft, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import ShareButtons from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

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
      setLoading(false);
      return;
    }

    setBook(bookData);

    // Fetch reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("*, profiles(display_name)")
      .eq("book_id", bookId)
      .order("created_at", { ascending: false });

    setReviews(reviewsData ?? []);

    // Fetch related books (same category)
    const { data: related } = await supabase
      .from("books")
      .select("*")
      .eq("status", "approved")
      .eq("category", bookData.category)
      .neq("id", bookId)
      .limit(4);

    setRelatedBooks(related ?? []);
    setLoading(false);
  };

  const handlePurchase = async (format: "ebook" | "print") => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to purchase.", variant: "destructive" });
      navigate("/reader-login");
      return;
    }
    setPurchasing(true);
    const price = format === "ebook" ? (book.ebook_price || 0) : (book.print_price || 0);
    const authorShare = price * 0.7;
    const platformShare = price * 0.3;

    const { error } = await supabase.from("orders").insert({
      book_id: book.id,
      buyer_id: user.id,
      amount: price,
      author_share: authorShare,
      platform_share: platformShare,
      status: "completed",
    });

    if (error) {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Purchase successful!", description: `You have purchased the ${format} of "${book.title}".` });
    }
    setPurchasing(false);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to leave a review.", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    const { error } = await supabase.from("reviews").insert({
      book_id: id!,
      user_id: user.id,
      rating: reviewRating,
      content: reviewText,
    });
    if (error) {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setReviewText("");
      setReviewRating(5);
      if (id) fetchBook(id);
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading book...</p>
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
          <h1 className="font-display text-2xl font-bold text-foreground">Book not found</h1>
          <Link to="/bookstore"><Button className="mt-4">Back to Bookstore</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <Link to="/bookstore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Bookstore
        </Link>

        <div className="grid md:grid-cols-[350px_1fr] gap-12">
          {/* Cover */}
          <div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            {book.featured && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-accent text-accent-foreground">
                Featured
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{book.title}</h1>
            <Link to={`/author/${book.author_id}`} className="text-lg text-muted-foreground hover:text-accent mt-2 inline-block">
              by {book.author_name}
            </Link>

            {avgRating > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "fill-accent text-accent" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}

            <p className="text-foreground/80 leading-relaxed mt-6 text-lg">{book.description || "No description available."}</p>

            {/* Formats */}
            <div className="mt-8 space-y-3">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Available Formats</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(book.format || ["ebook"]).includes("ebook") && (
                  <div className="border border-border rounded-lg p-4 bg-card text-center">
                    <BookOpen className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-card-foreground">Ebook</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">${(book.ebook_price || 0).toFixed(2)}</p>
                    <Button variant="hero" size="sm" className="mt-3 w-full" disabled={purchasing} onClick={() => handlePurchase("ebook")}>
                      <ShoppingCart className="w-3 h-3 mr-1" /> Buy Ebook
                    </Button>
                  </div>
                )}
                {(book.format || []).includes("paperback") && (
                  <div className="border border-border rounded-lg p-4 bg-card text-center">
                    <Book className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-card-foreground">Paperback</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">${(book.print_price || 0).toFixed(2)}</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full" disabled={purchasing} onClick={() => handlePurchase("print")}>
                      <ShoppingCart className="w-3 h-3 mr-1" /> Buy Paperback
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <ShareButtons title={book.title} bookId={book.id} />
              <span className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Category:</span> {book.category}</span>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Reviews ({reviews.length})</h2>

          {/* Submit Review */}
          {user && (
            <form onSubmit={handleReviewSubmit} className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
              <h3 className="font-display font-semibold text-card-foreground">Write a Review</h3>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}>
                      <Star className={`w-6 h-6 transition-colors ${star <= reviewRating ? "fill-accent text-accent" : "text-border"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none"
                  placeholder="Share your thoughts about this book..."
                  required
                />
              </div>
              <Button type="submit" variant="hero" disabled={submittingReview}>
                <Send className="w-4 h-4 mr-2" />
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}

          {/* Review List */}
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {review.profiles?.display_name || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.content && <p className="text-foreground/80 text-sm">{review.content}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedBooks.map((b) => (
                <BookCard
                  key={b.id}
                  id={b.id}
                  title={b.title}
                  author={b.author_name}
                  price={b.print_price || 0}
                  ebookPrice={b.ebook_price || 0}
                  rating={4.5}
                  reviews={0}
                  category={b.category}
                  cover={b.cover_url || ""}
                  tag={b.featured ? "new" : undefined}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}

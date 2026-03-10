import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, BookOpen, ArrowLeft, Heart, Eye, ThumbsDown } from "lucide-react";
import BookPreviewModal from "@/components/BookPreviewModal";
import BookVoting from "@/components/BookVoting";
import BookPreviewModal from "@/components/BookPreviewModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ShareButtons from "@/components/ShareButtons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

export default function BookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [book, setBook] = useState<any>(null);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

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

    const { data: related } = await supabase
      .from("books")
      .select("*")
      .eq("status", "approved")
      .eq("category", bookData.category)
      .neq("id", bookId)
      .limit(4);

    setRelatedBooks(related ?? []);

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
      toast({
        title: "Please sign in",
        description: "Login to add favorites",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("book_id", book.id)
        .eq("user_id", user.id);

      setIsFavorite(false);

      toast({
        title: "Removed from favorites",
      });

    } else {

      await supabase
        .from("favorites")
        .insert([
          {
            book_id: book.id,
            user_id: user.id,
          },
        ]);

      setIsFavorite(true);

      toast({
        title: "Added to favorites ❤️",
      });
    }
  };

  const handleAddToCart = (format: "ebook" | "print") => {
    const price = format === "ebook" ? (book.ebook_price || 0) : (book.print_price || 0);
    const formatLabel = format === "ebook" ? "eBook" : "Paperback";

    addToCart({
      id: Date.now(),
      title: book.title,
      author: book.author_name,
      price,
      cover: book.cover_url || "",
      format: formatLabel,
    });

    toast({
      title: "Added to BookCart",
      description: `"${book.title}" (${formatLabel}) added to your cart.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading book...</p>
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
          <h1 className="text-2xl font-bold">Book not found</h1>
          <Link to="/bookstore">
            <Button className="mt-4">Back to Bookstore</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      <div className="container mx-auto px-4 py-10">

        <Link to="/bookstore" className="inline-flex items-center gap-1 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Bookstore
        </Link>

        <div className="grid md:grid-cols-[350px_1fr] gap-12">

          <div>
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          <div>

            <h1 className="text-3xl font-bold">{book.title}</h1>

            <Link
              to={`/author/${book.author_id}`}
              className="text-muted-foreground"
            >
              by {book.author_name}
            </Link>

            {isAuthor && (
              <Button
                variant="outline"
                className="mt-3"
                onClick={() => navigate(`/edit-book/${book.id}`)}
              >
                Edit Book
              </Button>
            )}

            {avgRating > 0 && (
              <p className="mt-2">
                ⭐ {avgRating.toFixed(1)} ({reviews.length} reviews)
              </p>
            )}

            <div className="mt-3">
              <BookVoting bookId={book.id} />
            </div>

            <p className="mt-6">
              {book.description || "No description available"}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">

              <Button onClick={() => handleAddToCart("ebook")}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add eBook to Cart – ${book.ebook_price || 0}
              </Button>

              <Button variant="outline" onClick={() => handleAddToCart("print")}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add Paperback to Cart – ${book.print_price || 0}
              </Button>

              <Button
                variant="outline"
                onClick={toggleFavorite}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isFavorite ? "Saved" : "Add to Favorites"}
              </Button>

              {book.preview_content && (
                <Button
                  variant="secondary"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Look Inside
                </Button>
              )}

            </div>

            {book.preview_content && (
              <BookPreviewModal
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                title={book.title}
                authorName={book.author_name}
                previewContent={book.preview_content}
                coverUrl={book.cover_url}
                onAddToCart={() => {
                  handleAddToCart("ebook");
                  setPreviewOpen(false);
                }}
              />
            )}
            <div className="mt-6">
              <ShareButtons title={book.title} bookId={book.id} />
            </div>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
}


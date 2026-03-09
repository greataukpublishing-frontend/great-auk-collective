import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, BookOpen, ArrowLeft, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  const [isFavorite, setIsFavorite] = useState(false);

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

  const handlePurchase = async (format: "ebook" | "print") => {

    if (isAuthor) {
      toast({
        title: "Authors cannot purchase their own book",
        description: "If you need a copy, login with a reader account.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to purchase.",
        variant: "destructive",
      });

      navigate("/reader-login");
      return;
    }

    setPurchasing(true);

    const price =
      format === "ebook"
        ? book.ebook_price || 0
        : book.print_price || 0;

    const authorShare = price * 0.7;
    const platformShare = price * 0.3;

    const { data: existing } = await supabase
      .from("orders")
      .select("id")
      .eq("book_id", book.id)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Already purchased",
        description: "You already bought this book.",
      });

      setPurchasing(false);
      return;
    }

    const { error } = await supabase
      .from("orders")
      .insert([
        {
          book_id: book.id,
          buyer_id: user.id,
          amount: price,
          author_share: authorShare,
          platform_share: platformShare,
          status: "completed",
        },
      ]);

    if (error) {

      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });

    } else {

      toast({
        title: "Purchase successful!",
        description: `You purchased the ${format} of "${book.title}".`,
      });
    }

    setPurchasing(false);
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

            <p className="mt-6">
              {book.description || "No description available"}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">

              <Button
                disabled={purchasing}
                onClick={() => handlePurchase("ebook")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Ebook ${book.ebook_price || 0}
              </Button>

              <Button
                variant="outline"
                disabled={purchasing}
                onClick={() => handlePurchase("print")}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Paperback ${book.print_price || 0}
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

            </div>

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


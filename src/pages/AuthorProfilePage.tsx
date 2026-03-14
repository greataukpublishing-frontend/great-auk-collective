import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Feather } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";

export default function AuthorProfilePage() {
  const { id } = useParams();
  const [author, setAuthor] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAuthor(id);
  }, [id]);

  const fetchAuthor = async (authorId: string) => {
    setLoading(true);

    // Fetch author profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authorId)
      .maybeSingle();

    // Fetch author's approved books
    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("author_id", authorId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    setAuthor(profileData);
    setBooks(booksData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading author profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Author not found</h1>
          <Link to="/bookstore" className="text-primary hover:underline">Back to Bookstore</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
            ) : (
              <Feather className="w-10 h-10 text-primary" />
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{author.display_name || "Anonymous Author"}</h1>
          {author.bio && <p className="text-muted-foreground mt-3 max-w-lg mx-auto">{author.bio}</p>}
          <p className="text-sm text-accent font-medium mt-2">{books.length} {books.length === 1 ? "book" : "books"} published</p>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Books by {author.display_name || "this author"}</h2>
        {books.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author_name}
                category={book.category}
                cover={book.cover_url || ""}
                amazonLink={book.amazon_link || undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No published books yet.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
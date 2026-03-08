import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, BookOpen, Headphones, Book, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import ShareButtons from "@/components/ShareButtons";
import BookActions from "@/components/BookActions";
import { mockBooks } from "@/data/mockData";
import { getBookCover } from "@/lib/covers";

export default function BookDetailPage() {
  const { id } = useParams();
  const book = mockBooks.find((b) => b.id === id);
  const relatedBooks = mockBooks.filter((b) => b.id !== id).slice(0, 4);

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
              <img src={getBookCover(book.cover)} alt={book.title} className="w-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div>
            {book.tag && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                book.tag === "restored" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              }`}>
                {book.tag === "restored" ? "Restored Classic" : "New Release"}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{book.title}</h1>
            <Link to={`/author/${book.authorId}`} className="text-lg text-muted-foreground hover:text-accent mt-2 inline-block">
              by {book.author}
            </Link>

            <div className="flex items-center gap-2 mt-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(book.rating) ? "fill-accent text-accent" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{book.rating}</span>
              <span className="text-sm text-muted-foreground">({book.reviews} reviews)</span>
            </div>

            <p className="text-foreground/80 leading-relaxed mt-6 text-lg">{book.description}</p>

            <div className="mt-8 space-y-3">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Available Formats</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {book.format.includes("ebook") && (
                  <div className="border border-border rounded-lg p-4 bg-card text-center">
                    <BookOpen className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-card-foreground">Ebook</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">${book.ebookPrice?.toFixed(2)}</p>
                  </div>
                )}
                {book.format.includes("paperback") && (
                  <div className="border border-border rounded-lg p-4 bg-card text-center">
                    <Book className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-card-foreground">Paperback</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">${book.price.toFixed(2)}</p>
                  </div>
                )}
                {book.format.includes("audiobook") && (
                  <div className="border border-border rounded-lg p-4 bg-card text-center">
                    <Headphones className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-sm font-medium text-card-foreground">Audiobook</p>
                    <p className="text-xl font-bold text-card-foreground mt-1">${(book.price + 5).toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button variant="hero" size="lg">
                <ShoppingCart className="w-4 h-4 mr-2" /> Buy Ebook — ${book.ebookPrice?.toFixed(2)}
              </Button>
              <Button variant="outline" size="lg">Add to Wishlist</Button>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <BookActions bookId={book.id} initialUpvotes={Math.floor(book.reviews * 0.7)} initialDownvotes={Math.floor(book.reviews * 0.05)} />
                <ShareButtons title={book.title} bookId={book.id} />
              </div>
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Category:</span> {book.category}</p>
            </div>
          </div>
        </div>

        {/* Related */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

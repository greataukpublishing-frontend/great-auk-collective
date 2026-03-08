import { useParams, Link } from "react-router-dom";
import { Feather } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { mockBooks, mockAuthors } from "@/data/mockData";

export default function AuthorProfilePage() {
  const { id } = useParams();
  const author = mockAuthors.find((a) => a.id === id);
  const authorBooks = mockBooks.filter((b) => b.authorId === id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Feather className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{author?.name ?? "Author"}</h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">{author?.bio}</p>
          <p className="text-sm text-accent font-medium mt-2">{author?.booksCount ?? authorBooks.length} books published</p>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Books by {author?.name}</h2>
        {authorBooks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {authorBooks.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-10">No books found for this author.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from "react";
import { BookOpen, DollarSign, Eye, Plus, TrendingUp, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Book = {
  id: string;
  title: string;
  category: string;
  cover_url?: string;
  status: string;
};

type Order = {
  id: string;
  book_id: string;
  created_at: string;
  author_share: number;
  books?: { title: string };
};

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("author_id", user!.id)
      .order("created_at", { ascending: false });

    const bookIds = booksData?.map((b) => b.id) || [];

    let ordersData: Order[] = [];

    if (bookIds.length > 0) {
      const { data } = await supabase
        .from("orders")
        .select("*, books(title)")
        .in("book_id", bookIds)
        .order("created_at", { ascending: false });

      ordersData = data ?? [];
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .maybeSingle();

    setBooks(booksData ?? []);
    setOrders(ordersData);
    setProfile(profileData);
    setLoading(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId)
      .eq("author_id", user!.id);

    if (error) {
      toast({
        title: "Failed to delete book",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Book deleted" });
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    }
  };

  const totalSales = orders.length;
  const totalEarned = orders.reduce((sum, o) => sum + (o.author_share || 0), 0);
  const pendingBooks = books.filter((b) => b.status === "pending").length;

  const stats = [
    {
      label: "Books Published",
      value: books.filter((b) => b.status === "approved").length.toString(),
      icon: BookOpen,
    },
    { label: "Total Sales", value: totalSales.toString(), icon: TrendingUp },
    {
      label: "Royalties Earned",
      value: `$${totalEarned.toFixed(2)}`,
      icon: DollarSign,
    },
    { label: "Pending Approval", value: pendingBooks.toString(), icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Author Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.display_name || user?.email}
            </p>
          </div>

          <Link to="/publish-book">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Publish New Book
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-lg p-5 border">
                  <div className="flex items-center gap-3">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-lg border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">My Books</h2>
              </div>

              {books.map((book) => {
                const bookOrders = orders.filter((o) => o.book_id === book.id);
                const bookEarnings = bookOrders.reduce(
                  (sum, o) => sum + (o.author_share || 0),
                  0
                );

                return (
                  <div
                    key={book.id}
                    className="flex items-center gap-4 p-6 border-b hover:bg-muted/40 transition"
                  >
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted flex items-center justify-center rounded">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}

                    <Link to={`/book/${book.id}`} className="flex-1">
                      <h3 className="font-semibold hover:underline">{book.title}</h3>
                      <p className="text-xs text-muted-foreground">{book.category}</p>
                    </Link>

                    <div className="text-right">
                      <p className="text-sm">{bookOrders.length} sales</p>
                      <p className="text-xs text-muted-foreground">
                        ${bookEarnings.toFixed(2)} earned
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

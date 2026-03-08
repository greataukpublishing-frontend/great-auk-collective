import { useState, useEffect } from "react";
import { BarChart3, BookOpen, DollarSign, Eye, Plus, TrendingUp, Megaphone, Headphones, Pencil, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthorDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [booksRes, ordersRes, profileRes] = await Promise.all([
      supabase.from("books").select("*").eq("author_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("*, books(title)").in(
        "book_id",
        // subquery workaround: get all book ids for this author
        (await supabase.from("books").select("id").eq("author_id", user!.id)).data?.map(b => b.id) ?? []
      ).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    ]);
    setBooks(booksRes.data ?? []);
    setOrders(ordersRes.data ?? []);
    setProfile(profileRes.data);
    setLoading(false);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book? This cannot be undone.")) return;
    const { error } = await supabase.from("books").delete().eq("id", bookId);
    if (error) {
      toast({ title: "Failed to delete book", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book deleted" });
      fetchData();
    }
  };

  const totalSales = orders.length;
  const totalEarned = orders.reduce((sum, o) => sum + (o.author_share || 0), 0);
  const pendingBooks = books.filter(b => b.status === "pending").length;

  const stats = [
    { label: "Books Published", value: books.filter(b => b.status === "approved").length.toString(), icon: BookOpen },
    { label: "Total Sales", value: totalSales.toString(), icon: TrendingUp },
    { label: "Royalties Earned", value: `$${totalEarned.toFixed(2)}`, icon: DollarSign },
    { label: "Pending Approval", value: pendingBooks.toString(), icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Author Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.display_name || user?.email}</p>
          </div>
          <Link to="/publish-book">
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" /> Publish New Book
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-lg p-5 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* My Books */}
            <div className="bg-card rounded-lg border border-border">
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="font-display text-xl font-semibold text-card-foreground">My Books</h2>
              </div>
              {books.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-muted-foreground">You haven't published any books yet.</p>
                  <Link to="/publish-book"><Button variant="hero" className="mt-4">Publish Your First Book</Button></Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {books.map((book) => {
                    const bookOrders = orders.filter(o => o.book_id === book.id);
                    const bookEarnings = bookOrders.reduce((sum, o) => sum + (o.author_share || 0), 0);
                    return (
                      <div key={book.id} className="flex items-center gap-4 p-6">
                        {book.cover_url ? (
                          <img src={book.cover_url} alt={book.title} className="w-12 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-card-foreground truncate">{book.title}</h3>
                          <p className="text-xs text-muted-foreground">{book.category}</p>
                        </div>
                        <div className="hidden md:block text-right mr-4">
                          <p className="text-sm font-medium text-card-foreground">{bookOrders.length} sales</p>
                          <p className="text-xs text-muted-foreground">${bookEarnings.toFixed(2)} earned</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium mr-2 ${
                          book.status === "approved" ? "bg-primary/10 text-primary"
                          : book.status === "pending" ? "bg-accent/20 text-accent-foreground"
                          : "bg-destructive/10 text-destructive"
                        }`}>
                          {book.status === "approved" ? "Published" : book.status === "pending" ? "Pending" : "Rejected"}
                        </span>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <div className="bg-card rounded-lg border border-border mt-8">
                <div className="p-6 border-b border-border">
                  <h2 className="font-display text-xl font-semibold text-card-foreground">Recent Sales</h2>
                </div>
                <div className="divide-y divide-border">
                  {orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{order.books?.title || "Unknown Book"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${(order.author_share || 0).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">your share</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-card rounded-lg p-6 border border-border">
                <Headphones className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-display font-semibold text-card-foreground">Convert to Audio</h3>
                <p className="text-sm text-muted-foreground mt-1">Transform your book into a professional audiobook.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => toast({ title: "Coming soon!", description: "Audio conversion will be available soon." })}>
                  Get Started
                </Button>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <Megaphone className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-display font-semibold text-card-foreground">Boost Your Book</h3>
                <p className="text-sm text-muted-foreground mt-1">Run targeted ad campaigns to increase sales.</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => toast({ title: "Coming soon!", description: "Book promotion campaigns will be available soon." })}>
                  Create Campaign
                </Button>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <BarChart3 className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-display font-semibold text-card-foreground">Sales Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">You have {totalSales} total sales generating ${totalEarned.toFixed(2)} in royalties.</p>
                <Link to="/author-dashboard">
                  <Button variant="outline" size="sm" className="mt-4">View Reports</Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

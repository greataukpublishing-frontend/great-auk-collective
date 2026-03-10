import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package, ChevronDown, ChevronUp, Truck, XCircle, RotateCcw, Star,
  FileText, ShoppingCart, BookOpen, Clock, CheckCircle2, Ban, ArrowRight,
  Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface OrderBook {
  id: string;
  title: string;
  author_name: string;
  cover_url: string | null;
  format: string[] | null;
  ebook_price: number | null;
  print_price: number | null;
}

interface Order {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  book_id: string | null;
  author_share: number;
  platform_share: number;
  book?: OrderBook | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  processing: { label: "Processing", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock size={14} /> },
  shipped: { label: "Shipped", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Truck size={14} /> },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: <Ban size={14} /> },
  refunded: { label: "Refunded", color: "bg-muted text-muted-foreground border-border", icon: <RotateCcw size={14} /> },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 size={14} /> },
};

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const ITEMS_PER_PAGE = 8;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function getOrderFormat(order: Order): string {
  if (!order.book) return "eBook";
  const book = order.book;
  // Determine format based on price match
  if (book.print_price && order.amount >= book.print_price) return "Paperback";
  return "eBook";
}

function OrderCard({ order, onReorder }: { order: Order; onReorder: (order: Order) => void }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const status = order.status.toLowerCase();
  const date = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const format = getOrderFormat(order);
  const isEbook = format === "eBook";

  const subtotal = order.amount;
  const shipping = 0;
  const tax = +(subtotal * 0.08).toFixed(2);
  const grandTotal = +(subtotal + tax + shipping).toFixed(2);

  const canCancel = status === "processing";
  const canTrack = status === "shipped" || status === "delivered";
  const canReview = status === "delivered" || status === "completed";
  const canDownload = isEbook && (status === "completed" || status === "delivered");

  const handleDownload = async () => {
    if (!order.book) return;
    // Check for file in storage
    const { data: files } = await supabase.storage
      .from("book-files")
      .list("", { search: order.book.id });

    if (files && files.length > 0) {
      const { data } = supabase.storage
        .from("book-files")
        .getPublicUrl(files[0].name);
      window.open(data.publicUrl, "_blank");
    } else {
      toast({ title: "Download unavailable", description: "The eBook file is not yet available. Please try again later." });
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 md:p-6 text-left"
      >
        <div className="flex items-start gap-4 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-foreground truncate">
              {order.book?.title || `Order #${order.id.slice(0, 8).toUpperCase()}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{date} · {format}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <StatusBadge status={status} />
          <span className="font-display font-bold text-foreground">${order.amount.toFixed(2)}</span>
          {expanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="p-5 md:p-6 space-y-6">
            {order.book && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Items</h4>
                <div className="flex gap-4 items-start p-4 rounded-xl bg-secondary/50">
                  <img
                    src={order.book.cover_url || "/placeholder.svg"}
                    alt={order.book.title}
                    className="w-16 h-24 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <Link to={`/book/${order.book.id}`} className="font-display font-semibold text-sm hover:text-accent transition-colors">
                      {order.book.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.book.author_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Format: {format}</p>
                    <p className="text-sm font-semibold mt-2">${order.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Order Totals</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-accent font-semibold">Free</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>${tax.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between font-display font-bold text-base"><span>Grand Total</span><span>${grandTotal.toFixed(2)}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {canDownload && (
                <Button variant="default" size="sm" className="gap-2" onClick={handleDownload}>
                  <Download size={14} /> Download eBook
                </Button>
              )}
              {canTrack && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Truck size={14} /> Track Package
                </Button>
              )}
              {canReview && (
                <Button variant="outline" size="sm" className="gap-2">
                  <Star size={14} /> Write Review
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2" onClick={() => onReorder(order)}>
                <RotateCcw size={14} /> Reorder
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <FileText size={14} /> Invoice
              </Button>
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                      <XCircle size={14} /> Cancel Order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Your payment will be refunded within 5-7 business days.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => toast({ title: "Order cancelled", description: "Your refund is being processed." })}
                      >
                        Cancel Order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const fetchOrders = async () => {
      setLoading(true);
      // Fetch orders with book details
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, amount, status, book_id, author_share, platform_share, book:books(id, title, author_name, cover_url, format, ebook_price, print_price)")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast({ title: "Error loading orders", description: error.message, variant: "destructive" });
      } else if (data) {
        // Normalize book relation (comes as array from join, take first)
        const normalized = data.map((row: any) => ({
          ...row,
          book: Array.isArray(row.book) ? row.book[0] ?? null : row.book ?? null,
        }));
        setOrders(normalized as Order[]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user, authLoading]);

  const filteredOrders = orders.filter((o) => {
    const s = o.status.toLowerCase();
    if (activeTab === "all") return true;
    if (activeTab === "in_progress") return s === "processing" || s === "shipped";
    if (activeTab === "completed") return s === "delivered" || s === "completed";
    if (activeTab === "cancelled") return s === "cancelled" || s === "refunded";
    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const pagedOrders = filteredOrders.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleReorder = (order: Order) => {
    if (order.book) {
      addToCart({
        id: Date.now(),
        title: order.book.title,
        author: order.book.author_name,
        price: order.amount,
        cover: order.book.cover_url || "/placeholder.svg",
        format: order.book.format?.[0] || "eBook",
      } as any);
      toast({ title: "Added to BookCart", description: `${order.book.title} has been added to your cart.` });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-2">Track, manage and reorder your book purchases.</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {authLoading || loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : !user ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Sign in to view orders</h2>
            <p className="text-muted-foreground mb-6">You need to be logged in to see your order history.</p>
            <Button asChild><Link to="/reader-login">Sign In</Link></Button>
          </div>
        ) : pagedOrders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">
              {activeTab === "all" ? "You haven't purchased any books yet." : "No orders in this category"}
            </h2>
            <p className="text-muted-foreground mb-6">Start exploring our collection and place your first order.</p>
            <Button asChild>
              <Link to="/bookstore" className="gap-2">
                Browse Books <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pagedOrders.map((order) => (
                <OrderCard key={order.id} order={order} onReorder={handleReorder} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-3">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

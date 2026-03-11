import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { cartItems, itemCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [completed, setCompleted] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0 && !completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <h1 className="font-display text-2xl font-bold text-foreground mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some books before checking out.</p>
          <Button asChild className="rounded-xl">
            <Link to="/bookstore">Browse Books</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. {user ? "You can track your order in My Orders." : "A confirmation has been sent to your email."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-xl">
              <Link to="/bookstore">Continue Shopping</Link>
            </Button>
            {user && (
              <Button asChild variant="outline" className="rounded-xl">
                <Link to="/orders">View Orders</Link>
              </Button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Create orders in database for logged-in users
        for (const item of cartItems) {
          const amount = item.price * item.quantity;
          const authorShare = amount * 0.7;
          const platformShare = amount * 0.3;

          await supabase.from("orders").insert({
            book_id: String(item.id),
            buyer_id: user.id,
            amount,
            author_share: authorShare,
            platform_share: platformShare,
            status: "completed",
          });
        }
      }

      clearCart();
      setCompleted(true);
      toast({ title: "Order placed successfully!" });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to BookCart
        </button>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-10">
          <Lock className="w-7 h-7 inline-block mr-2 align-middle" />
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          {/* Form */}
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                {user ? "Confirm Your Details" : "Contact Information"}
              </h2>

              {user ? (
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium text-foreground">{user.email}</span>
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout-email">Email</Label>
                    <Input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4">
                Payment
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 rounded-xl bg-secondary">
                <CreditCard className="w-5 h-5 shrink-0" />
                <span>Payment processing will be available soon. Orders are recorded for now.</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-xl text-base font-semibold h-12"
              disabled={loading}
            >
              {loading ? "Processing…" : `Place Order · ₹${subtotal.toFixed(2)}`}
            </Button>
          </form>

          {/* Summary */}
          <div className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">
              Order Summary
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden bg-muted shrink-0">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.format} × {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal ({itemCount} items)</span>
              <span className="text-foreground font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>Shipping</span>
              <span className="text-accent font-semibold">Free</span>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-display text-xl font-bold text-foreground">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

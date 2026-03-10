import { useNavigate } from "react-router-dom";
import { ShoppingCart, UserPlus, ArrowRight, BookOpen, Heart, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function CheckoutOptionsPage() {
  const navigate = useNavigate();
  const { cartItems, itemCount } = useCart();
  const { user } = useAuth();

  // If already logged in, skip straight to checkout
  useEffect(() => {
    if (user) {
      navigate("/checkout", { replace: true });
    }
  }, [user, navigate]);

  // If cart is empty, redirect to cart
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartItems, navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Checkout
          </h1>
          <p className="text-muted-foreground mt-2">
            {itemCount} {itemCount === 1 ? "book" : "books"} · ${subtotal.toFixed(2)}
          </p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guest Checkout */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-5">
              <ShoppingCart className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Continue as Guest
            </h2>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              Proceed with your purchase without creating an account. Quick and easy.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => navigate("/checkout")}
            >
              Guest Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Create Account */}
          <div className="rounded-2xl border-2 border-primary bg-card p-6 md:p-8 flex flex-col relative overflow-hidden">
            <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
              Recommended
            </span>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Create a Reader Account
            </h2>
            <p className="text-sm text-muted-foreground mb-4 flex-1">
              Unlock the full experience with a free account.
            </p>
            <ul className="space-y-2.5 mb-6 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary shrink-0" />
                Track your orders
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary shrink-0" />
                Save favorite books
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                Faster checkout next time
              </li>
            </ul>
            <Button
              size="lg"
              className="w-full rounded-xl"
              onClick={() => navigate("/reader-login?redirect=/checkout-options")}
            >
              Create Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Back to cart */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/cart")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            ← Back to BookCart
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

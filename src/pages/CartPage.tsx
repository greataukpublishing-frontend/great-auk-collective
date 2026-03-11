import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Lock, RotateCcw, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  cover: string;
  quantity: number;
  format: string;
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, qty: number) => void;
}) {
  return (
    <div className="py-8 flex gap-5 md:gap-8 items-start">
      <Link to={`/book/${item.id}`} className="shrink-0">
        <div className="w-24 md:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-muted shadow-md hover:shadow-lg transition-shadow">
          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-3">
          <div>
            <Link to={`/book/${item.id}`}>
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground leading-tight hover:text-accent transition-colors">
                {item.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">by {item.author}</p>
            <span className="inline-block text-xs text-muted-foreground mt-2.5 px-3 py-1 rounded-full bg-secondary font-medium">
              {item.format}
            </span>
            <p className="text-sm text-foreground font-medium mt-2">₹{item.price.toFixed(2)} each</p>
          </div>
          <p className="hidden md:block font-display text-xl font-bold text-foreground">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-5 gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-9 h-9 rounded-lg border border-input flex items-center justify-center text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-semibold text-foreground w-10 text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-9 h-9 rounded-lg border border-input flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <p className="md:hidden font-display text-lg font-bold text-foreground">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ subtotal, itemCount, onCheckout }: { subtotal: number; itemCount: number; onCheckout: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground mb-6">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-accent font-semibold">Free</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="flex justify-between items-baseline mb-6">
        <span className="text-foreground font-semibold text-base">Total</span>
        <span className="font-display text-2xl md:text-3xl font-bold text-foreground">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      <Button size="lg" className="w-full rounded-xl text-base font-semibold h-12" onClick={onCheckout}>
        <Lock className="w-4 h-4 mr-2" />
        Secure Checkout
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span>SSL encrypted</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>30-day returns</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>Free shipping</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span>Secure payment</span>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cartItems, itemCount, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate("/checkout-options");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-foreground" />
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              BookCart
            </h1>
          </div>
          {cartItems.length > 0 && (
            <p className="text-muted-foreground mt-2 text-base ml-10">
              {itemCount} {itemCount === 1 ? "book" : "books"} in your cart
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              Your BookCart is empty
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10">
              Explore our collection of restored classics and new voices waiting to be discovered.
            </p>
            <Button asChild size="lg" className="rounded-xl px-10">
              <Link to="/bookstore">
                Browse Books
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">
            <div>
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator />}
                  <CartItemCard
                    item={item}
                    onRemove={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                </div>
              ))}
              <Separator />
              <div className="pt-6">
                <Link
                  to="/bookstore"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                >
                  ← Continue browsing
                </Link>
              </div>
            </div>

            <div className="lg:sticky lg:top-24">
              <OrderSummary subtotal={subtotal} itemCount={itemCount} onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

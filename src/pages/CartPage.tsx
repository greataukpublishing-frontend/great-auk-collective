import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "The Silent Ocean",
      author: "Jane Rivers",
      price: 14.99,
      cover: "https://via.placeholder.com/200x300",
      quantity: 1,
      format: "eBook",
    },
    {
      id: 2,
      title: "Whispers of the Ancient Forest",
      author: "Elara Green",
      price: 19.99,
      cover: "https://via.placeholder.com/200x300",
      quantity: 2,
      format: "Paperback",
    },
  ]);

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Minimal header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Your Bag
          </h1>
          {cartItems.length > 0 && (
            <p className="text-muted-foreground mt-2 text-lg">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          )}
        </div>

        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              Your bag is empty
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10">
              Explore our collection of restored classics and new voices waiting to be discovered.
            </p>
            <Button asChild size="lg" className="rounded-full px-10">
              <Link to="/bookstore">
                Browse Books
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {/* Cart items */}
            <div>
              {cartItems.map((book, index) => (
                <div key={book.id}>
                  {index > 0 && <Separator />}
                  <div className="py-8 flex gap-6 md:gap-8 items-start">
                    {/* Cover */}
                    <Link to={`/book/${book.id}`} className="shrink-0">
                      <div className="w-20 md:w-28 aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link to={`/book/${book.id}`}>
                            <h3 className="font-display text-lg md:text-xl font-semibold text-foreground leading-tight hover:text-accent transition-colors">
                              {book.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            {book.author}
                          </p>
                          <span className="inline-block text-xs text-muted-foreground mt-2 px-2.5 py-0.5 rounded-full bg-secondary">
                            {book.format}
                          </span>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(book.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 -mt-1"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity & Price row */}
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              updateQuantity(book.id, book.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full border border-input flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium text-foreground w-6 text-center">
                            {book.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(book.id, book.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full border border-input flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="font-display text-lg font-semibold text-foreground">
                          ${(book.price * book.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Summary — clean, bottom-aligned */}
            <div className="pt-8 pb-4 max-w-sm ml-auto space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-accent font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="text-foreground font-medium">Total</span>
                <span className="font-display text-2xl font-bold text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <Button
                size="lg"
                className="w-full rounded-full mt-4 text-base font-semibold"
              >
                Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Secure checkout · 30-day return policy
              </p>
            </div>

            {/* Continue shopping link */}
            <div className="text-center pt-8 pb-4">
              <Link
                to="/bookstore"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

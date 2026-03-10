import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User, BookOpen, LogOut, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import greatAukLogo from "@/assets/great-auk-hero.png";
import { toggleAukCall } from "@/lib/aukSound";
import { useAukPlaying } from "@/hooks/useAukPlaying";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Bookstore", to: "/bookstore" },
  { label: "Self Publishing", to: "/publish" },
  { label: "Membership", to: "/membership" },
  { label: "About", to: "/about" },
];

export default function Navbar() {

  const [open, setOpen] = useState(false);
  const location = useLocation();
  const aukPlaying = useAukPlaying();
  const { user, isAuthor, loading, signOut } = useAuth();
  const { itemCount } = useCart();

  return (

    <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/80">

      <div className="container mx-auto flex items-center justify-between h-16 px-4">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={greatAukLogo}
            alt="Great Auk"
            className={`h-10 w-10 object-contain cursor-pointer hover:scale-110 transition-transform ${aukPlaying ? "auk-playing" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              toggleAukCall();
            }}
            title="Click to hear the Great Auk"
          />
          <span className="font-display text-xl font-bold text-primary-foreground tracking-wide">
            Great Auk <span className="text-gold">Publishing</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden md:flex items-center gap-6">

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-gold"
                  : "text-primary-foreground/80 hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthor && (
            <Link
              to="/author-dashboard"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/author-dashboard"
                  ? "text-gold"
                  : "text-primary-foreground/80 hover:text-gold"
              }`}
            >
              Author Dashboard
            </Link>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3">

          {/* SEARCH */}
          <Link to="/bookstore">
            <Search className="w-5 h-5 text-primary-foreground/80 hover:text-gold transition-colors" />
          </Link>

          {/* CART */}
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-5 h-5 text-primary-foreground/80 hover:text-gold transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {itemCount}
              </span>
            )}
          </Link>

          {!loading && user ? (

            <DropdownMenu>

              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  {user.user_metadata?.display_name || user.email?.split("@")[0] || "Account"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">

                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs font-medium text-foreground">
                    {isAuthor ? "Author" : "Reader"}
                  </p>
                </div>

                <DropdownMenuSeparator />

                {isAuthor && (
                  <DropdownMenuItem asChild>
                    <Link to="/author-dashboard" className="flex items-center gap-2 cursor-pointer">
                      <BookOpen className="w-4 h-4" /> Author Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/bookstore" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingCart className="w-4 h-4" /> Bookstore
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="w-4 h-4" /> My Favorites
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                    <Package className="w-4 h-4" /> My Orders
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          ) : (

            <DropdownMenu>

              <DropdownMenuTrigger asChild>
                <Button variant="hero" size="sm">Login</Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">

                <DropdownMenuItem asChild>
                  <Link to="/reader-login" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingCart className="w-4 h-4" /> Reader Login
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/author-login" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="w-4 h-4" /> Author Login
                  </Link>
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          )}

        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-primary-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary/80 pb-4">

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${
                location.pathname === link.to
                  ? "text-gold"
                  : "text-primary-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthor && (
            <Link
              to="/author-dashboard"
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-primary-foreground/80"
            >
              Author Dashboard
            </Link>
          )}

        </div>
      )}

    </nav>
  );
}


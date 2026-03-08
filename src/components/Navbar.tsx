import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import greatAukLogo from "@/assets/great-auk-hero.png";
import { toggleAukCall } from "@/lib/aukSound";


const navLinks = [
  { label: "Home", to: "/" },
  { label: "Bookstore", to: "/bookstore" },
  { label: "Self Publishing", to: "/publish" },
  { label: "Membership", to: "/membership" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary/80">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={greatAukLogo} 
            alt="Great Auk" 
            className="h-10 w-10 object-contain cursor-pointer hover:scale-110 transition-transform" 
            onClick={(e) => { e.preventDefault(); toggleAukCall(); }}
            title="Click to hear the Great Auk"
          />
          <span className="font-display text-xl font-bold text-primary-foreground tracking-wide">
            Great Auk <span className="text-gold">Books</span>
          </span>
        </Link>

        {/* Desktop nav */}
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
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="text-primary-foreground/80 hover:text-gold transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-primary-foreground/80 hover:text-gold transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
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
                <Link to="/author-dashboard" className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="w-4 h-4" /> Author Login
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-primary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary/80 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${
                location.pathname === link.to ? "text-gold" : "text-primary-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-2 space-y-2">
            <Link to="/reader-login" onClick={() => setOpen(false)}>
              <Button variant="hero" size="sm" className="w-full flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Reader Login
              </Button>
            </Link>
            <Link to="/author-dashboard" onClick={() => setOpen(false)}>
              <Button variant="heroOutline" size="sm" className="w-full flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Author Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

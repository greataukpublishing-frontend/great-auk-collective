import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Search, ShoppingCart, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import greatAukLogo from "@/assets/great-auk-hero.png";

const navLinks = [
  { label: "HOME", to: "/" },
  { label: "SHOP", to: "/bookstore" },
  { label: "CATEGORIES", to: "/bookstore?view=categories" },
  { label: "RARE BOOKS", to: "/bookstore?view=rare" },
  { label: "AUTHORS", to: "/bookstore?view=authors" },
  { label: "SELF PUBLISHING", to: "/publish" },
  { label: "CONTACT", to: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top row: Logo + Search + Icons */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={greatAukLogo} alt="Great Auk" className="h-14 w-14 object-contain" />
            <div className="flex flex-col">
              <span className="font-display text-2xl font-bold text-foreground tracking-wide leading-tight">
                Great Auk Books
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
                Restoring Lost Treasures
              </span>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                placeholder="Search"
                className="w-full pr-10 bg-muted/50 border-border rounded-md h-10 text-sm"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right icons - desktop */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-foreground/70 hover:text-foreground transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/buyer-login" className="flex items-center gap-2 cursor-pointer">
                    <ShoppingCart className="w-4 h-4" /> Buyer Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/author-dashboard" className="flex items-center gap-2 cursor-pointer">
                    <BookOpen className="w-4 h-4" /> Author Login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button className="text-foreground/70 hover:text-foreground transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button className="text-foreground/70 hover:text-foreground transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                0
              </span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Bottom row: Nav links - desktop */}
        <div className="hidden md:flex items-center gap-8 pb-3 -mt-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-xs font-semibold tracking-wider transition-colors ${
                location.pathname === link.to ||
                (link.to !== "/" && location.pathname.startsWith(link.to.split("?")[0]))
                  ? "text-foreground border-b-2 border-primary pb-1"
                  : "text-foreground/60 hover:text-foreground pb-1"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-t border-border pb-4">
          {/* Mobile search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Input placeholder="Search" className="w-full pr-10 bg-muted/50 border-border" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-xs font-semibold tracking-wider ${
                location.pathname === link.to ? "text-foreground bg-muted/50" : "text-foreground/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-3 space-y-2">
            <Link to="/buyer-login" onClick={() => setOpen(false)}>
              <Button variant="hero" size="sm" className="w-full flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Buyer Login
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

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, BookOpen, Crown, Sparkles, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";
import greatAukHero from "@/assets/great-auk-hero.png";
import { toggleAukCall } from "@/lib/aukSound";
import { useAukPlaying } from "@/hooks/useAukPlaying";
import { useFeatureToggles } from "@/hooks/useFeatureToggle";

export default function HomePage() {
  const aukPlaying = useAukPlaying();
  const { isEnabled } = useFeatureToggles();
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("status", "approved")
      .eq("featured", true)
      .limit(8);

    setFeaturedBooks(booksData || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6">
                Discover Timeless<br />
                <span className="text-gold">Books, Restored.</span>
              </h1>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8 max-w-md">
                Great Auk brings rare and forgotten books back to life — curated classics and new discoveries, all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/bookstore">
                  <Button variant="hero" size="lg" className="text-base px-8 py-3">
                    Explore Bookstore
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center animate-fade-in">
              <img
                src={greatAukHero}
                alt="The Great Auk"
                className={`w-72 h-72 object-contain drop-shadow-2xl cursor-pointer hover:scale-105 transition-transform ${aukPlaying ? 'auk-playing' : ''}`}
                onClick={() => toggleAukCall()}
                title="Click to hear the Great Auk"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: BookOpen, title: "Curated Classics", desc: "Hand-picked rare and forgotten books, restored for modern readers" },
            { icon: Sparkles, title: "Quality Editions", desc: "Beautiful formatting with careful editorial attention to every detail" },
            { icon: Crown, title: "Trusted Selection", desc: "Every book reviewed and approved by our team of literary experts" },
          ].map((item) => (
            <div key={item.title} className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-card-foreground text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Curated Selection</p>
              <h2 className="font-display text-3xl font-bold text-foreground">Featured Books</h2>
            </div>
            <Link to="/bookstore" className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author_name}
                price={book.print_price || 0}
                ebookPrice={book.ebook_price || 0}
                category={book.category}
                cover={book.cover_url || ""}
                tag="new"
              />
            ))}
          </div>
        </section>
      )}

      {/* Bring a Book Back CTA */}
      {isEnabled("bring_book_back") && (
        <section className="container mx-auto px-4 py-16">
          <div className="bg-accent/10 rounded-2xl p-10 md:p-14 border border-accent/20 text-center">
            <Heart className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Help Us Discover Rare Books
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Know a rare or overlooked book others should read? Share it with us and help connect timeless works with new readers.
            </p>
            <Link to="/bring-book-back">
              <Button size="lg">
                <Heart className="w-4 h-4 mr-2" /> Suggest a Book
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Become an Author CTA */}
      {isEnabled("self_publishing") && (
        <section className="gradient-hero">
          <div className="container mx-auto px-4 py-24 text-center">
            <BookOpen className="w-12 h-12 text-gold mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Publish Your Book in Minutes
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 text-lg">
              Join thousands of authors who trust Great Auk Publishing to bring their stories to the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/publish">
                <Button variant="hero" size="lg">
                  Start Publishing <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
              {[
                { icon: Sparkles, title: "Easy Upload", desc: "Upload DOCX, PDF or EPUB — we convert it for you" },
                { icon: Crown, title: "Keep 70% Royalty", desc: "Industry-leading author earnings on every sale" },
                { icon: BookOpen, title: "Global Reach", desc: "Sell ebooks, paperbacks, and audiobooks worldwide" },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <item.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                  <h3 className="font-display font-semibold text-primary-foreground text-lg">{item.title}</h3>
                  <p className="text-primary-foreground/70 text-sm mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Membership Teaser */}
      {isEnabled("membership") && (
        <section className="container mx-auto px-4 py-20">
          <div className="bg-card rounded-2xl p-10 md:p-16 border border-border shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Great Auk Membership</p>
              <h2 className="font-display text-3xl font-bold text-card-foreground mb-4">
                Unlimited Reading, One Price
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Subscribe to Great Auk Membership for exclusive discounts, early access to new releases, and unlimited access to our restored classics library.
              </p>
              <Link to="/membership">
                <Button size="lg">Explore Membership</Button>
              </Link>
            </div>
            <div className="flex gap-4">
              {[
                { plan: "Reader", price: "₹799/mo", perks: "10% off all books" },
                { plan: "Premium", price: "₹1,599/mo", perks: "30% off + free classics" },
              ].map((p) => (
                <div key={p.plan} className="bg-background rounded-xl p-6 border border-border text-center min-w-[160px]">
                  <p className="font-display font-semibold text-foreground">{p.plan}</p>
                  <p className="text-2xl font-bold text-accent mt-2">{p.price}</p>
                  <p className="text-xs text-muted-foreground mt-2">{p.perks}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

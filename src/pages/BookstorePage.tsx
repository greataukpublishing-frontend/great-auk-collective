import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = ["All Languages", "English", "Hindi", "Tamil", "Bengali", "Malayalam"];

export default function BookstorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All Languages");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: booksData } = await supabase
      .from("books")
      .select("*")
      .eq("status", "approved")
      .order("featured", { ascending: false });

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("name")
      .order("name");

    if (booksData) setBooks(booksData);
    if (categoriesData) {
      setCategories(["All", ...categoriesData.map(c => c.name)]);
    }
    setLoading(false);
  }

  const filtered = books.filter((b) => {
    const matchCategory = selectedCategory === "All" || b.category === selectedCategory;
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLanguage =
      selectedLanguage === "All Languages" || (b.language || "English") === selectedLanguage;
    return matchCategory && matchSearch && matchLanguage;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    if (sortBy === "price-low") return (a.ebook_price || 0) - (b.ebook_price || 0);
    if (sortBy === "price-high") return (b.ebook_price || 0) - (a.ebook_price || 0);
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return 0;
  });

  const selectClass = "px-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer min-w-[140px]";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-14 md:py-16">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
            Bookstore
          </h1>
          <p className="text-primary-foreground/70 mt-2 text-lg max-w-xl">
            Discover new releases, bestsellers, and restored classics
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Search + Filters */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">Filters:</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={selectClass}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={selectClass}
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== "All").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={selectClass}
            >
              <option value="All Languages">All Languages</option>
              {LANGUAGES.filter(l => l !== "All Languages").map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {(selectedCategory !== "All" || selectedLanguage !== "All Languages" || searchQuery) && (
              <button
                onClick={() => { setSelectedCategory("All"); setSelectedLanguage("All Languages"); setSearchQuery(""); }}
                className="text-xs text-accent hover:text-accent/80 font-medium underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-muted-foreground">
              {sorted.length} {sorted.length === 1 ? "book" : "books"} found
            </p>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border animate-pulse">
                <div className="aspect-[2/3] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {sorted.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                author={book.author_name}
                price={book.print_price || 0}
                ebookPrice={book.ebook_price || 0}
                category={book.category}
                cover={book.cover_url || ""}
                tag={book.featured ? "new" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <BookCard
              id=""
              title=""
              author=""
              price={0}
              cover=""
              category=""
            />
            <p className="text-muted-foreground text-lg mt-4">No books found matching your criteria.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSelectedLanguage("All Languages"); setSearchQuery(""); }}
              className="text-accent hover:text-accent/80 text-sm font-medium mt-2 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

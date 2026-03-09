import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookCard from "@/components/BookCard";
import { supabase } from "@/integrations/supabase/client";

const LANGUAGES = ["All Languages", "English", "Hindi", "Tamil", "Bengali", "Malayalam"];

export default function BookstorePage() {

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
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
      const cats = ["All", ...categoriesData.map(c => c.name)];
      setCategories(cats);
    }

    setLoading(false);
  }

  function toggleLanguage(lang: string) {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  }

  // filtering
  const filtered = books.filter((b) => {

    const matchCategory =
      selectedCategory === "All" || b.category === selectedCategory;

    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLanguage =
      selectedLanguages.length === 0 || selectedLanguages.includes(b.language || "English");

    return matchCategory && matchSearch && matchLanguage;

  });

  // sorting
  const sorted = [...filtered].sort((a, b) => {

    if (sortBy === "featured")
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);

    if (sortBy === "price-low")
      return (a.ebook_price || 0) - (b.ebook_price || 0);

    if (sortBy === "price-high")
      return (b.ebook_price || 0) - (a.ebook_price || 0);

    return 0;
  });

  return (
    <div className="min-h-screen bg-background">

      <Navbar />

      {/* Header */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display text-3xl font-bold text-primary-foreground">
            Bookstore
          </h1>
          <p className="text-primary-foreground/70 mt-2">
            Discover new releases, bestsellers, and restored classics
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">

        {/* Search + Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-input bg-card text-card-foreground text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">

          {categories.map((cat) => (

            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>

          ))}

        </div>

        {/* Language Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-sm font-medium text-muted-foreground mr-1">Language:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedLanguages.includes(lang)
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-card-foreground border-input hover:bg-secondary"
              }`}
            >
              {lang}
            </button>
          ))}
          {selectedLanguages.length > 0 && (
            <button
              onClick={() => setSelectedLanguages([])}
              className="px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Books Grid */}

        {loading ? (

          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading books...</p>
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
                rating={4.5}
                reviews={0}
                category={book.category}
                cover={book.cover_url || ""}
                tag={book.featured ? "new" : undefined}
              />

            ))}

          </div>

        ) : (

          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No books found matching your criteria.
            </p>
          </div>

        )}

      </div>

      <Footer />

    </div>
  );
}

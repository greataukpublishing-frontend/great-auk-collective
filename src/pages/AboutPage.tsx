import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import greatAukHero from "@/assets/great-auk-hero.png";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="text-center mb-12">
          <img src={greatAukHero} alt="Great Auk" className="w-32 h-32 mx-auto mb-6 object-contain" />
          <h1 className="font-display text-4xl font-bold text-foreground">About Great Auk Books</h1>
        </div>
        <div className="prose prose-lg mx-auto text-foreground/80 space-y-6">
          <p>
            The Great Auk was a majestic flightless bird that once roamed the North Atlantic — hunted to extinction by the mid-19th century. Its disappearance became a symbol of irreversible loss.
          </p>
          <p>
            <strong className="text-foreground">Great Auk Books</strong> takes its name from this extinct bird to symbolize our mission: <em>bringing lost knowledge back to life.</em>
          </p>
          <p>
            We are a modern publishing ecosystem that operates on two pillars:
          </p>
          <ul className="space-y-2">
            <li><strong className="text-foreground">Restoring forgotten books</strong> — We identify public domain works in literature, philosophy, science, and more, then carefully restore them for modern readers.</li>
            <li><strong className="text-foreground">Empowering new authors</strong> — Our self-publishing platform lets authors go from manuscript to marketplace in minutes, reaching readers worldwide.</li>
          </ul>
          <p>
            We believe every great book deserves to be read — whether it was written yesterday or two centuries ago.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

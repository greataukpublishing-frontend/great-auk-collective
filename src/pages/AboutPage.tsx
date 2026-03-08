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
            The Great Auk was a majestic flightless bird that once inhabited the North Atlantic. Hunted to extinction by the mid-19th century, its disappearance became a powerful symbol of irreversible loss.
          </p>
          <p>
            <strong className="text-foreground">Great Auk Books</strong> takes its name from this lost species to represent our mission: <em>bringing forgotten knowledge back to life.</em>
          </p>
          <p>
            We are a modern publishing ecosystem built on two pillars:
          </p>
          <h3 className="text-foreground font-display font-semibold text-xl !mt-8 !mb-2">Restoring Forgotten Books</h3>
          <p className="!mt-0">
            We identify valuable public domain works in literature, philosophy, science, and other fields, and carefully restore them for modern readers, preserving ideas that might otherwise fade from memory.
          </p>
          <h3 className="text-foreground font-display font-semibold text-xl !mt-8 !mb-2">Empowering New Authors</h3>
          <p className="!mt-0">
            Our self-publishing platform enables authors to move from manuscript to marketplace with ease, connecting their work to readers around the world.
          </p>
          <p>
            At Great Auk, we believe every great book deserves to be read, whether it was written yesterday or two centuries ago.
          </p>
          <p className="text-sm text-muted-foreground !mt-10">
            Great Auk Books is part of Pillion Intelligence Ltd.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

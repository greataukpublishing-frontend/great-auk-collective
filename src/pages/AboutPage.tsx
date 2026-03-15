import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import greatAukHero from "@/assets/great-auk-hero.png";
import { toggleAukCall } from "@/lib/aukSound";
import { useAukPlaying } from "@/hooks/useAukPlaying";
import { useFeatureToggles } from "@/hooks/useFeatureToggle";

export default function AboutPage() {
  const aukPlaying = useAukPlaying();
  const { isEnabled } = useFeatureToggles();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="text-center mb-12">
          <img src={greatAukHero} alt="Great Auk" className={`w-32 h-32 mx-auto mb-6 object-contain cursor-pointer hover:scale-105 transition-transform ${aukPlaying ? 'auk-playing' : ''}`} onClick={() => toggleAukCall()} title="Click to hear the Great Auk" />
          <h1 className="font-display text-4xl font-bold text-foreground">About Great Auk Publishing</h1>
        </div>
        <div className="prose prose-lg mx-auto text-foreground/80 space-y-6">
          <p>
            The Great Auk was a majestic flightless bird that once inhabited the North Atlantic. Hunted to extinction by the mid-19th century, its disappearance became a powerful symbol of irreversible loss.
          </p>
          <p>
            <strong className="text-foreground">Great Auk Publishing</strong> takes its name from this remarkable species to represent our commitment to <em>preserving and sharing exceptional literature.</em>
          </p>
          {isEnabled("book_restoration") && (
            <>
              <p>
                We are a modern publishing ecosystem built on two pillars:
              </p>
              <h3 className="text-foreground font-display font-semibold text-xl !mt-8 !mb-2">Restoring Forgotten Books</h3>
              <p className="!mt-0">
                We identify valuable public domain works in literature, philosophy, science, and other fields, and carefully restore them for modern readers, preserving ideas that might otherwise fade from memory.
              </p>
            </>
          )}
          {isEnabled("self_publishing") && (
            <>
              <h3 className="text-foreground font-display font-semibold text-xl !mt-8 !mb-2">Empowering New Authors</h3>
              <p className="!mt-0">
                Our self-publishing platform enables authors to move from manuscript to marketplace with ease, connecting their work to readers around the world.
              </p>
            </>
          )}
          <p>
            At Great Auk, we believe every great book deserves to be read — wherever it comes from.
          </p>
          <p className="text-sm text-muted-foreground !mt-10">
            Great Auk Publishing is an independent digital bookstore.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

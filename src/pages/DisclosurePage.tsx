import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DisclosurePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Affiliate Disclosure</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 2025</p>
        <div className="space-y-6 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Amazon Associates Programme</h2>
            <p>Great Auk Publishing is a participant in the Amazon Services LLC Associates Programme, an affiliate advertising programme designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and its affiliated sites.</p>
            <p className="mt-3">When you click on a "Buy on Amazon" link on our site and make a purchase, we may earn a small commission at <strong>no additional cost to you</strong>. These commissions help us keep the site running and support independent authors.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Which Links Are Affiliate Links?</h2>
            <p>Any "Buy on Amazon" button on our book pages may be an affiliate link. We display the notice <em>"As an Amazon Associate, we earn from qualifying purchases"</em> near these links throughout the site so you always know.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Our Editorial Independence</h2>
            <p>Our book recommendations and editorial content are based solely on our own genuine assessment. We only feature books we believe are valuable to our readers. Affiliate relationships do not influence which books we feature or how we review them.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Contact</h2>
            <p>If you have any questions about our affiliate relationships, please contact us at <a href="mailto:greataukpublishing@gmail.com" className="text-accent hover:underline">greataukpublishing@gmail.com</a> or visit our <a href="/contact" className="text-accent hover:underline">Contact page</a>.</p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}

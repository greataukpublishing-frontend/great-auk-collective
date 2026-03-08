import { Link } from "react-router-dom";
import { ArrowRight, Upload, DollarSign, CheckCircle, BookOpen, Headphones, Paintbrush, Globe, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useFeatureToggles } from "@/hooks/useFeatureToggle";

const steps = [
  { num: "01", icon: BookOpen, title: "Book Details", desc: "Enter title, description, keywords, and choose your category." },
  { num: "02", icon: Upload, title: "Upload Manuscript", desc: "Upload DOCX, PDF, or EPUB. We convert it to ebook format." },
  { num: "03", icon: Paintbrush, title: "Upload Cover & ISBN", desc: "Upload your cover art. We generate ISBN for your region." },
  { num: "04", icon: DollarSign, title: "Set Pricing", desc: "Set ebook and paperback prices. Keep 70% of every sale." },
  { num: "05", icon: CheckCircle, title: "Submit for Review", desc: "Our team reviews your book before it goes live." },
];

const services = [
  { icon: Paintbrush, title: "Cover Design", desc: "Professional book cover design from $99", price: "From $99" },
  { icon: BookOpen, title: "Editing", desc: "Developmental, copy editing & proofreading", price: "From $199" },
  { icon: Headphones, title: "Audiobook Production", desc: "Convert your book to professional audiobook", price: "From $499" },
  { icon: Globe, title: "Translation", desc: "Translate your book to 20+ languages", price: "From $299" },
  { icon: BarChart3, title: "Marketing", desc: "Boost your book with targeted campaigns", price: "From $149" },
];

export default function PublishPage() {
  const { isEnabled, loading } = useFeatureToggles();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-4">Self Publishing Platform</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Publish Your Book<br />With <span className="text-gold">Great Auk</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
            From manuscript to marketplace in minutes. Reach readers worldwide with ebooks, paperbacks, and audiobooks.
          </p>
          <Link to="/author-dashboard">
            <Button variant="hero" size="lg">
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      {isEnabled('publish_how_it_works') && (
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Simple Process</p>
          <h2 className="font-display text-3xl font-bold text-foreground">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="text-center group">
              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-xs text-accent font-bold">{step.num}</span>
              <h3 className="font-display font-semibold text-foreground mt-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Royalties */}
      <section className="bg-secondary/50">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
            <div>
              <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Author Earnings</p>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Keep 70% of Every Sale</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe authors deserve the lion's share. Our transparent royalty model ensures you earn more from every book sold.
              </p>
              <ul className="space-y-3 text-sm">
                {["70% royalty on ebook sales", "70% royalty on paperback sales", "Monthly payouts via Stripe or PayPal", "Real-time sales analytics dashboard"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center">
              <p className="text-muted-foreground text-sm mb-2">Your Earnings Per Sale</p>
              <div className="flex justify-center items-end gap-6 my-6">
                <div>
                  <div className="w-20 bg-primary rounded-t-lg" style={{ height: 140 }} />
                  <p className="font-display font-bold text-foreground mt-2">70%</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
                <div>
                  <div className="w-20 bg-accent rounded-t-lg" style={{ height: 60 }} />
                  <p className="font-display font-bold text-foreground mt-2">30%</p>
                  <p className="text-xs text-muted-foreground">Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Services */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Premium Services</p>
          <h2 className="font-display text-3xl font-bold text-foreground">Boost Your Book</h2>
          <p className="text-muted-foreground mt-2">Professional services to help your book stand out</p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((svc) => (
            <div key={svc.title} className="bg-card rounded-lg p-6 border border-border text-center hover:shadow-lg transition-shadow">
              <svc.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <h3 className="font-display font-semibold text-card-foreground">{svc.title}</h3>
              <p className="text-xs text-muted-foreground mt-2">{svc.desc}</p>
              <p className="text-sm font-bold text-accent mt-3">{svc.price}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

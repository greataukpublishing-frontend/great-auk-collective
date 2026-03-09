import { Check, Crown, BookOpen, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free Reader",
    price: "Free",
    icon: BookOpen,
    perks: ["Browse full catalog", "Purchase books at full price", "Write reviews", "Create wishlists"],
    featured: false,
  },
  {
    name: "Reader Membership",
    price: "$9.99/mo",
    icon: Star,
    perks: ["10% off all purchases", "Early access to new releases", "Free restored classics library", "Priority support"],
    featured: false,
  },
  {
    name: "Premium Membership",
    price: "$19.99/mo",
    icon: Crown,
    perks: ["30% off all purchases", "Unlimited restored classics", "Exclusive author events", "Free audiobook credits (2/mo)", "VIP support"],
    featured: true,
  },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="gradient-hero">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">Membership</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Read More, Pay Less
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
            Subscribe to Great Auk Membership for exclusive discounts and unlimited access to restored classics.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto -mt-24 relative z-10">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-card rounded-xl p-8 border shadow-lg ${
              plan.featured ? "border-accent ring-2 ring-accent/30 scale-105" : "border-border"
            }`}>
              {plan.featured && (
                <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
              )}
              <plan.icon className={`w-8 h-8 mt-4 ${plan.featured ? "text-accent" : "text-primary"}`} />
              <h3 className="font-display text-xl font-bold text-card-foreground mt-3">{plan.name}</h3>
              <p className="text-3xl font-bold text-card-foreground mt-2">{plan.price}</p>
              <ul className="mt-6 space-y-3">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2 text-sm text-card-foreground">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" /> {perk}
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-8" variant={plan.featured ? "hero" : "default"}>
                {plan.price === "Free" ? "Sign Up Free" : "Subscribe Now"}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

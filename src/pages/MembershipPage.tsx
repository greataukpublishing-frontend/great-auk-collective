import { useState, useEffect } from "react";
import { Check, Crown, BookOpen, Star } from "lucide-react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureToggles } from "@/hooks/useFeatureToggle";

const icons = [BookOpen, Star, Crown];

export default function MembershipPage() {
  const { isEnabled, loading: featureLoading } = useFeatureToggles();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("membership_plans")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setPlans(data ?? []);
        setLoading(false);
      });
  }, []);

  if (!featureLoading && !isEnabled("membership")) {
    return <Navigate to="/" replace />;
  }

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
        {loading ? (
          <p className="text-center text-muted-foreground py-20">Loading plans...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto -mt-24 relative z-10">
            {plans.map((plan, i) => {
              const Icon = icons[Math.min(i, icons.length - 1)];
              return (
                <div key={plan.id} className={`bg-card rounded-xl p-8 border shadow-lg ${
                  plan.featured ? "border-accent ring-2 ring-accent/30 scale-105" : "border-border"
                }`}>
                  {plan.featured && (
                    <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  )}
                  <Icon className={`w-8 h-8 mt-4 ${plan.featured ? "text-accent" : "text-primary"}`} />
                  <h3 className="font-display text-xl font-bold text-card-foreground mt-3">{plan.name}</h3>
                  <p className="text-3xl font-bold text-card-foreground mt-2">{plan.price}</p>
                  <ul className="mt-6 space-y-3">
                    {(plan.perks ?? []).map((perk: string) => (
                      <li key={perk} className="flex items-center gap-2 text-sm text-card-foreground">
                        <Check className="w-4 h-4 text-accent flex-shrink-0" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8" variant={plan.featured ? "hero" : "default"}>
                    {plan.price === "Free" ? "Sign Up Free" : "Subscribe Now"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

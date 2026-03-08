import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BookOpen } from "lucide-react";

export default function AuthorLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/author-dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, signup_type: "author" },
          emailRedirectTo: window.location.origin + "/author-login",
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Email already in use", description: "This email is already registered. If you signed up as a reader, please use a different email for your author account.", variant: "destructive" });
        } else {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link. Please verify your email before signing in." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/author-dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isSignUp ? "Create Author Account" : "Author Login"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp ? "Join Great Auk Books as an author" : "Access your author dashboard"}
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your author name"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="author@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-medium hover:underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              Reader accounts cannot be used here. Use a different email than your reader account.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

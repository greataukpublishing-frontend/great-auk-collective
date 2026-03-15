import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { useFeatureToggles } from "@/hooks/useFeatureToggle";

export default function ReaderLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnabled } = useFeatureToggles();

  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName, signup_type: "reader" },
          emailRedirectTo: window.location.origin + "/reader-login",
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Email already in use", description: "This email is already registered. If you signed up as an author, please use a different email for your reader account.", variant: "destructive" });
        } else {
          toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
        }
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link. Please verify your email before signing in.",
        });
        setIsSignUp(false);
      }
      setLoading(false);
      return;
    }

    // Sign in flow
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check roles - block admins from using reader login
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const roleList = roles?.map((r) => r.role) ?? [];

    if (roleList.includes("admin")) {
      await supabase.auth.signOut();
      toast({
        title: "Access denied",
        description: "Please use the admin login portal.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (roleList.includes("author") && !roleList.includes("reader")) {
      await supabase.auth.signOut();
      toast({
        title: "Wrong login page",
        description: "You are registered as an author. Please sign in from the Author login page.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Welcome back!", description: "You're now signed in." });
    navigate(redirectTo || "/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isSignUp
                ? "Join Great Auk Publishing to discover and purchase books"
                : "Sign in to access your library and purchases"}
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
                    placeholder="Your name"
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
                  placeholder="you@example.com"
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
                {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-3"
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: window.location.origin + "/bookstore" }
                  });
                }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
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
          </div>

          {isEnabled("self_publishing") && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Are you an author?{" "}
            <a href="/author-login" className="text-primary hover:underline">
              Sign in here
            </a>
          </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

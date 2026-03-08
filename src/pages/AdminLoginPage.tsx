import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Please check your email to verify, then sign in." });
        setIsSignUp(false);
      }
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      // Wait for auth lock to settle
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Retry roles query up to 3 times
      let roles: any[] | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { data: rolesData, error: rolesError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id);
          
          if (!rolesError && rolesData) {
            roles = rolesData;
            break;
          }
          console.log(`Roles attempt ${attempt + 1} failed:`, rolesError?.message);
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (e) {
          console.log(`Roles attempt ${attempt + 1} exception:`, e);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log("Final roles result:", JSON.stringify(roles));

      if (roles && roles.length > 0 && roles.some((r) => r.role === "admin")) {
        window.location.href = "/admin";
        return;
      } else {
        await supabase.auth.signOut();
        toast({ title: "Access denied", description: "This account does not have admin privileges.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground mt-2">Platform management access</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
              <button type="button" className="text-primary underline" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

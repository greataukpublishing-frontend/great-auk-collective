import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-4 duration-300">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl">
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          We use cookies to enhance your experience and analyse site traffic.{" "}
          <Link to="/privacy-policy" className="underline hover:text-foreground">
            Learn more
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={accept}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

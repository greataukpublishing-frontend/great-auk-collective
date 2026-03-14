import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedAuthorRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthor, loading } = useAuth();
  const [featureReady, setFeatureReady] = useState(false);
  const [selfPublishingEnabled, setSelfPublishingEnabled] = useState(true);

  useEffect(() => {
    let active = true;

    const loadFeature = async () => {
      const { data, error } = await supabase
        .from("site_features")
        .select("enabled")
        .eq("key", "self_publishing")
        .maybeSingle();

      if (!active) return;

      if (!error && data) {
        setSelfPublishingEnabled(data.enabled);
      }

      setFeatureReady(true);
    };

    loadFeature();

    return () => {
      active = false;
    };
  }, []);

  if (loading || !featureReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!selfPublishingEnabled) {
    return <Navigate to="/" replace />;
  }

  if (!user || !isAuthor) {
    return <Navigate to="/author-login" replace />;
  }

  return <>{children}</>;
}

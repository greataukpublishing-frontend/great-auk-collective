import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureToggle {
  key: string;
  label: string;
  enabled: boolean;
}

export function useFeatureToggles() {
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase.from("site_features").select("key, label, enabled");
    setFeatures((data as FeatureToggle[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const isEnabled = (key: string) => features.find(f => f.key === key)?.enabled ?? true;

  return { features, loading, isEnabled, refetch: fetch };
}

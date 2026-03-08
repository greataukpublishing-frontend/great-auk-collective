import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ToggleRight } from "lucide-react";

interface Feature {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
}

interface Props {
  onRefresh: () => void;
}

export default function AdminFeatureToggles({ onRefresh }: Props) {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatures = async () => {
    const { data } = await supabase.from("site_features").select("*");
    setFeatures((data as Feature[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, []);

  const toggle = async (id: string, current: boolean) => {
    await supabase.from("site_features").update({ enabled: !current } as any).eq("id", id);
    toast({ title: `Feature ${current ? "hidden" : "shown"} on website` });
    fetchFeatures();
    onRefresh();
  };

  if (loading) return <p className="text-muted-foreground py-8 text-center">Loading features...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Feature Toggles</h2>
        <p className="text-muted-foreground text-sm mt-1">Show or hide sections across the website instantly</p>
      </div>

      <div className="grid gap-3">
        {features.map(f => (
          <Card key={f.id}>
            <CardContent className="flex items-center justify-between py-4 px-5">
              <div className="flex items-center gap-3">
                <ToggleRight className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium text-foreground">{f.label}</Label>
                  <p className="text-xs text-muted-foreground">Key: {f.key}</p>
                </div>
              </div>
              <Switch checked={f.enabled} onCheckedChange={() => toggle(f.id, f.enabled)} />
            </CardContent>
          </Card>
        ))}
      </div>

      {features.length === 0 && <p className="text-center py-8 text-muted-foreground">No feature toggles configured.</p>}
    </div>
  );
}

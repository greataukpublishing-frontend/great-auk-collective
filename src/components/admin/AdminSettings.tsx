import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  settings: any[];
  onRefresh: () => void;
}

const SETTING_LABELS: Record<string, { label: string; description: string; type: string }> = {
  commission_rate: { label: "Platform Commission (%)", description: "Percentage taken from each sale (e.g. 30 = 30%)", type: "number" },
  min_ebook_price: { label: "Minimum eBook Price ($)", description: "Lowest price an author can set for an eBook", type: "number" },
  min_print_price: { label: "Minimum Print Price ($)", description: "Lowest price for printed books", type: "number" },
  platform_name: { label: "Platform Name", description: "Displayed across the website", type: "text" },
  contact_email: { label: "Contact Email", description: "Main contact email shown to users", type: "email" },
};

export default function AdminSettings({ settings, onRefresh }: Props) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const v: Record<string, string> = {};
    settings.forEach(s => { v[s.key] = s.value; });
    setValues(v);
  }, [settings]);

  const saveSettings = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(values)) {
      await supabase.from("platform_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    }
    toast({ title: "Settings saved!" });
    setSaving(false);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Platform Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure platform-wide settings and preferences</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {Object.entries(SETTING_LABELS).map(([key, meta]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-sm font-medium">{meta.label}</Label>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
              <Input
                type={meta.type}
                value={values[key] ?? ""}
                onChange={e => setValues({ ...values, [key]: e.target.value })}
                className="max-w-md"
              />
            </div>
          ))}

          <Button onClick={saveSettings} disabled={saving} className="gap-1">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Display any custom settings not in SETTING_LABELS */}
      {settings.filter(s => !SETTING_LABELS[s.key]).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Other Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {settings.filter(s => !SETTING_LABELS[s.key]).map(s => (
              <div key={s.key} className="space-y-1">
                <Label className="text-sm font-medium">{s.key}</Label>
                <Input value={values[s.key] ?? ""} onChange={e => setValues({ ...values, [s.key]: e.target.value })} className="max-w-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

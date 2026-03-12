import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  perks: string[];
  featured: boolean;
  sort_order: number;
}

interface Props {
  onRefresh: () => void;
}

export default function AdminMembership({ onRefresh }: Props) {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", perks: "", featured: false });

  const fetchPlans = async () => {
    const { data } = await supabase.from("membership_plans").select("*").order("sort_order");
    setPlans((data as Plan[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const startEdit = (plan: Plan) => {
    setEditing(plan.id);
    setForm({ name: plan.name, price: plan.price, perks: plan.perks.join("\n"), featured: plan.featured });
  };

  const save = async () => {
    if (!editing) return;
    const perksArray = form.perks.split("\n").map(p => p.trim()).filter(Boolean);
    await supabase.from("membership_plans").update({
      name: form.name,
      price: form.price,
      perks: perksArray,
      featured: form.featured,
    } as any).eq("id", editing);
    toast({ title: "Plan updated" });
    setEditing(null);
    fetchPlans();
    onRefresh();
  };

  const addPlan = async () => {
    await supabase.from("membership_plans").insert({
      name: "New Plan",
      price: "₹0/mo",
      perks: ["Perk 1"],
      sort_order: plans.length + 1,
    } as any);
    toast({ title: "Plan added" });
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    await supabase.from("membership_plans").delete().eq("id", id);
    toast({ title: "Plan deleted" });
    fetchPlans();
  };

  if (loading) return <p className="text-muted-foreground py-8 text-center">Loading plans...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Membership Plans</h2>
          <p className="text-muted-foreground text-sm mt-1">Edit plan names, pricing, and perks. Toggle membership visibility from Feature Toggles.</p>
        </div>
        <Button onClick={addPlan} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </Button>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="py-5 px-5">
              {editing === plan.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Plan Name</Label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Price</Label>
                      <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. ₹799/mo or Free" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Perks (one per line)</Label>
                    <textarea
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                      value={form.perks}
                      onChange={e => setForm(f => ({ ...f, perks: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
                    <Label className="text-sm">Featured (highlighted)</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={save}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{plan.name} {plan.featured && <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full ml-2">Featured</span>}</p>
                      <p className="text-sm text-muted-foreground">{plan.price} · {plan.perks.length} perks</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(plan)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && <p className="text-center py-8 text-muted-foreground">No membership plans configured.</p>}
    </div>
  );
}

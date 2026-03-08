import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  services: any[];
  serviceOrders: any[];
  onRefresh: () => void;
}

export default function AdminServices({ services, serviceOrders, onRefresh }: Props) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: 0 });

  const addService = async () => {
    if (!form.name.trim()) return;
    await supabase.from("premium_services").insert(form as any);
    toast({ title: "Service added" });
    setForm({ name: "", description: "", price: 0 });
    setShowAdd(false);
    onRefresh();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("premium_services").update({ active: !active }).eq("id", id);
    toast({ title: active ? "Service deactivated" : "Service activated" });
    onRefresh();
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await supabase.from("premium_services").delete().eq("id", id);
    toast({ title: "Service deleted" });
    onRefresh();
  };

  const totalServiceRevenue = serviceOrders.reduce((s: number, o: any) => s + Number(o.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Premium Services</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage editing, design, marketing, and other services for authors</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1"><Plus className="w-4 h-4" /> Add Service</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Total Services</p><p className="text-xl font-bold">{services.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Service Revenue</p><p className="text-xl font-bold">${totalServiceRevenue.toFixed(2)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => {
          const orderCount = serviceOrders.filter(o => o.service_id === s.id).length;
          return (
            <Card key={s.id} className={!s.active ? "opacity-60" : ""}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{s.name}</p>
                    <Badge variant={s.active ? "default" : "secondary"} className="mt-1">{s.active ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggleActive(s.id, s.active)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteService(s.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{s.description || "No description"}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 font-medium text-foreground"><DollarSign className="w-3.5 h-3.5" />${Number(s.price).toFixed(2)}</span>
                  <span className="text-muted-foreground">{orderCount} orders</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {services.length === 0 && <p className="text-center py-8 text-muted-foreground">No services created yet. Click "Add Service" to start.</p>}

      {/* Service Orders */}
      {serviceOrders.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b border-border"><p className="font-medium text-foreground">Recent Service Orders</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="p-3">Date</th><th className="p-3">Service</th><th className="p-3">Amount</th><th className="p-3">Status</th>
                </tr></thead>
                <tbody>
                  {serviceOrders.map(o => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-foreground">{services.find(s => s.id === o.service_id)?.name ?? "Unknown"}</td>
                      <td className="p-3 font-medium">${Number(o.amount).toFixed(2)}</td>
                      <td className="p-3"><Badge variant="secondary">{o.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Premium Service</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Service Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Professional Editing" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What's included..." /></div>
            <div><Label>Price ($)</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} /></div>
            <Button onClick={addService} className="w-full">Add Service</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

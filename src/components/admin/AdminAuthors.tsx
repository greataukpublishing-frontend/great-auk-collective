import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, DollarSign, ShoppingCart, UserX, UserCheck, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Props {
  profiles: any[];
  books: any[];
  orders: any[];
  roles: any[];
  onRefresh: () => void;
}

export default function AdminAuthors({ profiles, books, orders, roles, onRefresh }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  
  const getRole = (id: string) => roles.find((r: any) => r.user_id === id)?.role ?? "reader";
  const authors = profiles.filter(p => getRole(p.id) === "author" || getRole(p.id) === "admin");
  
  const filtered = authors.filter(a => 
    (a.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const suspendAuthor = async (id: string, suspended: boolean) => {
    await supabase.from("profiles").update({ suspended: !suspended }).eq("id", id);
    toast({ title: suspended ? "Author reactivated" : "Author suspended" });
    onRefresh();
  };

  const demoteToReader = async (id: string) => {
    if (!confirm("Remove author privileges? They won't be able to publish.")) return;
    await supabase.from("user_roles").delete().eq("user_id", id);
    await supabase.from("user_roles").insert({ user_id: id, role: "reader" as any });
    toast({ title: "Demoted to reader" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Author Management</h2>
        <p className="text-muted-foreground text-sm mt-1">View, verify, and manage all authors on the platform</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search authors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map(a => {
          const authorBooks = books.filter(b => b.author_id === a.id);
          const authorOrders = orders.filter(o => authorBooks.some(b => b.id === o.book_id));
          const earnings = authorOrders.reduce((s: number, o: any) => s + Number(o.author_share), 0);
          const sales = authorOrders.reduce((s: number, o: any) => s + Number(o.amount), 0);

          return (
            <Card key={a.id} className={a.suspended ? "opacity-60 border-destructive/30" : ""}>
              <CardContent className="pt-5 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{(a.display_name ?? "?")[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{a.display_name ?? "Unknown"}</p>
                        <Badge variant={getRole(a.id) === "admin" ? "destructive" : "default"}>{getRole(a.id)}</Badge>
                        {a.suspended && <Badge variant="destructive">Suspended</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">Joined {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{authorBooks.length} books</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{authorOrders.length} sales</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <DollarSign className="w-4 h-4" />
                      <span>${earnings.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => suspendAuthor(a.id, a.suspended)}>
                      {a.suspended ? <><UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate</> : <><UserX className="w-3.5 h-3.5 mr-1" /> Suspend</>}
                    </Button>
                    {getRole(a.id) !== "admin" && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => demoteToReader(a.id)}>
                        Demote
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No authors found.</p>}
      </div>
    </div>
  );
}

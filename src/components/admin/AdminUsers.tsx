import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, UserCheck, UserX, Shield, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  profiles: any[];
  roles: any[];
  onRefresh: () => void;
}

export default function AdminUsers({ profiles, roles, onRefresh }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const getRole = (id: string) => roles.find((r: any) => r.user_id === id)?.role ?? "reader";
  const filtered = profiles.filter(p =>
    (p.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const setUserRole = async (userId: string, role: "admin" | "author" | "reader") => {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    toast({ title: `Role updated to ${role}` });
    onRefresh();
  };

  const suspendUser = async (id: string, suspended: boolean) => {
    await supabase.from("profiles").update({ suspended: !suspended }).eq("id", id);
    toast({ title: suspended ? "User reactivated" : "User suspended" });
    onRefresh();
  };

  const roleColor = (r: string) => r === "admin" ? "destructive" : r === "author" ? "default" : "secondary";

  const readers = filtered.filter(p => getRole(p.id) === "reader").length;
  const authorsCount = filtered.filter(p => getRole(p.id) === "author").length;
  const admins = filtered.filter(p => getRole(p.id) === "admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage all registered users, change roles, and suspend accounts</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Readers</p><p className="text-lg font-bold">{readers}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Authors</p><p className="text-lg font-bold">{authorsCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Admins</p><p className="text-lg font-bold">{admins}</p></CardContent></Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map(p => (
          <div key={p.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3 ${p.suspended ? 'opacity-60 border-destructive/30' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">{(p.display_name ?? "?")[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{p.display_name ?? "Unknown"}</p>
                  <Badge variant={roleColor(getRole(p.id))}>{getRole(p.id)}</Badge>
                  {p.suspended && <Badge variant="destructive">Suspended</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {getRole(p.id) !== "author" && (
                <Button size="sm" variant="outline" onClick={() => setUserRole(p.id, "author")} className="gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Make Author
                </Button>
              )}
              {getRole(p.id) !== "reader" && getRole(p.id) !== "admin" && (
                <Button size="sm" variant="ghost" onClick={() => setUserRole(p.id, "reader")}>Make Reader</Button>
              )}
              <Button size="sm" variant={p.suspended ? "outline" : "ghost"} onClick={() => suspendUser(p.id, p.suspended)} className={p.suspended ? "" : "text-destructive"}>
                {p.suspended ? <><UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate</> : <><UserX className="w-3.5 h-3.5 mr-1" /> Suspend</>}
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No users found.</p>}
      </div>
    </div>
  );
}

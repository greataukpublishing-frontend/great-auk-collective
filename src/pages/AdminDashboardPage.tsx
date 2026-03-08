import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, BookOpen, Users, ShoppingCart, UserCheck,
  LogOut, CheckCircle, XCircle, Star, Search, Eye
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Book = Tables<"books">;
type Profile = Tables<"profiles">;
type Order = Tables<"orders">;

export default function AdminDashboardPage() {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [books, setBooks] = useState<Book[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [roles, setRoles] = useState<{ user_id: string; role: string }[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    const [booksRes, profilesRes, ordersRes, rolesRes] = await Promise.all([
      supabase.from("books").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setBooks(booksRes.data ?? []);
    setProfiles(profilesRes.data ?? []);
    setOrders(ordersRes.data ?? []);
    setRoles(rolesRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Stats
  const totalBooks = books.length;
  const pendingBooks = books.filter(b => b.status === "pending").length;
  const approvedBooks = books.filter(b => b.status === "approved").length;
  const totalUsers = profiles.length;
  const totalAuthors = roles.filter(r => r.role === "author").length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount), 0);
  const platformRevenue = orders.reduce((s, o) => s + Number(o.platform_share), 0);

  // Book actions
  const updateBookStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("books").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Book ${status}` });
    fetchAll();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("books").update({ featured: !current }).eq("id", id);
    fetchAll();
  };

  // Role actions
  const setUserRole = async (userId: string, role: "admin" | "author" | "reader") => {
    // Remove existing roles, add new
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Role updated to ${role}` });
    fetchAll();
  };

  const getUserRole = (userId: string) => roles.find(r => r.user_id === userId)?.role ?? "reader";

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author_name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProfiles = profiles.filter(p =>
    (p.display_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === "admin") return "destructive";
    if (role === "author") return "default";
    return "secondary";
  };

  const statusColor = (status: string) => {
    if (status === "approved") return "default";
    if (status === "pending") return "secondary";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="sticky top-0 z-50 bg-primary border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-gold" />
            <span className="font-display text-lg font-bold text-primary-foreground">
              Great Auk <span className="text-gold">Admin</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground/80 hover:text-gold" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview" className="gap-1"><LayoutDashboard className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="books" className="gap-1"><BookOpen className="w-4 h-4" /> Books</TabsTrigger>
            <TabsTrigger value="authors" className="gap-1"><UserCheck className="w-4 h-4" /> Authors</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="orders" className="gap-1"><ShoppingCart className="w-4 h-4" /> Orders</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Books", value: totalBooks, icon: BookOpen },
                { label: "Pending Approval", value: pendingBooks, icon: Eye },
                { label: "Approved", value: approvedBooks, icon: CheckCircle },
                { label: "Total Users", value: totalUsers, icon: Users },
                { label: "Authors", value: totalAuthors, icon: UserCheck },
                { label: "Total Orders", value: orders.length, icon: ShoppingCart },
                { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: Star },
                { label: "Platform Share", value: `$${platformRevenue.toFixed(2)}`, icon: Star },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <s.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-bold text-foreground">{s.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent pending books */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Pending Book Submissions</CardTitle></CardHeader>
              <CardContent>
                {books.filter(b => b.status === "pending").length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pending submissions.</p>
                ) : (
                  <div className="space-y-3">
                    {books.filter(b => b.status === "pending").slice(0, 5).map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-foreground">{b.title}</p>
                          <p className="text-sm text-muted-foreground">by {b.author_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateBookStatus(b.id, "approved")}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateBookStatus(b.id, "rejected")}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BOOKS */}
          <TabsContent value="books">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3">Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map(b => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-3 font-medium text-foreground">{b.title}</td>
                      <td className="p-3 text-muted-foreground">{b.author_name}</td>
                      <td className="p-3 text-muted-foreground">{b.category}</td>
                      <td className="p-3"><Badge variant={statusColor(b.status)}>{b.status}</Badge></td>
                      <td className="p-3">
                        <button onClick={() => toggleFeatured(b.id, b.featured ?? false)}>
                          <Star className={`w-4 h-4 ${b.featured ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                        </button>
                      </td>
                      <td className="p-3 text-muted-foreground">${Number(b.ebook_price ?? 0).toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {b.status !== "approved" && (
                            <Button size="sm" variant="ghost" onClick={() => updateBookStatus(b.id, "approved")}>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                          )}
                          {b.status !== "rejected" && (
                            <Button size="sm" variant="ghost" onClick={() => updateBookStatus(b.id, "rejected")}>
                              <XCircle className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBooks.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No books found.</p>
              )}
            </div>
          </TabsContent>

          {/* AUTHORS */}
          <TabsContent value="authors">
            <div className="space-y-3">
              {profiles.filter(p => getUserRole(p.id) === "author" || getUserRole(p.id) === "admin").map(p => {
                const authorBooks = books.filter(b => b.author_id === p.id);
                const authorSales = orders.filter(o => authorBooks.some(b => b.id === o.book_id));
                const earnings = authorSales.reduce((s, o) => s + Number(o.author_share), 0);
                return (
                  <Card key={p.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="font-medium text-foreground">{p.display_name ?? "Unknown"}</p>
                          <Badge variant={roleColor(getUserRole(p.id))} className="mt-1">{getUserRole(p.id)}</Badge>
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <span>{authorBooks.length} books</span>
                          <span>{authorSales.length} sales</span>
                          <span>${earnings.toFixed(2)} earned</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setUserRole(p.id, "reader")}>
                            Demote to Reader
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {profiles.filter(p => getUserRole(p.id) === "author" || getUserRole(p.id) === "admin").length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No authors yet.</p>
              )}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users">
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              {filteredProfiles.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-foreground">{p.display_name ?? "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleColor(getUserRole(p.id))}>{getUserRole(p.id)}</Badge>
                    <div className="flex gap-1">
                      {getUserRole(p.id) !== "author" && (
                        <Button size="sm" variant="outline" onClick={() => setUserRole(p.id, "author")}>Make Author</Button>
                      )}
                      {getUserRole(p.id) !== "reader" && getUserRole(p.id) !== "admin" && (
                        <Button size="sm" variant="ghost" onClick={() => setUserRole(p.id, "reader")}>Make Reader</Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ORDERS */}
          <TabsContent value="orders">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-xs text-muted-foreground">Platform Share (30%)</p>
                  <p className="text-2xl font-bold text-foreground">${platformRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Author Share</th>
                    <th className="p-3">Platform Share</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="border-b border-border/50">
                      <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="p-3 font-medium text-foreground">${Number(o.amount).toFixed(2)}</td>
                      <td className="p-3 text-muted-foreground">${Number(o.author_share).toFixed(2)}</td>
                      <td className="p-3 text-muted-foreground">${Number(o.platform_share).toFixed(2)}</td>
                      <td className="p-3"><Badge variant="secondary">{o.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No orders yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

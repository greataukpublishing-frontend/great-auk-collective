import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, Star, Pencil, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  books: any[];
  categories: any[];
  onRefresh: () => void;
}

export default function AdminBooks({ books, categories, onRefresh }: Props) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editBook, setEditBook] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const filtered = books.filter(b => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("books").update({ status }).eq("id", id);
    toast({ title: `Book ${status}` });
    onRefresh();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("books").update({ featured: !current }).eq("id", id);
    toast({ title: current ? "Removed from featured" : "Added to featured" });
    onRefresh();
  };

  const deleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    await supabase.from("books").delete().eq("id", id);
    toast({ title: "Book deleted" });
    onRefresh();
  };

  const openEdit = (book: any) => {
    setEditBook(book);
    setEditForm({ title: book.title, author_name: book.author_name, description: book.description || "", category: book.category, ebook_price: book.ebook_price || 0, print_price: book.print_price || 0, preview_content: book.preview_content || "" });
  };

  const saveEdit = async () => {
    if (!editBook) return;
    await supabase.from("books").update(editForm).eq("id", editBook.id);
    toast({ title: "Book updated" });
    setEditBook(null);
    onRefresh();
  };

  const statusColor = (s: string) => s === "approved" ? "default" : s === "pending" ? "secondary" : "destructive";
  const pending = books.filter(b => b.status === "pending").length;
  const approved = books.filter(b => b.status === "approved").length;
  const featured = books.filter(b => b.featured).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Book Management</h2>
        <p className="text-muted-foreground text-sm mt-1">Review manuscripts, approve, edit, feature, and manage all books</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold">{books.length}</p></CardContent></Card>
        <Card className="border-amber-200"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Pending Review</p><p className="text-lg font-bold text-amber-600">{pending}</p></CardContent></Card>
        <Card className="border-emerald-200"><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Approved</p><p className="text-lg font-bold text-emerald-600">{approved}</p></CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center"><p className="text-xs text-muted-foreground">Featured</p><p className="text-lg font-bold text-gold">{featured}</p></CardContent></Card>
      </div>

      {/* Pending Manuscripts Review Section */}
      {pending > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              Manuscripts Pending Review ({pending})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {books.filter(b => b.status === "pending").map(b => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-lg border border-border gap-3">
                <div>
                  <p className="font-medium text-foreground">{b.title}</p>
                  <p className="text-xs text-muted-foreground">by {b.author_name} · {b.category} · Submitted {new Date(b.created_at).toLocaleDateString()}</p>
                  {b.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{b.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="default" onClick={() => updateStatus(b.id, "approved")} className="gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(b.id, "rejected")} className="gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(b)} className="gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title or author..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Books table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="p-3 font-medium">Book</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">⭐</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground">by {b.author_name}</p>
                    </td>
                    <td className="p-3 text-muted-foreground">{b.category}</td>
                    <td className="p-3"><Badge variant={statusColor(b.status)}>{b.status}</Badge></td>
                    <td className="p-3">
                      <button onClick={() => toggleFeatured(b.id, b.featured ?? false)} title={b.featured ? "Remove from featured" : "Add to featured"}>
                        <Star className={`w-4 h-4 ${b.featured ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                      </button>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <span className="text-xs">eBook:</span> ${Number(b.ebook_price ?? 0).toFixed(2)}<br/>
                      <span className="text-xs">Print:</span> ${Number(b.print_price ?? 0).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {b.status !== "approved" && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "approved")} title="Approve">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </Button>
                        )}
                        {b.status !== "rejected" && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(b.id, "rejected")} title="Reject">
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)} title="Edit">
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteBook(b.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">No books found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editBook} onOpenChange={(o) => !o && setEditBook(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Book</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
            <div><Label>Author Name</Label><Input value={editForm.author_name || ""} onChange={e => setEditForm({...editForm, author_name: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={editForm.description || ""} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
            <div><Label>Preview Content (Look Inside)</Label><Textarea value={editForm.preview_content || ""} onChange={e => setEditForm({...editForm, preview_content: e.target.value})} placeholder="Paste first few pages for reader preview..." /></div>
            <div><Label>Category</Label>
              <Select value={editForm.category || ""} onValueChange={v => setEditForm({...editForm, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>eBook Price ($)</Label><Input type="number" step="0.01" value={editForm.ebook_price ?? 0} onChange={e => setEditForm({...editForm, ebook_price: parseFloat(e.target.value)})} /></div>
              <div><Label>Print Price ($)</Label><Input type="number" step="0.01" value={editForm.print_price ?? 0} onChange={e => setEditForm({...editForm, print_price: parseFloat(e.target.value)})} /></div>
            </div>
            <Button onClick={saveEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

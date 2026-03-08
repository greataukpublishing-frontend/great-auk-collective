import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  categories: any[];
  books: any[];
  onRefresh: () => void;
}

export default function AdminCategories({ categories, books, onRefresh }: Props) {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");

  const addCategory = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("categories").insert({ name: newName.trim() });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category added" });
    setNewName("");
    onRefresh();
  };

  const deleteCategory = async (id: string, name: string) => {
    const booksInCategory = books.filter(b => b.category === name).length;
    if (booksInCategory > 0 && !confirm(`${booksInCategory} books use this category. Delete anyway?`)) return;
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Category deleted" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Categories & Genres</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage book categories shown in the bookstore</p>
      </div>

      {/* Add new */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <Label className="text-sm font-medium mb-2 block">Add New Category</Label>
          <div className="flex gap-2">
            <Input placeholder="e.g. Mystery, Romance..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} />
            <Button onClick={addCategory} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map(c => {
          const count = books.filter(b => b.category === c.name).length;
          return (
            <Card key={c.id}>
              <CardContent className="pt-4 pb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{count} book{count !== 1 ? "s" : ""}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteCategory(c.id, c.name)} title="Delete category">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {categories.length === 0 && <p className="text-center py-8 text-muted-foreground">No categories yet.</p>}
    </div>
  );
}

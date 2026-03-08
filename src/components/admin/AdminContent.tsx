import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  books: any[];
  onRefresh: () => void;
}

export default function AdminContent({ books, onRefresh }: Props) {
  const { toast } = useToast();
  const featured = books.filter(b => b.featured);
  const approved = books.filter(b => b.status === "approved");
  const newest = [...approved].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from("books").update({ featured: !current }).eq("id", id);
    toast({ title: current ? "Removed from featured" : "Added to featured" });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Content & Homepage</h2>
        <p className="text-muted-foreground text-sm mt-1">Control what appears on the homepage — featured books, new releases, and spotlights</p>
      </div>

      {/* Featured Books */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Star className="w-5 h-5 text-gold" /> Featured Books ({featured.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {featured.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No featured books. Click the ⭐ on any book below to feature it.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {featured.map(b => (
                <div key={b.id} className="p-3 rounded-lg border border-gold/30 bg-gold/5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{b.title}</p>
                    <p className="text-xs text-muted-foreground">by {b.author_name}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => toggleFeatured(b.id, true)} title="Remove from featured">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Releases */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /> New Releases (Latest Approved)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {newest.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">{b.title}</p>
                    {b.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">by {b.author_name} · {new Date(b.created_at).toLocaleDateString()}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleFeatured(b.id, b.featured ?? false)} title={b.featured ? "Remove from featured" : "Feature this book"}>
                  <Star className={`w-4 h-4 ${b.featured ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                </Button>
              </div>
            ))}
            {newest.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No approved books yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

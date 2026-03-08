import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Flag, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  reviews: any[];
  books: any[];
  onRefresh: () => void;
}

export default function AdminReviews({ reviews, books, onRefresh }: Props) {
  const { toast } = useToast();

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title ?? "Unknown";

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("reviews").delete().eq("id", id);
    toast({ title: "Review deleted" });
    onRefresh();
  };

  const toggleFlag = async (id: string, flagged: boolean) => {
    await supabase.from("reviews").update({ flagged: !flagged }).eq("id", id);
    toast({ title: flagged ? "Unflagged" : "Flagged for review" });
    onRefresh();
  };

  const flagged = reviews.filter(r => r.flagged).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Reviews Moderation</h2>
        <p className="text-muted-foreground text-sm mt-1">Monitor and moderate user reviews. {flagged > 0 && <span className="text-destructive font-medium">{flagged} flagged</span>}</p>
      </div>

      <div className="space-y-3">
        {reviews.map(r => (
          <Card key={r.id} className={r.flagged ? "border-destructive/30" : ""}>
            <CardContent className="pt-4 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground text-sm">{getBookTitle(r.book_id)}</p>
                    {r.flagged && <Badge variant="destructive">Flagged</Badge>}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.content || "No comment"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleFlag(r.id, r.flagged)} title={r.flagged ? "Unflag" : "Flag"}>
                    <Flag className={`w-4 h-4 ${r.flagged ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteReview(r.id)} title="Delete">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reviews.length === 0 && <p className="text-center py-8 text-muted-foreground">No reviews yet.</p>}
      </div>
    </div>
  );
}

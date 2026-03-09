import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Check, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  submissions: any[];
  onRefresh: () => void;
}

export default function AdminSubmissions({ submissions, onRefresh }: Props) {
  const { toast } = useToast();

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("book_submissions")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Submission ${status}` });
      onRefresh();
    }
  };

  const pendingSubs = submissions.filter(s => s.status === "pending");
  const reviewedSubs = submissions.filter(s => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
         <h2 className="font-display text-2xl font-bold text-foreground">Book Restoration Submissions</h2>
         <p className="text-muted-foreground text-sm mt-1">Manage books suggested by users for restoration</p>
      </div>

      {/* Pending Submissions */}
      {pendingSubs.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Badge variant="secondary">{pendingSubs.length}</Badge>
            Pending Review
          </h3>
          <div className="space-y-4">
            {pendingSubs.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-display font-semibold text-foreground text-lg">
                            {sub.book_title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            by {sub.author_name}
                            {sub.year_published && ` (${sub.year_published})`}
                          </p>
                          
                          {sub.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {sub.category}
                            </Badge>
                          )}
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <p className="text-xs font-medium text-foreground">Why restore this book:</p>
                              <p className="text-sm text-muted-foreground mt-1">{sub.why_restore}</p>
                            </div>
                            
                            {sub.source_link && (
                              <a
                                href={sub.source_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                View Source <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                            <p>Submitted by: {sub.submitter_name} ({sub.submitter_email})</p>
                            <p>Date: {new Date(sub.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(sub.id, "approved")}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(sub.id, "rejected")}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Submissions */}
      {reviewedSubs.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Reviewed Submissions</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                      <th className="p-3 font-medium">Book Title</th>
                      <th className="p-3 font-medium">Author</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium">Submitter</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviewedSubs.map((sub) => (
                      <tr key={sub.id} className="border-b border-border/50">
                        <td className="p-3 font-medium text-foreground">{sub.book_title}</td>
                        <td className="p-3 text-muted-foreground">{sub.author_name}</td>
                        <td className="p-3 text-muted-foreground">{sub.category || "—"}</td>
                        <td className="p-3 text-muted-foreground">{sub.submitter_name}</td>
                        <td className="p-3">
                          <Badge variant={sub.status === "approved" ? "default" : "secondary"}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {submissions.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No book submissions yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
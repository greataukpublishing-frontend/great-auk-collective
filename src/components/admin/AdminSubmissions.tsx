import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  submissions: any[];
  onRefresh: () => void;
  onNavigate: (section: string) => void;
}

export default function AdminSubmissions({ submissions, onRefresh, onNavigate }: Props) {
  const { toast } = useToast();

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("book_submissions").update({ status }).eq("id", id);
    if (!error) {
      toast({ title: `Submission ${status}` });
      onRefresh();
    }
  };

  const pendingSubs = submissions.filter(s => s.status === "pending");
  const reviewedSubs = submissions.filter(s => s.status !== "pending");

  return (
    <div className="space-y-6">
      {pendingSubs.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Pending Submissions
              <Badge variant="secondary">{pendingSubs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingSubs.map((sub) => (
              <Card key={sub.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold">{sub.book_title}</p>
                      <p className="text-sm text-muted-foreground">by {sub.author_name}</p>
                      {sub.year_published && ` (${sub.year_published})`}
                    </div>
                    <p className="text-sm">{sub.description}</p>
                    
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
          </CardContent>
        </Card>
      )}

      {reviewedSubs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reviewed Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviewedSubs.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{sub.book_title}</p>
                  <p className="text-sm text-muted-foreground">by {sub.author_name}</p>
                </div>
                <Badge variant={sub.status === "approved" ? "default" : "secondary"}>
                  {sub.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { MousePointerClick, Users, TrendingUp } from "lucide-react";

interface ClickRow {
  id: string;
  user_id: string | null;
  book_id: string;
  book_title: string;
  created_at: string;
}

interface BookClickStats {
  book_id: string;
  book_title: string;
  total: number;
  loggedIn: number;
  anonymous: number;
}

export default function AdminAmazonClicks() {
  const [clicks, setClicks] = useState<ClickRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("amazon_clicks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClicks((data as ClickRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted-foreground py-10 text-center">Loading click data...</p>;

  // Aggregate stats per book
  const statsMap = new Map<string, BookClickStats>();
  clicks.forEach((c) => {
    const existing = statsMap.get(c.book_id);
    if (existing) {
      existing.total++;
      if (c.user_id) existing.loggedIn++;
      else existing.anonymous++;
    } else {
      statsMap.set(c.book_id, {
        book_id: c.book_id,
        book_title: c.book_title,
        total: 1,
        loggedIn: c.user_id ? 1 : 0,
        anonymous: c.user_id ? 0 : 1,
      });
    }
  });

  const bookStats = Array.from(statsMap.values()).sort((a, b) => b.total - a.total);
  const totalClicks = clicks.length;
  const loggedInClicks = clicks.filter((c) => c.user_id).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" /> Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Logged-in Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{loggedInClicks}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalClicks > 0 ? ((loggedInClicks / totalClicks) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Books Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{bookStats.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Most clicked books table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Most Clicked Books</CardTitle>
        </CardHeader>
        <CardContent>
          {bookStats.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No clicks recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead className="text-right">Total Clicks</TableHead>
                  <TableHead className="text-right">Logged-in</TableHead>
                  <TableHead className="text-right">Anonymous</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookStats.map((s, i) => (
                  <TableRow key={s.book_id}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{s.book_title}</TableCell>
                    <TableCell className="text-right">{s.total}</TableCell>
                    <TableCell className="text-right">{s.loggedIn}</TableCell>
                    <TableCell className="text-right">{s.anonymous}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

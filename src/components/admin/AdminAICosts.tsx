import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, TrendingUp, Zap, Calendar } from "lucide-react";

export default function AdminAICosts() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDate, setSortDate] = useState("desc");

  useEffect(() => {
    fetchLogs();
  }, [sortDate]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_generation_logs")
      .select("*")
      .order("created_at", { ascending: sortDate === "asc" });
    setLogs(data || []);
    setLoading(false);
  };

  const totalEur = logs.reduce((sum, l) => sum + (l.cost_eur || 0), 0);
  const totalUsd = logs.reduce((sum, l) => sum + (l.cost_usd || 0), 0);

  // Group by date
  const byDate = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    if (!acc[date]) acc[date] = { logs: [], totalEur: 0, totalUsd: 0 };
    acc[date].logs.push(log);
    acc[date].totalEur += log.cost_eur || 0;
    acc[date].totalUsd += log.cost_usd || 0;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">AI Generation Costs</h2>
        <select
          value={sortDate}
          onChange={e => setSortDate(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Total Generations</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Total Cost (EUR)</p>
            <p className="text-2xl font-bold text-accent">€{totalEur.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Total Cost (USD)</p>
            <p className="text-2xl font-bold">${totalUsd.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Avg Per Generation</p>
            <p className="text-2xl font-bold">€{logs.length > 0 ? (totalEur / logs.length).toFixed(4) : "0.0000"}</p>
          </CardContent>
        </Card>
      </div>

      {/* By date */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No generations yet. Click "Generate Editorial" on any book to start.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDate).map(([date, data]: [string, any]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {date}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">€{data.totalEur.toFixed(4)}</Badge>
                    <Badge variant="secondary">{data.logs.length} generations</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="pb-2">Book</th>
                      <th className="pb-2">Generator</th>
                      <th className="pb-2">Reviewer</th>
                      <th className="pb-2">Tokens</th>
                      <th className="pb-2">Cost (EUR)</th>
                      <th className="pb-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.logs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border/50">
                        <td className="py-2 font-medium">{log.book_title}</td>
                        <td className="py-2 text-xs text-muted-foreground">{log.generator_model?.split("/")[1]}</td>
                        <td className="py-2 text-xs text-muted-foreground">{log.reviewer_model?.split("/")[1]}</td>
                        <td className="py-2">{log.tokens_used}</td>
                        <td className="py-2 text-accent font-medium">€{(log.cost_eur || 0).toFixed(5)}</td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

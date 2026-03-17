import React from "react";
import { Euro } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface Props {
  books: any[];
  orders: any[];
  profiles: any[];
  roles: any[];
  categories: any[];
  onNavigate?: (tab: string) => void;
}

const COLORS = ["hsl(170,40%,20%)", "hsl(42,80%,55%)", "hsl(170,30%,35%)", "hsl(0,72%,51%)", "hsl(40,25%,60%)", "hsl(200,60%,40%)", "hsl(280,50%,50%)", "hsl(120,40%,40%)"];

export default function AdminAnalytics({ books, orders, profiles, roles, categories, onNavigate }: Props) {
  const [aiLogs, setAiLogs] = React.useState<any[]>([]);
  const [aiLoading, setAiLoading] = React.useState(true);
  React.useEffect(() => {
    import("@/integrations/supabase/client").then(({ supabase }) => {
      supabase.from("ai_generation_logs").select("*").order("created_at", { ascending: false }).limit(100)
        .then(({ data }) => { setAiLogs(data ?? []); setAiLoading(false); });
    });
  }, []);

  // Books by category
  const catData = categories.map(c => ({
    name: c.name,
    count: books.filter(b => b.category === c.name).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  // Books by status
  const statusData = [
    { name: "Approved", value: books.filter(b => b.status === "approved").length },
    { name: "Pending", value: books.filter(b => b.status === "pending").length },
    { name: "Rejected", value: books.filter(b => b.status === "rejected").length },
  ].filter(s => s.value > 0);

  // Revenue over time (by month)
  const revenueByMonth: Record<string, number> = {};
  orders.forEach(o => {
    const m = new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    revenueByMonth[m] = (revenueByMonth[m] || 0) + Number(o.amount);
  });
  const revenueData = Object.entries(revenueByMonth).map(([month, amount]) => ({ month, amount }));

  // Top authors by book count
  const authorBookCounts: Record<string, { name: string; books: number; sales: number }> = {};
  books.forEach(b => {
    if (!authorBookCounts[b.author_name]) authorBookCounts[b.author_name] = { name: b.author_name, books: 0, sales: 0 };
    authorBookCounts[b.author_name].books++;
  });
  const topAuthors = Object.values(authorBookCounts).sort((a, b) => b.books - a.books).slice(0, 8);

  // User growth
  const usersByMonth: Record<string, number> = {};
  profiles.forEach(p => {
    const m = new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    usersByMonth[m] = (usersByMonth[m] || 0) + 1;
  });
  const userData = Object.entries(usersByMonth).map(([month, count]) => ({ month, count }));

  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.amount), 0);
  const totalAuthors = roles.filter(r => r.role === "author").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Analytics & Insights</h2>
        <p className="text-muted-foreground text-sm mt-1">Platform performance at a glance</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Total Books</p><p className="text-2xl font-bold text-foreground">{books.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Total Users</p><p className="text-2xl font-bold text-foreground">{profiles.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Total Authors</p><p className="text-2xl font-bold text-foreground">{totalAuthors}</p></CardContent></Card>
        <Card><CardContent className="pt-5 pb-4 text-center"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold text-foreground">₹{totalRevenue.toFixed(2)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books by Category */}
        <Card>
          <CardHeader><CardTitle className="text-base">Books by Category</CardTitle></CardHeader>
          <CardContent>
            {catData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(170,40%,20%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>}
          </CardContent>
        </Card>

        {/* Book Status */}
        <Card>
          <CardHeader><CardTitle className="text-base">Book Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>}
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v: any) => `₹${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" stroke="hsl(42,80%,55%)" strokeWidth={2} dot={{ fill: "hsl(42,80%,55%)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm text-center py-8">No sales data yet</p>}
          </CardContent>
        </Card>

        {/* Top Authors */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Authors by Books</CardTitle></CardHeader>
          <CardContent>
            {topAuthors.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topAuthors} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="books" fill="hsl(170,30%,35%)" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-bold flex items-center gap-2">
            <Euro className="w-5 h-5 text-accent" /> AI Generation Costs
          </h3>
          {onNavigate && (
            <button onClick={() => onNavigate("ai-costs")} className="text-sm text-accent underline hover:opacity-80">
              View Full AI Costs →
            </button>
          )}
        </div>
        {aiLoading ? <p className="text-muted-foreground text-sm">Loading AI costs...</p> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <Card><CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Total Generations</p>
                <p className="text-2xl font-bold">{aiLogs.length}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Total Cost (EUR)</p>
                <p className="text-2xl font-bold text-accent">€{aiLogs.reduce((s, l) => s + (l.cost_eur || 0), 0).toFixed(4)}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Total Cost (USD)</p>
                <p className="text-2xl font-bold">${aiLogs.reduce((s, l) => s + (l.cost_usd || 0), 0).toFixed(4)}</p>
              </CardContent></Card>
              <Card><CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Avg Per Generation</p>
                <p className="text-2xl font-bold">€{aiLogs.length > 0 ? (aiLogs.reduce((s, l) => s + (l.cost_eur || 0), 0) / aiLogs.length).toFixed(4) : "0.0000"}</p>
              </CardContent></Card>
            </div>
            {aiLogs.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Cost Per Day (EUR)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.entries(aiLogs.reduce((acc: any, l) => {
                      const d = new Date(l.created_at).toLocaleDateString("en-GB");
                      acc[d] = (acc[d] || 0) + (l.cost_eur || 0);
                      return acc;
                    }, {})).map(([date, cost]) => ({ date, cost: Number((cost as number).toFixed(5)) }))}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => `€${Number(v).toFixed(5)}`} />
                      <Bar dataKey="cost" fill="hsl(42,80%,55%)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// Tue Mar 17 22:55:16 CET 2026

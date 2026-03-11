import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, UserCheck, ShoppingCart, Star, Eye, CheckCircle, XCircle, DollarSign, TrendingUp } from "lucide-react";

interface Props {
  books: any[];
  profiles: any[];
  orders: any[];
  roles: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export default function AdminOverview({ books, profiles, orders, roles, onApprove, onReject, onNavigate }: Props) {
  const totalBooks = books.length;
  const pendingBooks = books.filter(b => b.status === "pending");
  const approvedBooks = books.filter(b => b.status === "approved").length;
  const totalUsers = profiles.length;
  const totalAuthors = roles.filter(r => r.role === "author").length;
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.amount), 0);
  const platformRevenue = orders.reduce((s: number, o: any) => s + Number(o.platform_share), 0);
  const authorRevenue = orders.reduce((s: number, o: any) => s + Number(o.author_share), 0);

  const stats = [
    { label: "Total Books", value: totalBooks, icon: BookOpen, color: "text-primary" },
    { label: "Pending Approval", value: pendingBooks.length, icon: Eye, color: "text-amber-600" },
    { label: "Approved Books", value: approvedBooks, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-primary" },
    { label: "Authors", value: totalAuthors, icon: UserCheck, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-primary" },
    { label: "Total Revenue", value: `₹${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600" },
    { label: "Platform Share", value: `₹${platformRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">Quick snapshot of your platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
            if (s.label.includes("Book")) onNavigate("books");
            else if (s.label.includes("User") || s.label.includes("Author")) onNavigate("users");
            else if (s.label.includes("Order") || s.label.includes("Revenue") || s.label.includes("Platform")) onNavigate("orders");
          }}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">Total Sales</p>
            <p className="text-3xl font-bold text-foreground mt-1">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">Authors Earned (70%)</p>
            <p className="text-3xl font-bold text-emerald-700 mt-1">${authorRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-muted-foreground font-medium">Platform Earned (30%)</p>
            <p className="text-3xl font-bold text-amber-700 mt-1">${platformRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Books */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-600" />
            Pending Book Submissions ({pendingBooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingBooks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">🎉 No pending submissions — all caught up!</p>
          ) : (
            <div className="space-y-3">
              {pendingBooks.slice(0, 5).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="text-sm text-muted-foreground">by {b.author_name} · {new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onApprove(b.id)} className="gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onReject(b.id)} className="gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
              {pendingBooks.length > 5 && (
                <Button variant="outline" className="w-full" onClick={() => onNavigate("books")}>
                  View all {pendingBooks.length} pending books →
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users } from "lucide-react";

interface Props {
  orders: any[];
  books: any[];
}

export default function AdminOrders({ orders, books }: Props) {
  const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.amount), 0);
  const platformShare = orders.reduce((s: number, o: any) => s + Number(o.platform_share), 0);
  const authorShare = orders.reduce((s: number, o: any) => s + Number(o.author_share), 0);

  const getBookTitle = (bookId: string) => books.find(b => b.id === bookId)?.title ?? "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Orders & Sales</h2>
        <p className="text-muted-foreground text-sm mt-1">Track all platform orders and revenue split</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-5 pb-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto text-primary mb-1" />
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-5 pb-4 text-center">
            <Users className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
            <p className="text-xs text-muted-foreground">Authors Earned (70%)</p>
            <p className="text-2xl font-bold text-emerald-700">₹{authorShare.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-5 pb-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-amber-600 mb-1" />
            <p className="text-xs text-muted-foreground">Platform Earned (30%)</p>
            <p className="text-2xl font-bold text-amber-700">${platformShare.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Book</th>
                  <th className="p-3 font-medium">Amount</th>
                  <th className="p-3 font-medium">Author Share</th>
                  <th className="p-3 font-medium">Platform Share</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-foreground">{getBookTitle(o.book_id)}</td>
                    <td className="p-3 font-medium text-foreground">${Number(o.amount).toFixed(2)}</td>
                    <td className="p-3 text-emerald-600">${Number(o.author_share).toFixed(2)}</td>
                    <td className="p-3 text-amber-600">${Number(o.platform_share).toFixed(2)}</td>
                    <td className="p-3"><Badge variant="secondary">{o.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="text-center py-8 text-muted-foreground">No orders yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { BarChart3, BookOpen, DollarSign, Eye, Plus, TrendingUp, Megaphone, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { mockBooks } from "@/data/mockData";
import { getBookCover } from "@/lib/covers";

const stats = [
  { label: "Books Published", value: "3", icon: BookOpen },
  { label: "Total Sales", value: "1,247", icon: TrendingUp },
  { label: "Royalties Earned", value: "$8,429", icon: DollarSign },
  { label: "Pending Approval", value: "1", icon: Eye },
];

export default function AuthorDashboardPage() {
  const authorBooks = mockBooks.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Author Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Eleanor Whitfield</p>
          </div>
          <Link to="/publish-book">
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" /> Publish New Book
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-lg p-5 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* My Books */}
        <div className="bg-card rounded-lg border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-semibold text-card-foreground">My Books</h2>
          </div>
          <div className="divide-y divide-border">
            {authorBooks.map((book, i) => (
              <div key={book.id} className="flex items-center gap-4 p-6">
                <img src={getBookCover(book.cover)} alt={book.title} className="w-12 h-16 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-card-foreground truncate">{book.title}</h3>
                  <p className="text-xs text-muted-foreground">{book.category}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-card-foreground">{(200 + i * 150)} sales</p>
                  <p className="text-xs text-muted-foreground">${((200 + i * 150) * book.ebookPrice! * 0.7).toFixed(0)} earned</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  i === 2 ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {i === 2 ? "Pending" : "Published"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-card rounded-lg p-6 border border-border">
            <Headphones className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-display font-semibold text-card-foreground">Convert to Audio</h3>
            <p className="text-sm text-muted-foreground mt-1">Transform your book into a professional audiobook.</p>
            <Button variant="outline" size="sm" className="mt-4">Get Started</Button>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <Megaphone className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-display font-semibold text-card-foreground">Boost Your Book</h3>
            <p className="text-sm text-muted-foreground mt-1">Run targeted ad campaigns to increase sales.</p>
            <Button variant="outline" size="sm" className="mt-4">Create Campaign</Button>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <BarChart3 className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-display font-semibold text-card-foreground">Sales Analytics</h3>
            <p className="text-sm text-muted-foreground mt-1">View detailed reports and track your performance.</p>
            <Button variant="outline" size="sm" className="mt-4">View Reports</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

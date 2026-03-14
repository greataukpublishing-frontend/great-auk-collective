import { useState, useEffect } from "react"; // admin dashboard v2
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, BookOpen, Users, ShoppingCart,
  Tags, MessageSquare, BarChart3, Settings, Briefcase, FileText, ToggleRight,
  LogOut, ChevronLeft, ChevronRight, Menu, Heart, Crown, MousePointerClick
} from "lucide-react";

import AdminOverview from "@/components/admin/AdminOverview";
import AdminBooks from "@/components/admin/AdminBooks";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminServices from "@/components/admin/AdminServices";
import AdminContent from "@/components/admin/AdminContent";
import AdminFeatureToggles from "@/components/admin/AdminFeatureToggles";
import AdminSubmissions from "@/components/admin/AdminSubmissions";
import AdminMembership from "@/components/admin/AdminMembership";
import AdminAmazonClicks from "@/components/admin/AdminAmazonClicks";
import { fetchAllBooks } from "@/lib/books";

const NAV_ITEMS = [
...
  const fetchAll = async () => {
    setLoading(true);
    const [booksR, profilesR, ordersR, rolesR, catsR, reviewsR, settingsR, servicesR, soR, subsR] = await Promise.all([
      fetchAllBooks({ orderBy: "created_at", ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("categories").select("*").order("name"),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("platform_settings").select("*"),
      supabase.from("premium_services").select("*").order("created_at", { ascending: false }),
      supabase.from("service_orders").select("*").order("created_at", { ascending: false }),
      supabase.from("book_submissions").select("*").order("created_at", { ascending: false }),
    ]);

    if (booksR.error) {
      toast({
        title: "Failed to load books",
        description: booksR.error.message,
        variant: "destructive",
      });
    }

    setBooks(booksR.data ?? []);
    setProfiles(profilesR.data ?? []);
    setOrders(ordersR.data ?? []);
    setRoles(rolesR.data ?? []);
    setCategories(catsR.data ?? []);
    setReviews(reviewsR.data ?? []);
    setSettings(settingsR.data ?? []);
    setServices(servicesR.data ?? []);
    setServiceOrders(soR.data ?? []);
    setSubmissions(subsR.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const updateBookStatus = async (id: string, status: string) => {
    await supabase.from("books").update({ status }).eq("id", id);
    toast({ title: `Book ${status}` });
    fetchAll();
  };

  const navigate = (t: string) => {
    setTab(t);
    setMobileOpen(false);
  };

  const pendingCount = books.filter(b => b.status === "pending").length;
  const flaggedCount = reviews.filter(r => r.flagged).length;
  const submissionsCount = submissions.filter(s => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen bg-primary flex flex-col transition-all duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${sidebarOpen ? "w-64" : "w-16"}
      `}>
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-primary/80 gap-2">
          <LayoutDashboard className="w-5 h-5 text-gold shrink-0" />
          {sidebarOpen && (
            <span className="font-display text-sm font-bold text-primary-foreground whitespace-nowrap">
              Great Auk <span className="text-gold">Admin</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = tab === item.id;
            const badge = item.id === "books" ? pendingCount 
              : item.id === "reviews" ? flaggedCount 
              : item.id === "submissions" ? submissionsCount 
              : 0;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80"
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && badge > 0 && (
                  <span className="ml-auto text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-primary/80">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-primary-foreground/60 hover:text-destructive text-sm transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border h-14 flex items-center px-4 gap-3">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">
            {NAV_ITEMS.find(n => n.id === tab)?.label ?? "Dashboard"}
          </h1>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          ) : (
            <>
              {tab === "overview" && (
                <AdminOverview books={books} profiles={profiles} orders={orders} roles={roles}
                  onApprove={(id) => updateBookStatus(id, "approved")}
                  onReject={(id) => updateBookStatus(id, "rejected")}
                  onNavigate={navigate} />
              )}
              {tab === "books" && <AdminBooks books={books} categories={categories} onRefresh={fetchAll} />}
              {tab === "users" && <AdminUsers profiles={profiles} roles={roles} onRefresh={fetchAll} />}
              {tab === "orders" && <AdminOrders orders={orders} books={books} />}
              {tab === "categories" && <AdminCategories categories={categories} books={books} onRefresh={fetchAll} />}
              {tab === "reviews" && <AdminReviews reviews={reviews} books={books} onRefresh={fetchAll} />}
              {tab === "submissions" && <AdminSubmissions submissions={submissions} onRefresh={fetchAll} />}
              {tab === "services" && <AdminServices services={services} serviceOrders={serviceOrders} onRefresh={fetchAll} />}
              {tab === "content" && <AdminContent books={books} onRefresh={fetchAll} />}
              {tab === "analytics" && <AdminAnalytics books={books} orders={orders} profiles={profiles} roles={roles} categories={categories} />}
              {tab === "membership" && <AdminMembership onRefresh={fetchAll} />}
              {tab === "amazon-clicks" && <AdminAmazonClicks />}
              {tab === "features" && <AdminFeatureToggles onRefresh={fetchAll} />}
              {tab === "settings" && <AdminSettings settings={settings} onRefresh={fetchAll} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

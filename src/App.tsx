import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedAuthorRoute from "@/components/ProtectedAuthorRoute";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookstorePage from "./pages/BookstorePage";
import BookDetailPage from "./pages/BookDetailPage";
import PublishPage from "./pages/PublishPage";
import PublishBookPage from "./pages/PublishBookPage";
import AuthorDashboardPage from "./pages/AuthorDashboardPage";
import AuthorLoginPage from "./pages/AuthorLoginPage";
import AuthorProfilePage from "./pages/AuthorProfilePage";
import MembershipPage from "./pages/MembershipPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BringBookBackPage from "./pages/BringBookBackPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ReaderLoginPage from "./pages/ReaderLoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bookstore" element={<BookstorePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/publish-book" element={<PublishBookPage />} />
            <Route path="/author-login" element={<AuthorLoginPage />} />
            <Route path="/reader-login" element={<ReaderLoginPage />} />
            <Route path="/author-dashboard" element={
              <ProtectedAuthorRoute><AuthorDashboardPage /></ProtectedAuthorRoute>
            } />
            <Route path="/author/:id" element={<AuthorProfilePage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/bring-book-back" element={<BringBookBackPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>
            } />
            <Route path="/~oauth" element={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Signing you in...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

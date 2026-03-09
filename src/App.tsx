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
import FavoritesPage from "./pages/FavoritesPage";
import AuthorLoginPage from "./pages/AuthorLoginPage";
import AuthorProfilePage from "./pages/AuthorProfilePage";
import MembershipPage from "./pages/MembershipPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BringBookBackPage from "./pages/BringBookBackPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ReaderLoginPage from "./pages/ReaderLoginPage";
import EditBookPage from "./pages/EditBookPage";
import CartPage from "./pages/CartPage";

const queryClient = new QueryClient();

const App = () => (

  <QueryClientProvider client={queryClient}>

    <AuthProvider>

      <TooltipProvider>

        <Toaster />
        <Sonner />

        <BrowserRouter>

          <Routes>

            {/* HOME */}
            <Route path="/" element={<Index />} />

            {/* BOOKSTORE */}
            <Route path="/bookstore" element={<BookstorePage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />

            {/* PUBLISHING */}
            <Route path="/publish" element={<PublishPage />} />
            <Route path="/publish-book" element={<PublishBookPage />} />

            {/* LOGIN */}
            <Route path="/author-login" element={<AuthorLoginPage />} />
            <Route path="/reader-login" element={<ReaderLoginPage />} />

            {/* USER PAGES */}
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* AUTHOR DASHBOARD */}
            <Route
              path="/author-dashboard"
              element={
                <ProtectedAuthorRoute>
                  <AuthorDashboardPage />
                </ProtectedAuthorRoute>
              }
            />

            {/* EDIT BOOK */}
            <Route
              path="/edit-book/:id"
              element={
                <ProtectedAuthorRoute>
                  <EditBookPage />
                </ProtectedAuthorRoute>
              }
            />

            {/* AUTHOR PROFILE */}
            <Route path="/author/:id" element={<AuthorProfilePage />} />

            {/* STATIC PAGES */}
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/bring-book-back" element={<BringBookBackPage />} />

            {/* ADMIN */}
            <Route path="/admin-login" element={<AdminLoginPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              }
            />

            {/* 404 PAGE (KEEP LAST) */}
            <Route path="*" element={<NotFound />} />

          </Routes>

        </BrowserRouter>

      </TooltipProvider>

    </AuthProvider>

  </QueryClientProvider>

);


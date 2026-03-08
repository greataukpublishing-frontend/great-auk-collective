import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BookstorePage from "./pages/BookstorePage";
import BookDetailPage from "./pages/BookDetailPage";
import PublishPage from "./pages/PublishPage";
import PublishBookPage from "./pages/PublishBookPage";
import AuthorDashboardPage from "./pages/AuthorDashboardPage";
import AuthorProfilePage from "./pages/AuthorProfilePage";
import MembershipPage from "./pages/MembershipPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/author-dashboard" element={<AuthorDashboardPage />} />
          <Route path="/author/:id" element={<AuthorProfilePage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

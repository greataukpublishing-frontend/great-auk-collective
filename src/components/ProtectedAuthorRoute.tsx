import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedAuthorRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthor, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAuthor) {
    return <Navigate to="/author-login" replace />;
  }

  return <>{children}</>;
}

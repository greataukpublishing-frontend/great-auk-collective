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

  if (!user) {
    return <Navigate to="/author-login" replace />;
  }

  if (!isAuthor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Your account does not have author permissions.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

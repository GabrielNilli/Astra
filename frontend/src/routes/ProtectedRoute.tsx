// =================================
//  IMPORTS
// =================================
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// =================================
//  COMPONENT
// =================================
export function ProtectedRoute() {
  // =================================
  //  CONSTS
  // =================================
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Caricamento…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

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
      <div className="flex min-h-full items-center justify-center bg-base-light text-base-mid dark:bg-base-dark">
        Caricamento…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

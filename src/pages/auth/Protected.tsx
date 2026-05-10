import Loader from "@/components/loader";
import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <Outlet />;
}

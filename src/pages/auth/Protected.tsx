import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/auth";
import Loader from "@/components/loader";

export default function ProtectedRoute() {
  const { user, loading, verified } = useAuthStore();

  if (loading || !verified) return <Loader />;

  if (!user) return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}

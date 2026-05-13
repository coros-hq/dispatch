import Loader from "@/components/loader";
import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet, useLocation } from "react-router";

export default function AuthLayout() {
  const { user, loading } = useAuthStore();
  const { pathname } = useLocation();
  const onResetPassword = pathname === "/reset-password";

  if (user && !onResetPassword) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-muted">
      <Outlet />
    </div>
  );
}

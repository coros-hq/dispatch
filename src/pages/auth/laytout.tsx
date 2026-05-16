import Loader from "@/components/loader";
import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet, useLocation } from "react-router";

export default function AuthLayout() {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  const { pathname } = location;
  const onResetPassword = pathname === "/reset-password";
  const redirect =
    new URLSearchParams(location.search).get("redirect") ?? "/dashboard";

  if (user && !onResetPassword) {
    return <Navigate to={redirect} replace />;
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

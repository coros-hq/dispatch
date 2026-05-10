import Loader from "@/components/loader";
import { useAuthStore } from "@/store/auth";
import { Navigate, Outlet } from "react-router";

export default function AuthLayout() {
  const { user, loading } = useAuthStore();

  if (user) {
    return <Navigate to="/" replace />;
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

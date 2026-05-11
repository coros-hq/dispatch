import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <img src={Logo} alt="Dispatch" className="w-12 h-12 opacity-50" />

      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg font-medium text-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground mt-1">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="text-white"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
        <Button onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}

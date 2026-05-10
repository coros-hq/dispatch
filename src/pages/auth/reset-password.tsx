import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/logo.svg";
import AuthLines from "@/assets/auth-lines";
import { resetPasswordSchema } from "@/validation/auth";
import { resetPassword } from "@/lib/auth";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router";
import type { Session } from "@supabase/supabase-js";

export default function ResetPassword() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!session) {
        toast.error("Session expired — request a new reset link");
        return;
      }
      try {
        await resetPassword(value.password);

        // Sign out after reset so user logs in fresh
        await supabase.auth.signOut();
        toast.success("Password updated — please sign in");
        navigate("/sign-in");
      } catch (err: any) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const errorDescription = params.get("error_description");
      setTokenError(
        errorDescription?.replace(/\+/g, " ") ?? "Invalid or expired link",
      );
      return;
    }

    // PASSWORD_RECOVERY fires as a microtask during Supabase initialization,
    // before React's useEffect (a macrotask). By the time this listener
    // registers the event has already fired, so fetch the stored session directly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSession(data.session);
    });

    // Still listen in case the event fires after mount (e.g. token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY" && s) {
        setSession(s);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (tokenError) {
    return (
      <Card className="relative w-full max-w-lg overflow-hidden border-none pt-12 shadow-2xl shadow-white">
        <div className="pointer-events-none absolute top-0 h-full w-full rounded-t-xl bg-gradient-to-t from-transparent to-primary/10" />
        <AuthLines className="pointer-events-none absolute inset-x-0 top-0" />
        <CardHeader className="justify-center gap-6 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <img src={Logo} alt="Dispatch" className="w-9 h-9" />
            <span className="text-xl font-semibold text-foreground">
              Dispatch
            </span>
          </div>
          <div>
            <CardTitle className="mb-1.5 text-2xl">Link expired</CardTitle>
            <CardDescription className="text-base">
              {tokenError}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button
            className="w-full"
            onClick={() => navigate("/forgot-password")}
          >
            Request a new link
          </Button>
          <a
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to sign in
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative w-full max-w-lg overflow-hidden border-none pt-12 shadow-2xl shadow-white">
      {/* Gradient top */}
      <div className="pointer-events-none absolute top-0 h-full w-full rounded-t-xl bg-gradient-to-t from-transparent to-primary/10" />

      {/* Decorative lines */}
      <AuthLines className="pointer-events-none absolute inset-x-0 top-0" />

      <CardHeader className="justify-center gap-6 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <img src={Logo} alt="Dispatch" className="w-9 h-9" />
          <span className="text-xl font-semibold text-foreground">
            Dispatch
          </span>
        </div>
        <div>
          <CardTitle className="mb-1.5 text-2xl">Reset password</CardTitle>
          <CardDescription className="text-base">
            Enter your new password below
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-9"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setIsPasswordVisible((v) => !v)}
                      className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                    >
                      {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                  {isInvalid && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          />

          <form.Field
            name="confirmPassword"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={isConfirmPasswordVisible ? "text" : "password"}
                      placeholder="••••••••••••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pr-9"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                      className="text-muted-foreground absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
                    >
                      {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                  {isInvalid && (
                    <p className="text-xs text-destructive">
                      {field.state.meta.errors[0]?.message}
                    </p>
                  )}
                </div>
              );
            }}
          />

          <Button type="submit" className="w-full mt-2">
            Reset password
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm mt-4">
          Remembered your password?{" "}
          <a
            href="/sign-in"
            className="text-foreground hover:underline cursor-pointer"
          >
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

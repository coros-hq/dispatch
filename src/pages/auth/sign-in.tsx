import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, LoaderIcon } from "lucide-react";
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
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { signInSchema } from "@/validation/auth";
import { toast } from "sonner";
import { signIn } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { PASSWORD_RECOVERY_PENDING_KEY } from "@/store/auth";
import { useNavigate, useSearchParams } from "react-router";

export default function SignIn() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  useEffect(() => {
    if (!sessionStorage.getItem(PASSWORD_RECOVERY_PENDING_KEY)) return;
    void supabase.auth.signOut();
  }, []);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const res = await signIn(value.email, value.password);
        if (res && res.session) {
          toast.success("Signed in successfully");
          navigate(redirectTo);
        }
      } catch (err: any) {
        toast.error(err.message ?? "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Card className="relative w-full max-w-md overflow-hidden border-none pt-12 shadow-2xl shadow-white">
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
          <CardTitle className="mb-1.5 text-2xl">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your newsletters
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
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
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
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <div className="flex flex-col gap-3 items-end w-full">
                  <div className="flex flex-col gap-1.5 w-full">
                    <Label htmlFor="password">Password</Label>
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
                  <a
                    href="/forgot-password"
                    className="text-foreground  underline cursor-pointer"
                  >
                    Forgot your password?
                  </a>
                </div>
              );
            }}
          />

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <LoaderIcon className="animate-spin w-3 h-3" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm mt-4">
          Don't have an account?{" "}
          <a
            href="/sign-up"
            className="text-foreground hover:underline cursor-pointer"
          >
            Sign up
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

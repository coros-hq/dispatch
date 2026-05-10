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
import { forgotPasswordSchema } from "@/validation/auth";
import { forgotPassword } from "@/lib/auth";
import { toast } from "sonner";
import { useState } from "react";

type Props = {
  onSuccess?: () => void;
};

export default function ForgotPassword({ onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await forgotPassword(value.email);
        toast.success("Reset link sent — check your inbox");
        onSuccess?.();
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
          <CardTitle className="mb-1.5 text-2xl">Forgot password</CardTitle>
          <CardDescription className="text-base">
            Enter your email and we'll send you a reset link
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

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
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

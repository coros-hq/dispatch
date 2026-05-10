import { useState } from "react";
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

type Props = {
  onSuccess?: () => void;
};

export default function ResetPassword({ onSuccess }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword(value.password);
        toast.success("Password updated successfully");
        onSuccess?.();
      } catch (err: any) {
        toast.error(err.message ?? "Something went wrong");
      }
    },
  });

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

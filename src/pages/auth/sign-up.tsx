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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/logo.svg";
import AuthLines from "@/assets/auth-lines";
import { signUpSchema } from "@/validation/auth";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";

type Props = {
  onSuccess?: () => void;
};

export default function SignUp({ onSuccess }: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        await signUp(
          value.email,
          value.password,
          value.firstName,
          value.lastName,
        );
        toast.success("Account created successfully", {
          description: "Please check your email to confirm your account.",
        });
        onSuccess?.();
      } catch (err: any) {
        toast.error(err.message ?? "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Card className="relative w-full max-w-lg overflow-hidden border-none pt-12 shadow-lg">
      {/* Gradient top */}
      <div className="pointer-events-none absolute top-0 h-52 w-full rounded-t-xl bg-gradient-to-t from-transparent to-primary/10" />

      {/* Decorative lines */}
      <AuthLines className="pointer-events-none absolute inset-x-0 top-0" />

      <CardHeader className="justify-center gap-6 mb-3 text-center">
        <div className="flex items-center justify-center gap-2.5">
          <img src={Logo} alt="MailShot" className="w-9 h-9" />
          <span className="text-xl font-semibold text-foreground">
            MailShot
          </span>
        </div>
        <div>
          <CardTitle className="mb-1.5 text-2xl">Create an account</CardTitle>
          <CardDescription className="text-base">
            Start building beautiful newsletters
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
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="firstName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
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
              name="lastName"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
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
          </div>
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
                <div className="flex flex-col gap-1.5">
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
                  <Label htmlFor="confirmPassword">Confirm password</Label>
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

          <div className="flex items-center gap-3">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm">
              <span className="text-muted-foreground">I agree to the </span>
              <a href="#" className="text-foreground hover:underline">
                privacy policy & terms
              </a>
            </Label>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm mt-4">
          Already have an account?{" "}
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

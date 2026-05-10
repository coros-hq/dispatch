import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg";
import AuthLines from "@/assets/auth-lines";
import { MailIcon } from "lucide-react";

type Props = {
  email?: string;
};

export default function ConfirmEmail({ email }: Props) {
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
          <CardTitle className="mb-1.5 text-2xl">Check your inbox</CardTitle>
          <CardDescription className="text-base">
            We sent a confirmation link to{" "}
            {email ? (
              <span className="text-foreground font-medium">{email}</span>
            ) : (
              "your email address"
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MailIcon className="w-7 h-7 text-primary" />
        </div>

        <div className="text-center flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">
            Click the link in the email to confirm your account. If you don't
            see it, check your spam folder.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "mailto:")}
          >
            Open email app
          </Button>

          <p className="text-muted-foreground text-center text-sm">
            Didn't receive it?{" "}
            <button
              type="button"
              className="text-foreground hover:underline cursor-pointer"
              onClick={() => {
                /* Resend logic will go here */
              }}
            >
              Resend email
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

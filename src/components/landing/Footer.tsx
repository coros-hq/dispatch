import { Link } from "react-router";
import Logo from "@/assets/logo.svg";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div className="space-y-1">
          <img src={Logo} alt="MailShot" className="w-8 h-8" />

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MailShot. Open source, forever.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link to="/templates" className="hover:text-foreground">
            Templates
          </Link>
          <Link to="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}

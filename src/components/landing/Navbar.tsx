import { Link } from "react-router";
import Logo from "@/assets/logo.svg";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <img src={Logo} alt="MailShot" className="w-8 h-8" />

        <div className="hidden items-center gap-8 md:flex">
          <Link
            to="/templates"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Templates
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/sign-in"
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

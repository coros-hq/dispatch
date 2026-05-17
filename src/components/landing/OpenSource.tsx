import { ArrowRight, Star, Check } from "lucide-react";
import { Link } from "react-router";

export function OpenSource() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="grain relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center md:p-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(50% 80% at 50% 0%, hsl(38 92% 50% / 0.2), transparent)",
            }}
          />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-border bg-background/50 px-4 py-1.5 text-xs backdrop-blur">
              <span className="text-muted-foreground">mailshot / mailshot</span>
              <span className="h-3 w-px bg-border" />
              <span className="inline-flex items-center gap-1 text-primary">
                <Star className="h-3.5 w-3.5 fill-current" /> GitHub
              </span>
            </div>
            <h2 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
              Free and open source,
              <br />
              <span className="italic text-muted-foreground">forever.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
              No vendor lock-in. No paywalls on core features. Self-host it,
              fork it, ship it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/sign-up"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-background/80"
              >
                Star on GitHub
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {["MIT licensed", "Self-hostable", "TypeScript native"].map(
                (t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-primary" /> {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ArrowRight } from "lucide-react";
import AppPreview from "@/assets/app-preview.png";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden border-b border-border/50">
      <div
        className="pointer-events-none absolute inset-0 -z-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 0%, hsl(38 92% 50% / 0.2), transparent 70%), radial-gradient(40% 40% at 10% 20%, hsl(346 84% 61% / 0.15), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Open source · MIT licensed
          </div>
          <h1 className="font-serif text-5xl leading-[1.02] tracking-tight text-foreground md:text-7xl lg:text-[88px]">
            Build newsletters
            <br />
            <span className="italic text-muted-foreground">
              people actually
            </span>{" "}
            read.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Projects, pages, canvases. Design your entire newsletter campaign
            the way designers organize their work — not one email at a time.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-all hover:opacity-90"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
            >
              Browse templates
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-6xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
              <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                mailshot.app / editor
              </span>
            </div>
            <div className="h-[610px] bg-muted overflow-hidden">
              <img
                src={AppPreview}
                alt="MailShot editor"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

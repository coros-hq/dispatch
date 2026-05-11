import {
  MousePointer2,
  ShieldCheck,
  Send,
  Code2,
  ArrowRight,
  Star,
  Check,
  Link,
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TemplatePreview } from "@/components/landing/TemplatePreview";
import AppPreview from "@/assets/app-preview.png";

export function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Templates />
        <HowItWorks />
        <OpenSource />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
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
            Dispatch is a drag-and-drop email builder with built-in
            compatibility testing for Gmail, Outlook, and Apple Mail — so what
            you ship is what they see.
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
                dispatch.app / editor
              </span>
            </div>
            <div className="h-[500px] bg-muted overflow-hidden">
              <img
                src={AppPreview}
                alt="Dispatch editor"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: MousePointer2,
    title: "Drag & drop canvas",
    desc: "A Notion-style editor that feels like writing, not coding. Drop blocks, rearrange, ship.",
  },
  {
    icon: ShieldCheck,
    title: "Compatibility checker",
    desc: "See exactly how your email renders in Gmail, Outlook, and Apple Mail before you hit send.",
  },
  {
    icon: Send,
    title: "Send test emails",
    desc: "Preview in your own inbox without leaving the editor. No copy-pasting HTML.",
  },
  {
    icon: Code2,
    title: "Export clean code",
    desc: "Download production-ready HTML or React Email components. Yours to own, forever.",
  },
];

function Features() {
  return (
    <section className="border-b border-border/50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            What's inside
          </p>
          <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Everything you need.
            <br />
            <span className="italic text-muted-foreground">
              Nothing you don't.
            </span>
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-card p-8 transition-colors hover:bg-muted/40 md:p-10"
            >
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:-rotate-6">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-2xl text-foreground">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const templates = [
  { name: "Minimal", category: "Newsletter", variant: "digest" as const },
  { name: "Product Launch", category: "Marketing", variant: "launch" as const },
  { name: "Promotional", category: "Marketing", variant: "promo" as const },
];

function Templates() {
  return (
    <section className="border-b border-border/50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Templates
            </p>
            <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
              Start from a template.
            </h2>
          </div>
          <a
            href="/templates"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse all templates
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {templates.map((t) => (
            <a
              key={t.name}
              href="/templates"
              className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <div className="h-[280px] overflow-hidden bg-muted relative">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
                  <TemplatePreview variant={t.variant} />
                </div>
              </div>
              <div className="flex items-center justify-between p-5 border-t border-border">
                <div>
                  <h3 className="font-serif text-xl text-foreground">
                    {t.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    num: "01",
    title: "Build",
    desc: "Drag blocks onto the canvas. Headlines, images, buttons, dividers — compose like a designer.",
  },
  {
    num: "02",
    title: "Test",
    desc: "Run the compatibility checker. Send a test to your inbox. Catch issues before subscribers do.",
  },
  {
    num: "03",
    title: "Export",
    desc: "Copy production HTML, or export React Email components. Plug into any sending service.",
  },
];

function HowItWorks() {
  return (
    <section className="border-b border-border/50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Three steps.{" "}
            <span className="italic text-muted-foreground">
              Then you're done.
            </span>
          </h2>
        </div>
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-12 top-6 hidden h-px w-[calc(100%-3rem)] bg-gradient-to-r from-border to-transparent md:block" />
              )}
              <div className="font-mono text-sm text-primary">{s.num}</div>
              <h3 className="mt-3 font-serif text-3xl text-foreground">
                {s.title}
              </h3>
              <p className="mt-3 text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenSource() {
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
              <span className="text-muted-foreground">dispatch / dispatch</span>
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

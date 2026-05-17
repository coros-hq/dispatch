import { ArrowRight } from "lucide-react";
import { TemplatePreview } from "@/components/landing/TemplatePreview";

const templates = [
  { name: "Minimal", category: "Newsletter", variant: "digest" as const },
  { name: "Product Launch", category: "Marketing", variant: "launch" as const },
  { name: "Promotional", category: "Marketing", variant: "promo" as const },
];

export function Templates() {
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

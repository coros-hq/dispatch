import {
  MousePointer2,
  ShieldCheck,
  Send,
  Code2,
  Layers,
  Users,
  History,
  LayoutTemplate,
} from "lucide-react";

const features = [
  {
    icon: MousePointer2,
    title: "Drag & drop canvas",
    desc: "Notion-style infinite canvas. Drop blocks, rearrange sections, build multi-page newsletters side by side.",
  },
  {
    icon: ShieldCheck,
    title: "Compatibility checker",
    desc: "See exactly how your email renders across 18 clients — Gmail, Outlook 2007–365, Apple Mail and more.",
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
  {
    icon: Layers,
    title: "Multi-page projects",
    desc: "Build complete newsletter campaigns with multiple pages and A/B variants — all in one project.",
  },
  {
    icon: Users,
    title: "Team workspaces",
    desc: "Invite your team, assign roles, and collaborate on newsletters together in a shared workspace.",
  },
  {
    icon: History,
    title: "Version history",
    desc: "Every save creates a snapshot. Browse, preview and restore any previous version of your project.",
  },
  {
    icon: LayoutTemplate,
    title: "Template library",
    desc: "Start from a curated template or publish your own to the community. Free for everyone.",
  },
]

export function Features() {
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

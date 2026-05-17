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

export function HowItWorks() {
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

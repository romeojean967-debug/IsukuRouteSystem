import { Link } from "@tanstack/react-router";

export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <main className="hero-glow">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
        <p className="mt-2 text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="surface-card mt-10 divide-y divide-border">
          {sections.map((s) => (
            <section key={s.title} className="p-6">
              <h2 className="font-display text-lg font-semibold">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link to="/terms" className="text-primary underline">
            Terms &amp; Conditions
          </Link>
          <Link to="/privacy" className="text-primary underline">
            Privacy Notice
          </Link>
          <Link to="/register" className="text-primary underline">
            Register your company
          </Link>
        </div>
      </div>
    </main>
  );
}

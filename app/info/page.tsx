import type { Metadata } from "next";
import { PageReveal } from "@/app/components/PageReveal";

export const metadata: Metadata = {
  title: "Info — Emmetry",
  description: "About the Emmetry family record.",
};

export default function InfoPage() {
  const monoLabel = "font-mono uppercase text-ghost-strong";
  const labelStyle = {
    fontSize: "var(--text-label)",
    letterSpacing: "var(--tracking-nav)",
  } as React.CSSProperties;

  return (
    <PageReveal>
      <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
        <h1
          data-reveal
          className="font-sans font-[400] leading-[0.95] text-ghost-strong"
          style={{
            fontSize: "var(--text-display)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          Info
        </h1>

        <div
          data-reveal
          className="mt-10 max-w-xl space-y-6"
          style={{
            fontSize: "var(--text-body)",
            lineHeight: "var(--text-body--line-height)",
          }}
        >
          <p className="font-sans text-ink">
            Emmetry is a family history record documenting six generations of
            the Emmet family, from Thomas Addis Emmet in the late eighteenth
            century through to his living descendants. It collects names, dates,
            portraits, and the connections between them — Unions, parentage,
            birthplaces — in one navigable record.
          </p>
          <p className="font-sans text-ink">
            The site was originally built by Jesse Emmet and went offline around
            2021. This version is a faithful reconstruction, drawing on content
            recovered from the Wayback Machine, with the same 133 individuals
            and their records carried forward.
          </p>
        </div>

        <div data-reveal className="mt-12 border-t border-rule pt-8 space-y-4">
          <div className="flex items-baseline gap-6 border-b border-rule py-3">
            <span className={monoLabel} style={labelStyle}>
              Developer
            </span>
            <a
              href="mailto:admin@tool.nyc"
              className="font-mono text-ink transition-opacity hover:opacity-60"
              style={labelStyle}
            >
              admin@tool.nyc
            </a>
          </div>
          <div className="flex items-baseline gap-6 border-b border-rule py-3">
            <span className={monoLabel} style={labelStyle}>
              Maintainer
            </span>
            <a
              href="mailto:jessidoyle@gmail.com"
              className="font-mono text-ink transition-opacity hover:opacity-60"
              style={labelStyle}
            >
              jessidoyle@gmail.com
            </a>
          </div>
        </div>
      </main>
    </PageReveal>
  );
}

import { formatIsoDate } from "@/lib/dates";

function yearOf(iso: string | null): string {
  if (!iso) return "";
  return iso.split("-")[0] ?? "";
}

/**
 * Tiny stacked birth-over-death dates, vertically centered against the name.
 * In list contexts we show year-only; the detail field table renders full
 * dates directly via formatIsoDate, not this component.
 */
export function LifeDates({
  birthDate,
  deathDate,
  format = "year",
  sizeVar = "var(--text-name)",
}: {
  birthDate: string | null;
  deathDate: string | null;
  format?: "year" | "full";
  /** Name size this sits beside; used only to scale the optical nudge. */
  sizeVar?: string;
}) {
  if (!birthDate && !deathDate) return null;
  const render = format === "year" ? yearOf : formatIsoDate;
  return (
    // Inter rests low in its line box, so box-centering reads optically high.
    // Nudge down by a fraction of the name size (em on this zero-leading
    // wrapper resolves against sizeVar) so the dates center on the glyphs.
    <span
      className="relative flex-shrink-0 self-center"
      style={{ fontSize: sizeVar, lineHeight: 0, top: "0.1em" }}
      aria-hidden={false}
    >
      <span
        className="font-mono text-ghost-strong flex flex-col"
        style={{
          fontSize: "var(--text-date)",
          lineHeight: "var(--text-date--line-height)",
        }}
      >
        {birthDate && <span>{render(birthDate)}</span>}
        {deathDate && <span>{render(deathDate)}</span>}
      </span>
    </span>
  );
}

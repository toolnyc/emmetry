/**
 * The recovered `name` data embeds the hand-assigned descent number inline,
 * e.g. "Thomas (1) Addis Emmet" or "John (40A) Patten Emmet". DESIGN.md and
 * ADR-0005 require names to render plainly, with the Genealogical ID never
 * shown inline. This strips that parenthetical descent token for display.
 */
export function displayName(name: string | null | undefined): string {
  if (!name) return "UNKNOWN";
  return name
    .replace(/\s*\(\d+[A-Za-z]?\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Returns the plain formal name for display, stripping any embedded
 * genealogical ID token (e.g. "(8)") as a safety net for legacy strings.
 */
export function displayName(name: string | null | undefined): string {
  if (!name) return "UNKNOWN";
  return name
    .replace(/\s*\(\d+[A-Za-z]?\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Returns the preferred display name when one is set, otherwise falls back
 * to the formal name via displayName().
 */
export function resolveDisplayName(
  name: string | null | undefined,
  preferredName: string | null | undefined
): string {
  if (preferredName) return preferredName;
  return displayName(name);
}

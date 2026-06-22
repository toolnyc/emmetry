const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

/** Parse legacy "Wednesday, March 20, 1963" -> "1963-03-20" */
export function parseLegacyDate(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  // Try "DayName, Month DD, YYYY" or "Month DD, YYYY"
  const fullMatch = trimmed.match(
    /(?:\w+,\s+)?(\w+)\s+(\d{1,2}),\s+(\d{4})/
  );
  if (fullMatch) {
    const month = MONTH_MAP[fullMatch[1]];
    if (month) {
      const day = fullMatch[2].padStart(2, "0");
      return `${fullMatch[3]}-${month}-${day}`;
    }
  }
  // Year only
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  // Already ISO-ish
  if (/^\d{4}-\d{2}(-\d{2})?$/.test(trimmed)) return trimmed;
  return null;
}

/** Format ISO partial date for public display: "1963-03-20" -> "March 20, 1963" */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length === 1) return parts[0]; // year only
  const monthName = MONTH_NAMES[parseInt(parts[1], 10) - 1];
  if (!monthName) return iso;
  if (parts.length === 2) return `${monthName} ${parts[0]}`;
  const day = parseInt(parts[2], 10);
  return `${monthName} ${day}, ${parts[0]}`;
}

/** Split ISO partial date into form parts */
export function splitIsoParts(iso: string | null | undefined): {
  year: string;
  month: string;
  day: string;
} {
  if (!iso) return { year: "", month: "", day: "" };
  const parts = iso.split("-");
  return {
    year: parts[0] ?? "",
    month: parts[1] ?? "",
    day: parts[2] ?? "",
  };
}

/** Join form parts back to ISO partial date, or null if all empty */
export function joinIsoParts(
  year: string,
  month: string,
  day: string
): string | null {
  const y = year.trim();
  const m = month.trim();
  const d = day.trim();
  if (!y) return null;
  if (!m) return y;
  if (!d) return `${y}-${m.padStart(2, "0")}`;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export { MONTH_NAMES };

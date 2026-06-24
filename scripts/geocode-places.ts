import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONN_STRING!);

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Emmetry/1.0 (genealogy site; contact via github.com/emmetry)";
const RATE_LIMIT_MS = 1100;

// Hand-curated overrides for strings Nominatim can't resolve well.
const OVERRIDES: Record<string, { lat: number; lng: number } | null> = {
  "at sea with the US Navy": null,
  "at sea": null,
  "unknown": null,
  "unknonwn": null,
  "killed in action over Germany (near Ulm) while in the US Army Air Force": null,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Strip leading street-level fragments so Nominatim gets city/region granularity.
// "90 West 22nd St., New York, NY" -> "New York, NY"
function toSearchQuery(name: string): string | null {
  const parts = name.split(",").map((s) => s.trim());
  if (parts.length <= 1) return name.trim() || null;

  // If the first part looks like a street address (starts with a number or
  // contains a street keyword), drop it.
  const firstLooksLikeStreet =
    /^\d/.test(parts[0]) ||
    /\b(St\.|Street|Ave\.|Avenue|Rd\.|Road|Blvd|Lane|Dr\.|Drive|Way|Pl\.|Place|Court|Ct\.)\b/i.test(
      parts[0]
    );

  return firstLooksLikeStreet ? parts.slice(1).join(", ") : name;
}

async function geocode(
  name: string
): Promise<{ lat: number; lng: number } | null> {
  if (name in OVERRIDES) return OVERRIDES[name];

  const query = toSearchQuery(name);
  if (!query) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!res.ok) {
    console.warn(`  Nominatim HTTP ${res.status} for "${name}"`);
    return null;
  }

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
  }>;
  if (!results.length) return null;

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

async function main() {
  const rows = (await sql`
    SELECT id, name FROM "places" WHERE lat IS NULL ORDER BY name
  `) as { id: string; name: string }[];

  if (rows.length === 0) {
    console.log("All places already geocoded.");
    return;
  }

  console.log(`Geocoding ${rows.length} places...\n`);
  let resolved = 0;
  let skipped = 0;

  for (const row of rows) {
    const coords = await geocode(row.name);
    if (coords) {
      await sql`
        UPDATE "places"
        SET lat = ${coords.lat}, lng = ${coords.lng}, updated_at = now()
        WHERE id = ${row.id}
      `;
      console.log(`  ✓ ${row.name} → (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
      resolved++;
    } else {
      console.log(`  — ${row.name} (unresolvable, left null)`);
      skipped++;
    }
    await sleep(RATE_LIMIT_MS);
  }

  console.log(`\nDone. ${resolved} geocoded, ${skipped} unresolvable.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "../db/schema";
import { isNotNull } from "drizzle-orm";
import { eq } from "drizzle-orm";

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people } });

/**
 * Extracts the preferred display name and cleans the formal name from a raw
 * name string that may contain:
 *   - an embedded genealogical ID token like "(8)" or "(40A)"
 *   - a quoted preferred name token like "Jeannette"
 *
 * Examples:
 *   'Jane (8) "Jeannette" Erin Emmet' -> { cleaned: 'Jane Erin Emmet', preferred: 'Jeannette Erin Emmet' }
 *   'Thomas (1) Addis Emmet'          -> { cleaned: 'Thomas Addis Emmet', preferred: null }
 *   'Rosina "Posie" Hubley Emmet'     -> { cleaned: 'Rosina Hubley Emmet', preferred: 'Posie Hubley Emmet' }
 */
function parseName(raw: string): { cleaned: string; preferred: string | null } {
  // Match both straight ASCII quotes and Unicode curly quotes
  const quoteMatch = raw.match(/^(.*?)\s*[\u201c"]([^\u201d"]+)[\u201d"]\s*(.*)$/);

  let preferred: string | null = null;
  let withoutQuotes = raw;

  if (quoteMatch) {
    const prefix = quoteMatch[1];
    const preferredToken = quoteMatch[2];
    const suffix = quoteMatch[3];
    preferred = [preferredToken, suffix].filter(Boolean).join(" ").trim();
    withoutQuotes = [prefix, suffix].filter(Boolean).join(" ").trim();
  }

  // Strip embedded genealogical ID tokens like "(8)" or "(40A)"
  const cleaned = withoutQuotes
    .replace(/\s*\(\d+[A-Za-z]?\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return { cleaned, preferred };
}

async function main() {
  const rows = await db.select({ id: people.id, name: people.name }).from(people).where(isNotNull(people.name));

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.name) continue;
    const { cleaned, preferred } = parseName(row.name);

    if (cleaned === row.name && preferred === null) {
      skipped++;
      continue;
    }

    await db
      .update(people)
      .set({ name: cleaned, preferredName: preferred, updatedAt: new Date() })
      .where(eq(people.id, row.id));

    console.log(`  ${row.name}`);
    console.log(`    name      → ${cleaned}`);
    if (preferred) console.log(`    preferred → ${preferred}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated, ${skipped} unchanged.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

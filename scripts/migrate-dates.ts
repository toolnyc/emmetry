/**
 * One-time migration: convert birthDate/deathDate from legacy text format
 * ("Wednesday, March 20, 1963") to ISO partial format ("1963-03-20").
 *
 * Run: npx tsx scripts/migrate-dates.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "../db/schema";
import { parseLegacyDate } from "../lib/dates";
import { eq } from "drizzle-orm";

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people } });

async function main() {
  const rows = await db.select({ id: people.id, name: people.name, birthDate: people.birthDate, deathDate: people.deathDate }).from(people);

  let updated = 0;
  const unparseable: string[] = [];

  for (const row of rows) {
    const newBirth = parseLegacyDate(row.birthDate);
    const newDeath = parseLegacyDate(row.deathDate);

    if (row.birthDate && newBirth === null) {
      unparseable.push(`[${row.name ?? "UNKNOWN"}] birthDate: "${row.birthDate}"`);
    }
    if (row.deathDate && newDeath === null) {
      unparseable.push(`[${row.name ?? "UNKNOWN"}] deathDate: "${row.deathDate}"`);
    }

    const birthChanged = row.birthDate !== newBirth;
    const deathChanged = row.deathDate !== newDeath;

    if (birthChanged || deathChanged) {
      await db.update(people)
        .set({
          birthDate: birthChanged ? newBirth : row.birthDate,
          deathDate: deathChanged ? newDeath : row.deathDate,
        })
        .where(eq(people.id, row.id));
      updated++;
    }
  }

  console.log(`Migrated ${updated} / ${rows.length} records.`);
  if (unparseable.length > 0) {
    console.warn("Could not parse the following dates (left unchanged):");
    unparseable.forEach((s) => console.warn(" ", s));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

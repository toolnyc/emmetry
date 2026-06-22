import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "../db/schema";

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people } });

function parseCatalog(catalogPath: string) {
  const content = readFileSync(catalogPath, "utf-8");

  // Find the ## People section
  const peopleStart = content.indexOf("\n## People\n");
  if (peopleStart === -1) throw new Error("## People section not found");

  // Find where the next ## section starts (## Legacy Static Pages)
  const legacyStart = content.indexOf("\n## Legacy Static Pages\n");
  const peopleSection = content.slice(
    peopleStart,
    legacyStart === -1 ? undefined : legacyStart
  );

  // Split on ### headings
  const blocks = peopleSection.split(/\n### /).slice(1);

  const records = blocks.map((block) => {
    const lines = block.split("\n");
    const heading = lines[0].trim();

    // Strip date suffix like " (1764--1827)" or " (1963--)" from name
    const name = heading.replace(/\s*\(\d{4}--(?:\d{4})?\)\s*$/, "").trim();

    const get = (field: string): string | null => {
      const prefix = `- **${field}:** `;
      const line = lines.find((l) => l.startsWith(prefix));
      if (!line) return null;
      return line.slice(prefix.length).trim() || null;
    };

    const generation = get("Generation");
    const genealogicalId = get("Genealogical ID");

    // Born: "Wednesday, April 24, 1764, Cork, Eire" -> split on last occurrence of ", [A-Z]" for place
    const bornRaw = get("Born");
    const diedRaw = get("Died");

    const parseDateTime = (raw: string | null) => {
      if (!raw) return { date: null, place: null };
      // Format: "DayName, Month DD, YYYY, Place" or "Month DD, YYYY, Place"
      // Date portion ends after the year (4 digits), place is the remainder
      const match = raw.match(/^(.*?\d{4}),?\s*(.*)$/);
      if (!match) return { date: raw, place: null };
      return {
        date: match[1].trim() || null,
        place: match[2].trim() || null,
      };
    };

    const born = parseDateTime(bornRaw);
    const died = parseDateTime(diedRaw);

    const bio = get("Bio");

    return {
      name: name || null,
      genealogicalId,
      generation,
      birthDate: born.date,
      birthPlace: born.place,
      deathDate: died.date,
      deathPlace: died.place,
      bio,
      photoUrl: null,
    };
  });

  return records;
}

async function main() {
  const catalogPath = join(
    process.cwd(),
    "archive",
    "extracts",
    "CATALOG.md"
  );

  console.log("Parsing CATALOG.md...");
  const records = parseCatalog(catalogPath);
  console.log(`Parsed ${records.length} people`);

  console.log("Clearing existing people...");
  await db.delete(people);

  console.log("Inserting people...");
  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await db.insert(people).values(batch);
    console.log(`  Inserted ${Math.min(i + batchSize, records.length)}/${records.length}`);
  }

  console.log("Done.");

  // Quick verification: count by generation
  const all = await db.select().from(people);
  const bygen: Record<string, number> = {};
  for (const p of all) {
    const g = p.generation ?? "(married-in)";
    bygen[g] = (bygen[g] ?? 0) + 1;
  }
  console.log("\nCount by generation:");
  const order = ["Founders", "1st Generation", "2nd Generation", "3rd Generation", "4th Generation", "5th Generation", "6th Generation", "(married-in)"];
  for (const g of order) {
    if (bygen[g]) console.log(`  ${g}: ${bygen[g]}`);
  }
  // Any unexpected generations
  for (const [g, n] of Object.entries(bygen)) {
    if (!order.includes(g)) console.log(`  [unexpected] ${g}: ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

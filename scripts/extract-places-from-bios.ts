/**
 * One-time script: for people whose birth/death place is unset but who have
 * a bio, use an LLM to extract candidate place strings.
 *
 * Requires: OPENAI_API_KEY in .env.local
 *
 * Run in dry-run mode first (prints candidates), then pass --commit to write.
 *   npx tsx scripts/extract-places-from-bios.ts
 *   npx tsx scripts/extract-places-from-bios.ts --commit
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONN_STRING!);
const commit = process.argv.includes("--commit");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

interface Extraction {
  birthPlace: string | null;
  deathPlace: string | null;
}

async function extract(bio: string): Promise<Extraction> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract birth and death locations from genealogy bios. " +
            "Return JSON: { birthPlace: string|null, deathPlace: string|null }. " +
            "Use the most specific place mentioned (city/region level, not a street address). " +
            "Return null if the bio does not mention a birth or death location.",
        },
        { role: "user", content: bio },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as Extraction;
}

async function findOrCreatePlace(name: string): Promise<string> {
  const existing = (await sql`
    SELECT id FROM "places" WHERE name = ${name} LIMIT 1
  `) as { id: string }[];
  if (existing.length) return existing[0].id;

  const inserted = (await sql`
    INSERT INTO "places" (name) VALUES (${name}) RETURNING id
  `) as { id: string }[];
  return inserted[0].id;
}

async function main() {
  const rows = (await sql`
    SELECT id, name, bio FROM "people"
    WHERE bio IS NOT NULL AND bio <> ''
      AND birth_place_id IS NULL
      AND death_place_id IS NULL
  `) as { id: string; name: string | null; bio: string }[];

  if (rows.length === 0) {
    console.log("No candidates found.");
    return;
  }

  console.log(
    `${commit ? "COMMIT" : "DRY RUN"} — extracting from ${rows.length} bios\n`
  );

  for (const row of rows) {
    let extraction: Extraction;
    try {
      extraction = await extract(row.bio);
    } catch (err) {
      console.error(`  ERROR for ${row.name ?? row.id}:`, err);
      continue;
    }

    const { birthPlace, deathPlace } = extraction;
    if (!birthPlace && !deathPlace) {
      console.log(`  — ${row.name ?? row.id}: no places found`);
      continue;
    }

    console.log(`  ${row.name ?? row.id}`);
    if (birthPlace) console.log(`    birth → "${birthPlace}"`);
    if (deathPlace) console.log(`    death → "${deathPlace}"`);

    if (commit) {
      if (birthPlace) {
        const placeId = await findOrCreatePlace(birthPlace);
        await sql`
          UPDATE "people" SET birth_place_id = ${placeId}, updated_at = now()
          WHERE id = ${row.id}
        `;
      }
      if (deathPlace) {
        const placeId = await findOrCreatePlace(deathPlace);
        await sql`
          UPDATE "people" SET death_place_id = ${placeId}, updated_at = now()
          WHERE id = ${row.id}
        `;
      }
    }
  }

  console.log(commit ? "\nCommitted." : "\nRun with --commit to write.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

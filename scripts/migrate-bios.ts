/**
 * migrate-bios.ts
 *
 * Re-extracts full biography text from the archive HTML files and updates
 * any truncated (or missing) bio in the database.
 *
 * The catalog CATALOG.md provides the mapping from person → HTML file.
 * The HTML files live at archive/site/<file-path>.
 *
 * Usage:
 *   npx tsx scripts/migrate-bios.ts          # dry run (no DB writes)
 *   npx tsx scripts/migrate-bios.ts --commit  # write to DB
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "../db/schema";
import { eq } from "drizzle-orm";

const commit = process.argv.includes("--commit");

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people } });

const ROOT = join(process.cwd(), "archive/site");

// --- Catalog parser ---------------------------------------------------------

type CatalogEntry = {
  name: string;
  genealogicalId: string | null;
  file: string | null;
};

function parseCatalog(catalogPath: string): CatalogEntry[] {
  const content = readFileSync(catalogPath, "utf-8");

  const peopleStart = content.indexOf("\n## People\n");
  if (peopleStart === -1) throw new Error("## People section not found");
  const legacyStart = content.indexOf("\n## Legacy Static Pages\n");
  const peopleSection = content.slice(
    peopleStart,
    legacyStart === -1 ? undefined : legacyStart
  );

  const blocks = peopleSection.split(/\n### /).slice(1);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const heading = lines[0].trim().replace(/\s*\(\d*--\d*\)\s*$/, "").trim();

    const get = (field: string): string | null => {
      const prefix = `- **${field}:** `;
      const line = lines.find((l) => l.startsWith(prefix));
      if (!line) return null;
      const val = line.slice(prefix.length).trim();
      // Strip backticks from file paths like `emmetry.org/people/...`
      return val.replace(/^`|`$/g, "") || null;
    };

    return {
      name: heading,
      genealogicalId: get("Genealogical ID"),
      file: get("File"),
    };
  });
}

// --- Bio extractor ----------------------------------------------------------

function extractBio(htmlPath: string): string | null {
  if (!existsSync(htmlPath)) return null;
  const html = readFileSync(htmlPath, "utf-8");

  // The body field is inside <div class="field field-name-body ...">
  // followed by <div class="field-item even">TEXT</div>
  const match = html.match(
    /field-name-body[\s\S]*?<div class="field-item even">([\s\S]*?)<\/div>\s*<\/div>/
  );
  if (!match) return null;

  // Strip HTML tags, collapse whitespace, replace non-breaking spaces
  let text = match[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&hellip;/g, "...")
    .replace(/&#[0-9]+;/g, " ")
    .replace(/\xa0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

// --- Main -------------------------------------------------------------------

async function main() {
  const catalogPath = join(process.cwd(), "archive/extracts/CATALOG.md");
  const entries = parseCatalog(catalogPath);

  const dbPeople = await db.select().from(people);
  const byGenealogyId = new Map(
    dbPeople
      .filter((p) => p.genealogicalId)
      .map((p) => [p.genealogicalId!, p])
  );
  // For name matching: only map people WITHOUT a genealogical ID (married-in).
  // Descendants are always looked up by gid to avoid collisions where a Descendant
  // and a married-in person share the same display name.
  const byName = new Map(
    dbPeople
      .filter((p) => p.name && !p.genealogicalId)
      .map((p) => [p.name!, p])
  );

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const entry of entries) {
    if (!entry.file) {
      skipped++;
      continue;
    }

    const htmlPath = join(ROOT, entry.file);
    const fullBio = extractBio(htmlPath);

    if (!fullBio) {
      console.warn(`  NO BIO in HTML: ${entry.file}`);
      skipped++;
      continue;
    }

    // Match to DB person: prefer genealogical ID, fall back to name
    let person = entry.genealogicalId ? byGenealogyId.get(entry.genealogicalId) : undefined;
    if (!person) person = byName.get(entry.name);

    if (!person) {
      console.warn(`  NO DB MATCH: "${entry.name}" (gid=${entry.genealogicalId ?? "none"})`);
      notFound++;
      continue;
    }

    // Only update if the new bio is longer (avoids downgrading manually-entered bios)
    const currentLen = person.bio?.length ?? 0;
    if (fullBio.length <= currentLen && !person.bio?.endsWith("...")) {
      skipped++;
      continue;
    }

    console.log(
      `  ${commit ? "UPDATE" : "DRY RUN"} ${person.name ?? "UNKNOWN"} (gid=${person.genealogicalId ?? "none"}): ${currentLen} → ${fullBio.length} chars`
    );

    if (commit) {
      await db.update(people).set({ bio: fullBio }).where(eq(people.id, person.id));
    }

    updated++;
  }

  console.log(
    `\nDone. ${commit ? "Updated" : "Would update"}: ${updated}, skipped: ${skipped}, not found: ${notFound}`
  );
  if (!commit) console.log("Run with --commit to apply changes.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

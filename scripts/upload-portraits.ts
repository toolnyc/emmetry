import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync, readdirSync } from "fs";
import { join, basename } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people } from "../db/schema";
import { eq, isNull } from "drizzle-orm";
import { put } from "@vercel/blob";

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people } });

const PORTRAITS_DIR = join(
  __dirname,
  "../archive/site/emmetry.org/sites/default/files/people"
);

function parseGenealogicalId(filename: string): string | null {
  const base = decodeURIComponent(basename(filename, ".jpg")
    .replace(/\.jpeg$/, "")
    .toLowerCase());

  if (base.includes("crest")) return null;

  // TAE pattern: e.g. drtae-25
  const taeMatch = base.match(/tae[-_](\d+)/);
  if (taeMatch) return taeMatch[1];

  const parts = base.split(/[-_]/);

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p.includes("emmet")) continue;

    // Number embedded before emmet: "8emmet", "11emmet"
    const prefixMatch = p.match(/^(\d+)emmet/);
    if (prefixMatch) return prefixMatch[1];

    // Number embedded after emmet, not followed by more word chars: "emmet27" not "emmet72dpi"
    const suffixMatch = p.match(/emmet(\d+)(?!\w)/);
    if (suffixMatch) return suffixMatch[1];

    // No embedded number -- check adjacent parts for a pure number
    const prev = parts[i - 1];
    const next = parts[i + 1];
    if (prev && /^\d+$/.test(prev)) return prev;
    if (next && /^\d+$/.test(next)) return next;
    const prev2 = parts[i - 2];
    const next2 = parts[i + 2];
    if (prev2 && /^\d+$/.test(prev2)) return prev2;
    if (next2 && /^\d+$/.test(next2)) return next2;
  }

  return null;
}

function mimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function main() {
  const allPeople = await db.select().from(people);
  const byGid = new Map(
    allPeople.filter((p) => p.genealogicalId).map((p) => [p.genealogicalId!, p])
  );

  const files = readdirSync(PORTRAITS_DIR);

  let matched = 0;
  let skipped = 0;
  let unmatched: string[] = [];

  for (const file of files) {
    const gid = parseGenealogicalId(file);
    if (!gid) {
      console.log(`  skip (crest or no ID): ${file}`);
      skipped++;
      continue;
    }

    const person = byGid.get(gid);
    if (!person) {
      console.log(`  no DB match (ID ${gid}): ${file}`);
      unmatched.push(file);
      continue;
    }

    if (person.photoUrl) {
      console.log(`  already has photo (ID ${gid}): ${person.name ?? "UNKNOWN"} — skip`);
      skipped++;
      continue;
    }

    const filePath = join(PORTRAITS_DIR, file);
    const fileBuffer = readFileSync(filePath);
    const blobName = `portraits/${file}`;

    console.log(`  uploading (ID ${gid}): ${person.name ?? "UNKNOWN"} ← ${file}`);
    const blob = await put(blobName, fileBuffer, {
      access: "public",
      contentType: mimeType(file),
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    });

    await db.update(people).set({ photoUrl: blob.url }).where(eq(people.id, person.id));
    matched++;
  }

  console.log(`\nDone. Uploaded: ${matched}, Skipped: ${skipped}, Unmatched: ${unmatched.length}`);
  if (unmatched.length > 0) {
    console.log("Unmatched files (manual assignment needed):");
    unmatched.forEach((f) => console.log(`  ${f}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

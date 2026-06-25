/**
 * Converts plain-text bios to HTML paragraphs.
 *
 * Strategy: split each bio into sentences (period/!/? followed by a space and
 * a capital letter or end-of-string), then group ~4 sentences per paragraph
 * and wrap each group in <p>…</p>.
 *
 * Idempotent: skips any bio that already starts with "<p".
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONN_STRING!);

const SENTENCES_PER_PARAGRAPH = 4;

function toHtml(text: string): string {
  // Split on sentence-ending punctuation followed by whitespace + capital letter,
  // keeping the delimiter attached to the sentence that precedes it.
  const sentenceRe = /(?<=[.!?])\s+(?=[A-Z"'])/g;
  const sentences = text.split(sentenceRe).map((s) => s.trim()).filter(Boolean);

  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARAGRAPH) {
    const chunk = sentences.slice(i, i + SENTENCES_PER_PARAGRAPH).join(" ");
    paragraphs.push(`<p>${chunk}</p>`);
  }

  return paragraphs.join("\n");
}

async function main() {
  const rows = (await sql`
    SELECT id, name, bio FROM people
    WHERE bio IS NOT NULL AND bio != ''
    ORDER BY name
  `) as { id: string; name: string; bio: string }[];

  let converted = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.bio.trimStart().startsWith("<p")) {
      skipped++;
      continue;
    }

    const html = toHtml(row.bio);
    await sql`
      UPDATE people SET bio = ${html}, updated_at = now() WHERE id = ${row.id}
    `;
    console.log(`  ✓ ${row.name}`);
    converted++;
  }

  console.log(`\nDone. ${converted} converted, ${skipped} already HTML.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

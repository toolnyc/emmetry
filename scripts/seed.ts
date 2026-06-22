import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readFileSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { people, unions, parentChild } from "../db/schema";
import type { Person } from "../db/schema";
import { parseLegacyDate } from "../lib/dates";

const sql = neon(process.env.NEON_CONN_STRING!);
const db = drizzle(sql, { schema: { people, unions, parentChild } });

const GEN_ORDER = [
  "Founders",
  "1st Generation",
  "2nd Generation",
  "3rd Generation",
  "4th Generation",
  "5th Generation",
  "6th Generation",
];

// Split "NameA, NameB" on the first comma that sits outside parentheses
function splitOnFirstTopLevelComma(str: string): [string, string] {
  let depth = 0;
  for (let i = 0; i < str.length - 1; i++) {
    if (str[i] === "(") depth++;
    else if (str[i] === ")") depth--;
    else if (str[i] === "," && str[i + 1] === " " && depth === 0) {
      return [str.slice(0, i).trim(), str.slice(i + 2).trim()];
    }
  }
  return [str.trim(), ""];
}

// Parse "NameA, NameB (DayName, Month DD, YYYY)" into parts
function parseUnionLine(raw: string): { nameA: string; nameB: string; date: string | null } {
  // Strip trailing date " (DayName, Month DD, YYYY)" -- date always has a 4-digit year
  const dateMatch = raw.match(/\s+\(([^)]*\d{4}[^)]*)\)\s*$/);
  const rawDate = dateMatch ? dateMatch[1].trim() : null;
  const date = rawDate ? (parseLegacyDate(rawDate) ?? rawDate) : null;
  const withoutDate = dateMatch ? raw.slice(0, dateMatch.index).trim() : raw.trim();
  const [nameA, nameB] = splitOnFirstTopLevelComma(withoutDate);
  return { nameA, nameB, date };
}

type ResolveRole = "parent" | "child" | "union-partner";

function resolveName(
  rawName: string,
  byGenealogyId: Map<string, Person>,
  byName: Map<string, Person[]>,
  role: ResolveRole,
  currentGeneration: string | null,
  currentPersonId?: string
): Person | null {
  // 1. Extract embedded genealogical ID like "(6)" or "(40A)"
  const idMatch = rawName.match(/\((\d+[A-Za-z]?)\)/);
  if (idMatch) {
    const p = byGenealogyId.get(idMatch[1]);
    if (p) return p;
  }

  // 2. Exact name match
  const candidates = byName.get(rawName) ?? [];
  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) {
    console.warn(`  UNRESOLVED: "${rawName}"`);
    return null;
  }

  // 3. For union lines: if the current person is among the candidates, use them
  // (union lines always list both parties; one is the page owner)
  if (role === "union-partner" && currentPersonId) {
    const self = candidates.find((p) => p.id === currentPersonId);
    if (self) return self;
  }

  // 4. Disambiguate by generation ordering
  const currentIdx = currentGeneration ? GEN_ORDER.indexOf(currentGeneration) : -1;

  if (role === "parent" && currentIdx > 0) {
    const fits = candidates.filter((p) => {
      if (!p.generation) return true; // Married-in can be a parent
      return GEN_ORDER.indexOf(p.generation) < currentIdx;
    });
    if (fits.length === 1) return fits[0];
  }

  if (role === "child" && currentIdx >= 0) {
    // Prefer exact next generation first
    const nextGen = candidates.filter(
      (p) => p.generation && GEN_ORDER.indexOf(p.generation) === currentIdx + 1
    );
    if (nextGen.length === 1) return nextGen[0];
    // Fall back to any higher generation
    const fits = candidates.filter(
      (p) => p.generation && GEN_ORDER.indexOf(p.generation) > currentIdx
    );
    if (fits.length === 1) return fits[0];
  }

  console.warn(
    `  AMBIGUOUS: "${rawName}" (${candidates.length} matches, role=${role}, currentGen=${currentGeneration ?? "none"})`
  );
  return null;
}

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

    // Strip date suffix like " (1764--1827)", " (1963--)", or " (--1886)"
    const name = heading.replace(/\s*\(\d*--\d*\)\s*$/, "").trim();

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
        date: parseLegacyDate(match[1].trim()) ?? (match[1].trim() || null),
        place: match[2].trim() || null,
      };
    };

    const born = parseDateTime(bornRaw);
    const died = parseDateTime(diedRaw);

    const bio = get("Bio");

    // Raw relationship strings for second-pass seeding
    const parentsRaw = get("Parents");
    const childrenRaw = get("Children");
    // A person can appear on multiple union lines; collect all
    const unionLines = lines
      .filter((l) => l.startsWith("- **Union:** "))
      .map((l) => l.slice("- **Union:** ".length).trim());

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
      // relationship strings (not inserted into people table)
      _parentsRaw: parentsRaw,
      _childrenRaw: childrenRaw,
      _unionLines: unionLines,
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

  // Separate DB fields from raw relationship strings
  const peopleRows = records.map(({ _parentsRaw: _p, _childrenRaw: _c, _unionLines: _u, ...rest }) => rest);

  console.log("Clearing existing relationships and people...");
  await db.delete(unions);
  await db.delete(parentChild);
  await db.delete(people);

  console.log("Inserting people...");
  const batchSize = 50;
  for (let i = 0; i < peopleRows.length; i += batchSize) {
    const batch = peopleRows.slice(i, i + batchSize);
    await db.insert(people).values(batch);
    console.log(`  Inserted ${Math.min(i + batchSize, peopleRows.length)}/${peopleRows.length}`);
  }

  // Build lookup maps for relationship seeding
  const allPeople = await db.select().from(people);
  const byGenealogyId = new Map<string, Person>();
  const byName = new Map<string, Person[]>();
  for (const p of allPeople) {
    if (p.genealogicalId) byGenealogyId.set(p.genealogicalId, p);
    if (p.name) {
      const bucket = byName.get(p.name) ?? [];
      bucket.push(p);
      byName.set(p.name, bucket);
    }
  }

  console.log("\nSeeding relationships...");
  const pcSet = new Set<string>(); // dedup: "parentId:childId"
  const unionSet = new Set<string>(); // dedup: sorted "idA:idB"
  const pcRows: { parentId: string; childId: string }[] = [];
  const unionRows: { personAId: string; personBId: string; date: string | null }[] = [];

  for (const record of records) {
    const currentPerson = record.name ? (byName.get(record.name)?.[0] ?? null) : null;
    if (!currentPerson) continue;
    const gen = record.generation ?? null;

    // --- Parents field ---
    if (record._parentsRaw) {
      const parts = record._parentsRaw.split(" and ").map((s) => s.trim()).filter(Boolean);
      for (const rawParent of parts) {
        const parent = resolveName(rawParent, byGenealogyId, byName, "parent", gen);
        if (parent) {
          const key = `${parent.id}:${currentPerson.id}`;
          if (!pcSet.has(key)) {
            pcSet.add(key);
            pcRows.push({ parentId: parent.id, childId: currentPerson.id });
          }
        }
      }
    }

    // --- Children field ---
    if (record._childrenRaw) {
      const parts = record._childrenRaw.split(", ").map((s) => s.trim()).filter(Boolean);
      for (const rawChild of parts) {
        const child = resolveName(rawChild, byGenealogyId, byName, "child", gen);
        if (child) {
          const key = `${currentPerson.id}:${child.id}`;
          if (!pcSet.has(key)) {
            pcSet.add(key);
            pcRows.push({ parentId: currentPerson.id, childId: child.id });
          }
        }
      }
    }

    // --- Union lines ---
    for (const line of record._unionLines) {
      const { nameA, nameB, date } = parseUnionLine(line);
      const personA = resolveName(nameA, byGenealogyId, byName, "union-partner", gen, currentPerson.id);
      const personB = resolveName(nameB, byGenealogyId, byName, "union-partner", gen, currentPerson.id);
      if (personA && personB) {
        const key = [personA.id, personB.id].sort().join(":");
        if (!unionSet.has(key)) {
          unionSet.add(key);
          unionRows.push({ personAId: personA.id, personBId: personB.id, date });
        }
      }
    }
  }

  // Insert parent_child rows
  console.log(`Inserting ${pcRows.length} parent_child rows...`);
  for (let i = 0; i < pcRows.length; i += batchSize) {
    await db.insert(parentChild).values(pcRows.slice(i, i + batchSize));
  }

  // Insert union rows
  console.log(`Inserting ${unionRows.length} union rows...`);
  for (let i = 0; i < unionRows.length; i += batchSize) {
    await db.insert(unions).values(unionRows.slice(i, i + batchSize));
  }

  console.log("\nDone.");

  // Verification: count by generation
  const bygen: Record<string, number> = {};
  for (const p of allPeople) {
    const g = p.generation ?? "(married-in)";
    bygen[g] = (bygen[g] ?? 0) + 1;
  }
  console.log("\nCount by generation:");
  const order = ["Founders", "1st Generation", "2nd Generation", "3rd Generation", "4th Generation", "5th Generation", "6th Generation", "(married-in)"];
  for (const g of order) {
    if (bygen[g]) console.log(`  ${g}: ${bygen[g]}`);
  }
  for (const [g, n] of Object.entries(bygen)) {
    if (!order.includes(g)) console.log(`  [unexpected] ${g}: ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

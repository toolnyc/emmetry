import { db } from "@/db";
import { people } from "@/db/schema";
import type { Person } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import {
  AlphabeticalView,
  type AlphaGroup,
} from "../components/AlphabeticalView";
import type { PersonLite } from "../components/GenerationalView";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function toLite(p: Person): PersonLite {
  return {
    id: p.id,
    name: p.name,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    photoUrl: p.photoUrl,
  };
}

export default async function AlphabeticalPage() {
  const named = await db.select().from(people).where(isNotNull(people.name));

  const byLetter = new Map<string, Person[]>();
  for (const p of named) {
    if (!p.name) continue;
    const initial = p.name.trim().charAt(0).toUpperCase();
    const key = LETTERS.includes(initial) ? initial : "#";
    if (!byLetter.has(key)) byLetter.set(key, []);
    byLetter.get(key)!.push(p);
  }

  for (const list of byLetter.values()) {
    list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  const keys = [...LETTERS, ...(byLetter.has("#") ? ["#"] : [])];
  const groups: AlphaGroup[] = keys.map((letter) => ({
    letter,
    members: (byLetter.get(letter) ?? []).map(toLite),
  }));

  return (
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      <AlphabeticalView groups={groups} />
    </main>
  );
}

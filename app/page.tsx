import { db } from "@/db";
import { people, parentChild, unions } from "@/db/schema";
import type { Person } from "@/db/schema";
import {
  GenerationalView,
  type GenerationGroup,
  type CoupleUnit,
  type PersonLite,
} from "./components/GenerationalView";

const GENERATION_ORDER = [
  "Founders",
  "1st Generation",
  "2nd Generation",
  "3rd Generation",
  "4th Generation",
  "5th Generation",
  "6th Generation",
] as const;

function toLite(p: Person): PersonLite {
  return {
    id: p.id,
    name: p.name,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    photoUrl: p.photoUrl,
  };
}

function birthYear(date: string | null): number | null {
  if (!date) return null;
  const m = date.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

async function buildGroups(): Promise<GenerationGroup[]> {
  const [allPeople, allLinks, allUnions] = await Promise.all([
    db.select().from(people),
    db.select().from(parentChild),
    db.select().from(unions),
  ]);

  const byId = new Map(allPeople.map((p) => [p.id, p]));

  const childrenByParent = new Map<string, string[]>();
  for (const link of allLinks) {
    if (!childrenByParent.has(link.parentId))
      childrenByParent.set(link.parentId, []);
    childrenByParent.get(link.parentId)!.push(link.childId);
  }

  const partnersByPerson = new Map<string, string[]>();
  for (const u of allUnions) {
    if (!partnersByPerson.has(u.personAId))
      partnersByPerson.set(u.personAId, []);
    partnersByPerson.get(u.personAId)!.push(u.personBId);
    if (!partnersByPerson.has(u.personBId))
      partnersByPerson.set(u.personBId, []);
    partnersByPerson.get(u.personBId)!.push(u.personAId);
  }

  const groups: GenerationGroup[] = [];

  for (const generation of GENERATION_ORDER) {
    const descendants = allPeople
      .filter((p) => p.generation === generation)
      .sort((a, b) =>
        (a.genealogicalId ?? "").localeCompare(b.genealogicalId ?? "", undefined, {
          numeric: true,
        })
      );
    if (descendants.length === 0) continue;

    const years = descendants
      .map((p) => birthYear(p.birthDate))
      .filter((y): y is number => y != null);
    const year = years.length ? Math.min(...years) : null;

    const renderedAsPartner = new Set<string>();
    const couples: CoupleUnit[] = [];

    for (const descendant of descendants) {
      if (renderedAsPartner.has(descendant.id)) continue;

      const childIds = childrenByParent.get(descendant.id) ?? [];
      const children = childIds
        .map((id) => byId.get(id))
        .filter((p): p is Person => p !== undefined)
        .map(toLite);

      const partnerIds = partnersByPerson.get(descendant.id) ?? [];
      const partners = partnerIds
        .map((id) => byId.get(id))
        .filter((p): p is Person => p !== undefined);

      if (partners.length === 0) {
        couples.push({ descendant: toLite(descendant), partner: null, children });
        continue;
      }

      partners.forEach((partner, i) => {
        renderedAsPartner.add(partner.id);
        couples.push({
          descendant: toLite(descendant),
          partner: toLite(partner),
          children: i === 0 ? children : [],
        });
      });
    }

    groups.push({ generation, year, couples });
  }

  return groups;
}

export default async function HomePage() {
  const groups = await buildGroups();

  return (
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      <GenerationalView groups={groups} />
    </main>
  );
}

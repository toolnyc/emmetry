import Link from "next/link";
import { db } from "@/db";
import { people, parentChild, unions } from "@/db/schema";
import type { Person } from "@/db/schema";
import { formatIsoDate } from "@/lib/dates";

export const dynamicParams = false;

export async function generateStaticParams() {
  const rows = await db.select({ id: people.id }).from(people);
  return rows.map((r) => ({ id: r.id }));
}

async function loadGraph() {
  const [allPeople, allLinks, allUnions] = await Promise.all([
    db.select().from(people),
    db.select().from(parentChild),
    db.select().from(unions),
  ]);
  return { allPeople, allLinks, allUnions };
}

function computeNeighborhood(
  id: string,
  allPeople: Person[],
  allLinks: { parentId: string; childId: string }[],
  allUnions: { personAId: string; personBId: string; date: string | null; place: string | null }[]
) {
  const byId = new Map(allPeople.map((p) => [p.id, p]));

  const parentsByChild = new Map<string, string[]>();
  const childrenByParent = new Map<string, string[]>();
  for (const link of allLinks) {
    if (!parentsByChild.has(link.childId)) parentsByChild.set(link.childId, []);
    parentsByChild.get(link.childId)!.push(link.parentId);
    if (!childrenByParent.has(link.parentId)) childrenByParent.set(link.parentId, []);
    childrenByParent.get(link.parentId)!.push(link.childId);
  }

  const resolve = (ids: string[]) =>
    ids.map((i) => byId.get(i)).filter((p): p is Person => p !== undefined);

  const parentIds = parentsByChild.get(id) ?? [];
  const parents = resolve(parentIds);

  const grandparentIds = [
    ...new Set(parents.flatMap((p) => parentsByChild.get(p.id) ?? [])),
  ];
  const grandparents = resolve(grandparentIds);

  const childIds = childrenByParent.get(id) ?? [];
  const children = resolve(childIds);

  const grandchildIds = [
    ...new Set(children.flatMap((c) => childrenByParent.get(c.id) ?? [])),
  ];
  const grandchildren = resolve(grandchildIds);

  const personUnions = allUnions
    .filter((u) => u.personAId === id || u.personBId === id)
    .map((u) => {
      const partnerId = u.personAId === id ? u.personBId : u.personAId;
      const partner = byId.get(partnerId);
      if (!partner) return null;
      return { partner, date: u.date, place: u.place };
    })
    .filter((u): u is { partner: Person; date: string | null; place: string | null } => u !== null);

  return { parents, grandparents, personUnions, children, grandchildren };
}

function LineageSection({ title, members }: { title: string; members: Person[] }) {
  return (
    <div>
      <h3
        className="font-mono uppercase text-ghost-strong mb-3"
        style={{
          fontSize: "var(--text-label)",
          letterSpacing: "var(--tracking-nav)",
        }}
      >
        {title}
      </h3>
      <div className="border-t border-rule mb-3" />
      {members.length === 0 ? (
        <span className="font-mono text-ghost-mid" style={{ fontSize: "var(--text-label)" }}>
          —
        </span>
      ) : (
        <ul className="space-y-2">
          {members.map((p) => (
            <li key={p.id} className="flex items-baseline gap-3">
              <Link
                href={`/people/${p.id}`}
                className="font-sans text-ink"
                style={{ fontSize: "var(--text-body)" }}
              >
                {p.name ?? "UNKNOWN"}
              </Link>
              {(p.birthDate || p.deathDate) && (
                <span
                  className="font-mono text-ghost-strong flex-shrink-0"
                  style={{ fontSize: "var(--text-date)" }}
                >
                  {[formatIsoDate(p.birthDate), formatIsoDate(p.deathDate)].filter(Boolean).join(" – ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UnionsSection({
  personUnions,
}: {
  personUnions: { partner: Person; date: string | null; place: string | null }[];
}) {
  return (
    <div>
      <h3
        className="font-mono uppercase text-ghost-strong mb-3"
        style={{
          fontSize: "var(--text-label)",
          letterSpacing: "var(--tracking-nav)",
        }}
      >
        Unions
      </h3>
      <div className="border-t border-rule mb-3" />
      {personUnions.length === 0 ? (
        <span className="font-mono text-ghost-mid" style={{ fontSize: "var(--text-label)" }}>
          —
        </span>
      ) : (
        <ul className="space-y-3">
          {personUnions.map(({ partner, date }, i) => (
            <li key={i} className="flex items-start gap-2">
              <span
                className="mt-[0.4em] w-1.5 h-1.5 rounded-full bg-union flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <Link
                  href={`/people/${partner.id}`}
                  className="font-sans text-ink"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {partner.name ?? "UNKNOWN"}
                </Link>
                {date && (
                  <div
                    className="font-mono text-ghost-strong"
                    style={{ fontSize: "var(--text-date)" }}
                  >
                    {formatIsoDate(date)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { allPeople, allLinks, allUnions } = await loadGraph();

  const person = allPeople.find((p) => p.id === id);
  if (!person) return <div>Person not found.</div>;

  const { parents, grandparents, personUnions, children, grandchildren } =
    computeNeighborhood(id, allPeople, allLinks, allUnions);

  return (
    <main className="min-h-screen bg-paper px-8 py-16 md:px-16">
      {/* Back link */}
      <Link
        href="/"
        className="font-mono uppercase text-ghost-strong block mb-12"
        style={{
          fontSize: "var(--text-nav)",
          letterSpacing: "var(--tracking-nav)",
        }}
      >
        ← All Generations
      </Link>

      {/* Ghost generation header */}
      <h1
        className="font-sans font-[400] text-ghost-strong leading-[0.95] mb-6"
        style={{ fontSize: "var(--text-display)" }}
      >
        {person.generation ?? "Married-in"}
      </h1>

      <div className="border-t border-rule mb-8" />

      {/* Name + life dates */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mb-12">
        <span
          className="font-sans text-ink"
          style={{ fontSize: "var(--text-name)" }}
        >
          {person.name ?? "UNKNOWN"}
        </span>
        {(person.birthDate || person.deathDate) && (
          <span
            className="font-mono text-ghost-strong flex flex-col"
            style={{
              fontSize: "var(--text-date)",
              lineHeight: "var(--text-date--line-height)",
            }}
          >
            {person.birthDate && <span>{formatIsoDate(person.birthDate)}</span>}
            {person.deathDate && <span>{formatIsoDate(person.deathDate)}</span>}
          </span>
        )}
      </div>

      {/* Two-column: bio left, lineage right */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-16">
        {/* Bio */}
        <div>
          {person.bio ? (
            <p
              className="font-sans text-ink"
              style={{
                fontSize: "var(--text-body)",
                lineHeight: "var(--text-body--line-height)",
              }}
            >
              {person.bio}
            </p>
          ) : (
            <p
              className="font-mono text-ghost-mid"
              style={{ fontSize: "var(--text-label)" }}
            >
              No biography recorded.
            </p>
          )}
        </div>

        {/* Lineage neighborhood */}
        <div className="mt-12 md:mt-0 space-y-8">
          <LineageSection title="Grandparents" members={grandparents} />
          <LineageSection title="Parents" members={parents} />
          <UnionsSection personUnions={personUnions} />
          <LineageSection title="Children" members={children} />
          <LineageSection title="Grandchildren" members={grandchildren} />
        </div>
      </div>
    </main>
  );
}

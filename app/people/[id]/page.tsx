import Link from "next/link";
import { db } from "@/db";
import { people, parentChild, unions } from "@/db/schema";
import type { Person } from "@/db/schema";
import { formatIsoDate } from "@/lib/dates";
import { displayName } from "@/lib/names";
import { LineageColumn } from "@/app/components/LineageColumn";
import { BackButton } from "@/app/components/BackButton";
import type { PersonLite } from "@/app/components/GenerationalView";

export const dynamicParams = false;

export async function generateStaticParams() {
  const rows = await db.select({ id: people.id }).from(people);
  return rows.map((r) => ({ id: r.id }));
}

function toLite(p: Person): PersonLite {
  return {
    id: p.id,
    name: p.name,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    photoUrl: p.photoUrl,
  };
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
  allUnions: {
    personAId: string;
    personBId: string;
    date: string | null;
    place: string | null;
  }[]
) {
  const byId = new Map(allPeople.map((p) => [p.id, p]));

  const parentsByChild = new Map<string, string[]>();
  const childrenByParent = new Map<string, string[]>();
  for (const link of allLinks) {
    if (!parentsByChild.has(link.childId)) parentsByChild.set(link.childId, []);
    parentsByChild.get(link.childId)!.push(link.parentId);
    if (!childrenByParent.has(link.parentId))
      childrenByParent.set(link.parentId, []);
    childrenByParent.get(link.parentId)!.push(link.childId);
  }

  const resolve = (ids: string[]) =>
    ids.map((i) => byId.get(i)).filter((p): p is Person => p !== undefined);

  const parents = resolve(parentsByChild.get(id) ?? []);
  const grandparents = resolve([
    ...new Set(parents.flatMap((p) => parentsByChild.get(p.id) ?? [])),
  ]);
  const children = resolve(childrenByParent.get(id) ?? []);
  const grandchildren = resolve([
    ...new Set(children.flatMap((c) => childrenByParent.get(c.id) ?? [])),
  ]);

  const personUnions = allUnions
    .filter((u) => u.personAId === id || u.personBId === id)
    .map((u) => {
      const partnerId = u.personAId === id ? u.personBId : u.personAId;
      const partner = byId.get(partnerId);
      if (!partner) return null;
      return { partner, date: u.date, place: u.place };
    })
    .filter(
      (u): u is { partner: Person; date: string | null; place: string | null } =>
        u !== null
    );

  return { parents, grandparents, personUnions, children, grandchildren };
}

function FieldRow({
  label,
  value,
  marker,
}: {
  label: string;
  value: React.ReactNode;
  marker?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-rule py-2">
      <span
        className="font-sans text-ink"
        style={{ fontSize: "var(--text-body)" }}
      >
        {label}
      </span>
      <span className="flex items-center gap-2 text-right">
        {marker && (
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-union"
            aria-hidden="true"
          />
        )}
        {value}
      </span>
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
  if (!person) return <div className="px-8 py-12">Person not found.</div>;

  const { parents, grandparents, personUnions, children, grandchildren } =
    computeNeighborhood(id, allPeople, allLinks, allUnions);

  const birth = [formatIsoDate(person.birthDate), person.birthPlace]
    .filter(Boolean)
    .join(", ");
  const death = [formatIsoDate(person.deathDate), person.deathPlace]
    .filter(Boolean)
    .join(", ");

  const monoValue = "font-mono uppercase text-ink";
  const monoStyle = { fontSize: "var(--text-label)" } as React.CSSProperties;

  return (
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      {/* Top nav: Back and Home */}
      <div className="mb-8 flex items-center gap-6">
        <BackButton />
        <Link
          href="/"
          className="font-mono uppercase text-ghost-mid transition-colors duration-200 hover:text-ghost-strong"
          style={{
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-nav)",
            transitionTimingFunction: "var(--ease-standard)",
          }}
        >
          Home
        </Link>
      </div>

      {/* Ghosted name */}
      <h1
        className="font-sans font-[400] leading-[0.95] text-ghost-strong"
        style={{
          fontSize: "var(--text-display)",
          letterSpacing: "var(--tracking-display)",
        }}
      >
        {displayName(person.name)}
      </h1>

      <div className="mt-10 md:grid md:grid-cols-[3fr_2fr] md:gap-12">
        {/* Left: portrait, fields, bio, navigation */}
        <div className="md:border-r md:border-rule md:pr-12">
          {person.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.photoUrl}
              alt={person.name ?? "Portrait"}
              className="mb-8 w-full max-w-[240px] border border-rule"
            />
          )}

          <dl className="mb-10">
            {birth && (
              <FieldRow
                label="Birth"
                value={
                  <span className={monoValue} style={monoStyle}>
                    {birth}
                  </span>
                }
              />
            )}
            {death && (
              <FieldRow
                label="Death"
                value={
                  <span className={monoValue} style={monoStyle}>
                    {death}
                  </span>
                }
              />
            )}
            {personUnions.map((u, i) => (
              <FieldRow
                key={i}
                label="Union"
                marker
                value={
                  <span className="flex flex-col items-end">
                    <Link
                      href={`/people/${u.partner.id}`}
                      className="font-mono uppercase text-ink"
                      style={monoStyle}
                    >
                      {displayName(u.partner.name)}
                    </Link>
                    {(u.date || u.place) && (
                      <span
                        className="font-mono uppercase text-ghost-strong"
                        style={{ fontSize: "var(--text-date)" }}
                      >
                        {[formatIsoDate(u.date), u.place].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </span>
                }
              />
            ))}
          </dl>

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

        {/* Right: relationship accordion */}
        <div className="mt-12 md:mt-0">
          <LineageColumn
            sections={[
              { title: "Grandparents", members: grandparents.map(toLite) },
              { title: "Parents", members: parents.map(toLite) },
              { title: "Children", members: children.map(toLite) },
              { title: "Grandchildren", members: grandchildren.map(toLite) },
            ]}
          />
        </div>
      </div>
    </main>
  );
}

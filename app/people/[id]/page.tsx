import Link from "next/link";
import { db } from "@/db";
import { people, parentChild, unions, places } from "@/db/schema";
import type { Person } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatIsoDate } from "@/lib/dates";
import { displayName, resolveDisplayName } from "@/lib/names";
import { LineageColumn } from "@/app/components/LineageColumn";
import { BackButton } from "@/app/components/BackButton";
import { PageReveal } from "@/app/components/PageReveal";
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
    preferredName: p.preferredName,
    birthDate: p.birthDate,
    deathDate: p.deathDate,
    photoUrl: p.photoUrl,
  };
}

async function loadGraph() {
  const [allPeople, allLinks, allUnions, allPlaces] = await Promise.all([
    db.select().from(people),
    db.select().from(parentChild),
    db.select().from(unions),
    db.select().from(places),
  ]);
  const placesById = new Map(allPlaces.map((p) => [p.id, p]));
  return { allPeople, allLinks, allUnions, placesById };
}

function computeNeighborhood(
  id: string,
  allPeople: Person[],
  allLinks: { parentId: string; childId: string }[],
  allUnions: {
    personAId: string;
    personBId: string;
    date: string | null;
    placeId: string | null;
  }[],
  placesById: Map<string, { id: string; name: string; lat: number | null; lng: number | null }>
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
      const place = u.placeId ? (placesById.get(u.placeId) ?? null) : null;
      return { partner, date: u.date, place };
    })
    .filter(
      (u): u is { partner: Person; date: string | null; place: { id: string; name: string; lat: number | null; lng: number | null } | null } =>
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
        className={`font-sans ${marker ? "text-union" : "text-ink"}`}
        style={{ fontSize: "var(--text-body)" }}
      >
        {label}
      </span>
      <span className="flex items-center gap-2 text-right">
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
  const { allPeople, allLinks, allUnions, placesById } = await loadGraph();

  const person = allPeople.find((p) => p.id === id);
  if (!person) return <div className="px-8 py-12">Person not found.</div>;

  const { parents, grandparents, personUnions, children, grandchildren } =
    computeNeighborhood(id, allPeople, allLinks, allUnions, placesById);

  const birthPlace = person.birthPlaceId ? placesById.get(person.birthPlaceId) ?? null : null;
  const deathPlace = person.deathPlaceId ? placesById.get(person.deathPlaceId) ?? null : null;

  const birth = [formatIsoDate(person.birthDate), birthPlace?.name]
    .filter(Boolean)
    .join(", ");
  const death = [formatIsoDate(person.deathDate), deathPlace?.name]
    .filter(Boolean)
    .join(", ");

  const monoValue = "font-mono uppercase text-ink";
  const monoStyle = { fontSize: "var(--text-label)" } as React.CSSProperties;

  return (
    <PageReveal>
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      {/* Top nav: Back and Home */}
      <div data-reveal className="mb-8 flex items-center gap-6">
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
        data-reveal
        className="font-sans font-[400] leading-[0.95] text-ghost-strong"
        style={{
          fontSize: "var(--text-display)",
          letterSpacing: "var(--tracking-display)",
        }}
      >
        {resolveDisplayName(person.name, person.preferredName)}
      </h1>

      <div className="mt-10 md:grid md:grid-cols-[3fr_2fr] md:gap-12">
        {/* Left: portrait, fields, bio, navigation */}
        <div data-reveal className="md:border-r md:border-rule md:pr-12">
          {person.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.photoUrl}
              alt={person.name ?? "Portrait"}
              className="mb-8 w-full max-w-[240px] border border-rule"
            />
          )}

          <dl className="mb-10">
            {person.preferredName && (
              <FieldRow
                label="Formal name"
                value={
                  <span className={monoValue} style={monoStyle}>
                    {displayName(person.name)}
                  </span>
                }
              />
            )}
            {birth && (
              <FieldRow
                label="Birth"
                value={
                  <span className={monoValue} style={monoStyle}>
                    {formatIsoDate(person.birthDate)}
                    {formatIsoDate(person.birthDate) && birthPlace ? ", " : ""}
                    {birthPlace && (
                      birthPlace.lat != null ? (
                        <Link
                          href={`/geographical?place=${birthPlace.id}`}
                          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                          {birthPlace.name}
                        </Link>
                      ) : (
                        birthPlace.name
                      )
                    )}
                  </span>
                }
              />
            )}
            {death && (
              <FieldRow
                label="Death"
                value={
                  <span className={monoValue} style={monoStyle}>
                    {formatIsoDate(person.deathDate)}
                    {formatIsoDate(person.deathDate) && deathPlace ? ", " : ""}
                    {deathPlace && (
                      deathPlace.lat != null ? (
                        <Link
                          href={`/geographical?place=${deathPlace.id}`}
                          className="underline underline-offset-2 hover:opacity-70 transition-opacity"
                        >
                          {deathPlace.name}
                        </Link>
                      ) : (
                        deathPlace.name
                      )
                    )}
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
                      {resolveDisplayName(u.partner.name, u.partner.preferredName)}
                    </Link>
                    {(u.date || u.place) && (
                      <span
                        className="font-mono uppercase text-ghost-strong"
                        style={{ fontSize: "var(--text-date)" }}
                      >
                        {formatIsoDate(u.date)}
                        {formatIsoDate(u.date) && u.place ? ", " : ""}
                        {u.place?.name}
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
        <div data-reveal className="mt-12 md:mt-0">
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
    </PageReveal>
  );
}

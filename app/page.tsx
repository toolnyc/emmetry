import Link from "next/link";
import { db } from "@/db";
import { people } from "@/db/schema";
import { isNotNull } from "drizzle-orm";

const GENERATION_ORDER = [
  "Founders",
  "1st Generation",
  "2nd Generation",
  "3rd Generation",
  "4th Generation",
  "5th Generation",
  "6th Generation",
] as const;

type Generation = (typeof GENERATION_ORDER)[number];

async function getDescendantsByGeneration() {
  const descendants = await db
    .select()
    .from(people)
    .where(isNotNull(people.generation));

  const grouped: Record<Generation, typeof descendants> = {
    Founders: [],
    "1st Generation": [],
    "2nd Generation": [],
    "3rd Generation": [],
    "4th Generation": [],
    "5th Generation": [],
    "6th Generation": [],
  };

  for (const person of descendants) {
    const gen = person.generation as Generation;
    if (gen in grouped) grouped[gen].push(person);
  }

  for (const gen of GENERATION_ORDER) {
    grouped[gen].sort((a, b) => {
      const aId = a.genealogicalId ?? "";
      const bId = b.genealogicalId ?? "";
      return aId.localeCompare(bId, undefined, { numeric: true });
    });
  }

  return grouped;
}

export default async function HomePage() {
  const grouped = await getDescendantsByGeneration();

  return (
    <main className="min-h-screen bg-paper px-8 py-16 md:px-16">
      {/* Header */}
      <header className="mb-16">
        <div
          className="font-sans font-[800] text-ink tracking-[-0.02em]"
          style={{ fontSize: "var(--text-wordmark)" }}
        >
          Emmetry
        </div>
        <div
          className="font-mono uppercase text-ink mt-2"
          style={{
            fontSize: "var(--text-tagline)",
            letterSpacing: "var(--tracking-tagline)",
          }}
        >
          An Emmet Family Record
        </div>
      </header>

      {/* Generational sections */}
      <div className="space-y-12">
        {GENERATION_ORDER.map((gen) => {
          const members = grouped[gen];
          if (!members.length) return null;

          return (
            <section key={gen}>
              {/* Ghost header */}
              <h2
                className="font-sans font-[400] text-ghost-strong mb-6 leading-[0.95]"
                style={{ fontSize: "var(--text-display)" }}
              >
                {gen}
              </h2>

              {/* Divider */}
              <div className="border-t border-rule mb-6" />

              {/* Person list */}
              <ul className="space-y-4">
                {members.map((person) => (
                  <li key={person.id} className="flex items-baseline gap-6">
                    {/* Name */}
                    <Link
                      href={`/people/${person.id}`}
                      className="font-sans text-ink"
                      style={{ fontSize: "var(--text-name)" }}
                    >
                      {person.name ?? "UNKNOWN"}
                    </Link>

                    {/* Life dates */}
                    {(person.birthDate || person.deathDate) && (
                      <span
                        className="font-mono text-ghost-strong flex flex-col"
                        style={{
                          fontSize: "var(--text-date)",
                          lineHeight: "var(--text-date--line-height)",
                        }}
                      >
                        {person.birthDate && (
                          <span>{person.birthDate}</span>
                        )}
                        {person.deathDate && (
                          <span>{person.deathDate}</span>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}

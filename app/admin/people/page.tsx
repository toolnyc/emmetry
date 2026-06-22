import Link from "next/link";
import { db } from "@/db";
import { people } from "@/db/schema";
import { ilike, or, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const rows = await db
    .select({
      id: people.id,
      name: people.name,
      generation: people.generation,
      genealogicalId: people.genealogicalId,
    })
    .from(people)
    .where(
      query
        ? ilike(people.name, `%${query}%`)
        : undefined
    )
    .orderBy(people.name);

  return (
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1
            className="font-sans text-ink"
            style={{ fontSize: "var(--text-name)" }}
          >
            Admin — People
          </h1>
          <Link
            href="/admin/people/new"
            className="font-mono uppercase text-ink border border-rule px-4 py-2"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
          >
            + Add person
          </Link>
        </div>

        {/* Search */}
        <form method="get" className="mb-8">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name…"
            className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink"
            style={{ fontSize: "var(--text-body)" }}
          />
        </form>

        {/* Results */}
        <div className="border-t border-rule">
          {rows.length === 0 ? (
            <p
              className="font-mono text-ghost-mid py-6"
              style={{ fontSize: "var(--text-label)" }}
            >
              No people found.
            </p>
          ) : (
            rows.map((person) => (
              <Link
                key={person.id}
                href={`/admin/people/${person.id}/edit`}
                className="flex items-baseline justify-between py-3 border-b border-rule hover:bg-ghost-faint transition-colors"
              >
                <span
                  className="font-sans text-ink"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {person.name ?? <span className="text-ghost-strong italic">UNKNOWN</span>}
                </span>
                <span
                  className="font-mono text-ghost-strong ml-4 flex-shrink-0"
                  style={{ fontSize: "var(--text-label)" }}
                >
                  {person.generation ?? "Married-in"}
                  {person.genealogicalId ? ` · #${person.genealogicalId}` : ""}
                </span>
              </Link>
            ))
          )}
        </div>

        {query && (
          <p
            className="font-mono text-ghost-strong mt-4"
            style={{ fontSize: "var(--text-label)" }}
          >
            {rows.length} result{rows.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </main>
  );
}

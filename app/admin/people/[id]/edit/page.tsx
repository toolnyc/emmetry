import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { people } from "@/db/schema";
import { eq } from "drizzle-orm";
import { splitIsoParts } from "@/lib/dates";
import { PersonForm } from "../../PersonForm";
import { updatePerson } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [person] = await db.select().from(people).where(eq(people.id, id));
  if (!person) notFound();

  const birth = splitIsoParts(person.birthDate);
  const death = splitIsoParts(person.deathDate);

  const action = updatePerson.bind(null, id);

  return (
    <main className="min-h-screen bg-paper px-8 py-12 md:px-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/people"
          className="font-mono uppercase text-ghost-strong block mb-8"
          style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-nav)" }}
        >
          ← People
        </Link>

        <h1
          className="font-sans text-ink mb-8"
          style={{ fontSize: "var(--text-name)" }}
        >
          {person.name ?? "UNKNOWN"}
        </h1>

        <div className="border-t border-rule mb-8" />

        <PersonForm
          action={action}
          defaultValues={{
            name: person.name,
            genealogicalId: person.genealogicalId,
            generation: person.generation,
            birthYear: birth.year,
            birthMonth: birth.month,
            birthDay: birth.day,
            birthPlace: person.birthPlace,
            deathYear: death.year,
            deathMonth: death.month,
            deathDay: death.day,
            deathPlace: person.deathPlace,
            bio: person.bio,
            photoUrl: person.photoUrl,
          }}
        />
      </div>
    </main>
  );
}

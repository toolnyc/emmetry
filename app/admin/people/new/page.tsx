import Link from "next/link";
import { PersonForm } from "../PersonForm";
import { createPerson } from "../actions";

export default function NewPersonPage() {
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
          New person
        </h1>

        <div className="border-t border-rule mb-8" />

        <PersonForm action={createPerson} submitLabel="Create" />
      </div>
    </main>
  );
}

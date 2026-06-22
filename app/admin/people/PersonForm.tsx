"use client";

import { useActionState } from "react";
import { DateFields } from "./DateFields";

const GENERATIONS = [
  "Founders",
  "1st Generation",
  "2nd Generation",
  "3rd Generation",
  "4th Generation",
  "5th Generation",
  "6th Generation",
];

type ActionResult = { error: string } | { success: true } | null;

interface PersonFormProps {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  defaultValues?: {
    name?: string | null;
    genealogicalId?: string | null;
    generation?: string | null;
    birthYear?: string;
    birthMonth?: string;
    birthDay?: string;
    birthPlace?: string | null;
    deathYear?: string;
    deathMonth?: string;
    deathDay?: string;
    deathPlace?: string | null;
    bio?: string | null;
  };
  submitLabel?: string;
}

export function PersonForm({ action, defaultValues = {}, submitLabel = "Save" }: PersonFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state && "error" in state && (
        <div
          className="border border-union text-union px-4 py-3 font-mono"
          style={{ fontSize: "var(--text-label)" }}
        >
          {state.error}
        </div>
      )}
      {state && "success" in state && (
        <div
          className="border border-rule text-ghost-strong px-4 py-3 font-mono"
          style={{ fontSize: "var(--text-label)" }}
        >
          Saved.
        </div>
      )}

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          defaultValue={defaultValues.name ?? ""}
          placeholder="Leave blank to save as UNKNOWN"
          className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        />
      </div>

      {/* Genealogical ID */}
      <div>
        <label
          htmlFor="genealogicalId"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Genealogical ID
        </label>
        <input
          id="genealogicalId"
          type="text"
          name="genealogicalId"
          defaultValue={defaultValues.genealogicalId ?? ""}
          placeholder="e.g. 12 or 40A"
          className="w-40 border border-rule bg-paper font-mono text-ink px-4 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        />
      </div>

      {/* Generation */}
      <div>
        <label
          htmlFor="generation"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Generation
        </label>
        <select
          id="generation"
          name="generation"
          defaultValue={defaultValues.generation ?? ""}
          className="border border-rule bg-paper font-mono text-ink px-4 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        >
          <option value="">Married-in (no generation)</option>
          {GENERATIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Born */}
      <DateFields
        label="Born"
        yearName="birthYear"
        monthName="birthMonth"
        dayName="birthDay"
        year={defaultValues.birthYear}
        month={defaultValues.birthMonth}
        day={defaultValues.birthDay}
      />

      {/* Born place */}
      <div>
        <label
          htmlFor="birthPlace"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Born place
        </label>
        <input
          id="birthPlace"
          type="text"
          name="birthPlace"
          defaultValue={defaultValues.birthPlace ?? ""}
          className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        />
      </div>

      {/* Died */}
      <DateFields
        label="Died"
        yearName="deathYear"
        monthName="deathMonth"
        dayName="deathDay"
        year={defaultValues.deathYear}
        month={defaultValues.deathMonth}
        day={defaultValues.deathDay}
      />

      {/* Died place */}
      <div>
        <label
          htmlFor="deathPlace"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Died place
        </label>
        <input
          id="deathPlace"
          type="text"
          name="deathPlace"
          defaultValue={defaultValues.deathPlace ?? ""}
          className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink"
          style={{ fontSize: "var(--text-body)" }}
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={defaultValues.bio ?? ""}
          rows={8}
          className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink resize-y"
          style={{ fontSize: "var(--text-body)", lineHeight: "var(--text-body--line-height)" }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="font-mono uppercase text-ink border border-ink px-6 py-2 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

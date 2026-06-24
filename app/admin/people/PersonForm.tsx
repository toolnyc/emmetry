"use client";

import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { DateFields } from "./DateFields";
import { PlacePicker } from "./PlacePicker";

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
    preferredName?: string | null;
    genealogicalId?: string | null;
    generation?: string | null;
    birthYear?: string;
    birthMonth?: string;
    birthDay?: string;
    birthPlace?: { id: string; name: string } | null;
    deathYear?: string;
    deathMonth?: string;
    deathDay?: string;
    deathPlace?: { id: string; name: string } | null;
    bio?: string | null;
    photoUrl?: string | null;
  };
  submitLabel?: string;
}

export function PersonForm({ action, defaultValues = {}, submitLabel = "Save" }: PersonFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(defaultValues.photoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      setPhotoUrl(blob.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

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

      {/* Preferred name */}
      <div>
        <label
          htmlFor="preferredName"
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Preferred name
        </label>
        <input
          id="preferredName"
          type="text"
          name="preferredName"
          defaultValue={defaultValues.preferredName ?? ""}
          placeholder="e.g. Jeannette Erin Emmet — shown on list pages"
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
      <PlacePicker
        label="Born place"
        inputName="birthPlaceId"
        defaultValue={defaultValues.birthPlace ?? null}
      />

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
      <PlacePicker
        label="Died place"
        inputName="deathPlaceId"
        defaultValue={defaultValues.deathPlace ?? null}
      />

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

      {/* Photo */}
      <div>
        <label
          className="block font-mono uppercase text-ghost-strong mb-2"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          Photo
        </label>
        {photoUrl && (
          <div className="mb-3 flex items-start gap-4">
            <img
              src={photoUrl}
              alt="Portrait"
              className="max-w-[160px] border border-rule"
            />
            <button
              type="button"
              onClick={() => {
                setPhotoUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="font-mono uppercase text-union border border-union px-3 py-1 hover:bg-union hover:text-paper transition-colors"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
            >
              Remove
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="block font-mono text-ghost-strong disabled:opacity-50"
          style={{ fontSize: "var(--text-label)" }}
        />
        {uploading && (
          <p className="mt-2 font-mono text-ghost-strong" style={{ fontSize: "var(--text-label)" }}>
            Uploading…
          </p>
        )}
        {uploadError && (
          <p className="mt-2 font-mono text-union" style={{ fontSize: "var(--text-label)" }}>
            {uploadError}
          </p>
        )}
        <input type="hidden" name="photoUrl" value={photoUrl ?? ""} />
      </div>

      <button
        type="submit"
        disabled={pending || uploading}
        className="font-mono uppercase text-ink border border-ink px-6 py-2 hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
        style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

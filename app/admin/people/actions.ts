"use server";

import { db } from "@/db";
import { people } from "@/db/schema";
import { eq } from "drizzle-orm";
import { joinIsoParts } from "@/lib/dates";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";

const VALID_GENERATIONS = [
  "Founders",
  "1st Generation",
  "2nd Generation",
  "3rd Generation",
  "4th Generation",
  "5th Generation",
  "6th Generation",
];

type ActionResult = { error: string } | { success: true };

function extractFields(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() || null;
  const preferredName = (formData.get("preferredName") as string | null)?.trim() || null;
  const genealogicalId = (formData.get("genealogicalId") as string | null)?.trim() || null;
  const generation = (formData.get("generation") as string | null)?.trim() || null;
  const birthDate = joinIsoParts(
    (formData.get("birthYear") as string) ?? "",
    (formData.get("birthMonth") as string) ?? "",
    (formData.get("birthDay") as string) ?? ""
  );
  const birthPlaceId = (formData.get("birthPlaceId") as string | null)?.trim() || null;
  const deathDate = joinIsoParts(
    (formData.get("deathYear") as string) ?? "",
    (formData.get("deathMonth") as string) ?? "",
    (formData.get("deathDay") as string) ?? ""
  );
  const deathPlaceId = (formData.get("deathPlaceId") as string | null)?.trim() || null;
  const bio = (formData.get("bio") as string | null)?.trim() || null;
  const photoUrl = (formData.get("photoUrl") as string | null)?.trim() || null;
  return { name, preferredName, genealogicalId, generation, birthDate, birthPlaceId, deathDate, deathPlaceId, bio, photoUrl };
}

function validate(fields: ReturnType<typeof extractFields>): string | null {
  if (fields.name !== null && fields.name.length === 0) {
    return "Name cannot be blank if provided. Leave the field empty to save as UNKNOWN.";
  }
  if (fields.genealogicalId !== null && !/^\d+[A-Za-z]?$/.test(fields.genealogicalId)) {
    return "Genealogical ID must be a number (e.g. 12 or 40A).";
  }
  if (fields.generation !== null && !VALID_GENERATIONS.includes(fields.generation)) {
    return "Invalid generation value.";
  }
  return null;
}

export async function updatePerson(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const fields = extractFields(formData);
  const error = validate(fields);
  if (error) return { error };

  const [existing] = await db.select({ photoUrl: people.photoUrl }).from(people).where(eq(people.id, id));
  if (existing?.photoUrl && existing.photoUrl !== fields.photoUrl) {
    try {
      await del(existing.photoUrl);
    } catch {
      // non-fatal: continue even if blob deletion fails
    }
  }

  await db
    .update(people)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(people.id, id));

  return { success: true };
}

export async function createPerson(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const fields = extractFields(formData);
  const error = validate(fields);
  if (error) return { error };

  const [inserted] = await db
    .insert(people)
    .values({ ...fields })
    .returning({ id: people.id });

  redirect(`/admin/people/${inserted.id}/edit`);
}

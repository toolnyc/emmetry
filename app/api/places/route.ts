import { db } from "@/db";
import { places } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name: string };
  const name = body.name?.trim();
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: places.id, name: places.name, lat: places.lat, lng: places.lng })
    .from(places)
    .where(eq(places.name, name))
    .limit(1);

  if (existing) return Response.json(existing);

  const [inserted] = await db
    .insert(places)
    .values({ name })
    .returning({ id: places.id, name: places.name, lat: places.lat, lng: places.lng });

  return Response.json(inserted, { status: 201 });
}

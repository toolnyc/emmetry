import { db } from "@/db";
import { places } from "@/db/schema";
import { ilike, or } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const rows = await db
    .select({ id: places.id, name: places.name, lat: places.lat, lng: places.lng })
    .from(places)
    .where(q ? ilike(places.name, `%${q}%`) : undefined)
    .orderBy(places.name)
    .limit(20);

  return Response.json(rows);
}

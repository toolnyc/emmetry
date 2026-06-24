import { db } from "@/db";
import { people, places } from "@/db/schema";
import { isNotNull } from "drizzle-orm";
import { resolveDisplayName } from "@/lib/names";
import { formatIsoDate } from "@/lib/dates";
import { MapView } from "./MapView";

export type PlacePerson = {
  id: string;
  name: string;
  birthDate: string | null;
  deathDate: string | null;
  photoUrl: string | null;
};

export type PlacePin = {
  placeId: string;
  placeName: string;
  lat: number;
  lng: number;
  births: PlacePerson[];
  deaths: PlacePerson[];
};

async function loadPins(): Promise<PlacePin[]> {
  const geocodedPlaces = await db
    .select()
    .from(places)
    .where(isNotNull(places.lat));

  const allPeople = await db
    .select({
      id: people.id,
      name: people.name,
      preferredName: people.preferredName,
      birthDate: people.birthDate,
      deathDate: people.deathDate,
      photoUrl: people.photoUrl,
      birthPlaceId: people.birthPlaceId,
      deathPlaceId: people.deathPlaceId,
    })
    .from(people);

  const pins: PlacePin[] = [];

  for (const place of geocodedPlaces) {
    if (place.lat == null || place.lng == null) continue;

    const births = allPeople
      .filter((p) => p.birthPlaceId === place.id)
      .map((p) => ({
        id: p.id,
        name: resolveDisplayName(p.name, p.preferredName),
        birthDate: formatIsoDate(p.birthDate) || null,
        deathDate: formatIsoDate(p.deathDate) || null,
        photoUrl: p.photoUrl,
      }));

    const deaths = allPeople
      .filter((p) => p.deathPlaceId === place.id)
      .map((p) => ({
        id: p.id,
        name: resolveDisplayName(p.name, p.preferredName),
        birthDate: formatIsoDate(p.birthDate) || null,
        deathDate: formatIsoDate(p.deathDate) || null,
        photoUrl: p.photoUrl,
      }));

    if (births.length === 0 && deaths.length === 0) continue;

    pins.push({
      placeId: place.id,
      placeName: place.name,
      lat: place.lat,
      lng: place.lng,
      births,
      deaths,
    });
  }

  return pins;
}

export default async function GeographicalPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const { place: selectedPlaceId } = await searchParams;
  const pins = await loadPins();

  return (
    <MapView
      pins={pins}
      initialPlaceId={selectedPlaceId ?? null}
      maptilerKey={process.env.NEXT_PUBLIC_MAPTILER_KEY ?? ""}
    />
  );
}

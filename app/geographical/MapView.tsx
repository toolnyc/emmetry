"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PlacePin, PlacePerson } from "./page";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  pins: PlacePin[];
  initialPlaceId: string | null;
  maptilerKey: string;
};

const INK = "#2a2a2a";

// Pin layers are added dynamically after the "pins" GeoJSON source is loaded.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PIN_LAYERS: any[] = [
  // Death rings first so birth dots paint on top for "both" places.
  {
    id: "pins-death",
    type: "circle" as const,
    source: "pins",
    filter: [">", ["get", "deathCount"], 0],
    paint: {
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": INK,
      "circle-stroke-width": 2,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "deathCount"],
        1, 7,
        10, 14,
      ],
    },
  },
  {
    id: "pins-birth",
    type: "circle" as const,
    source: "pins",
    filter: [">", ["get", "birthCount"], 0],
    paint: {
      "circle-color": INK,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "birthCount"],
        1, 5,
        10, 10,
      ],
    },
  },
];

function buildGeoJSON(pins: PlacePin[]) {
  return {
    type: "FeatureCollection" as const,
    features: pins.map((pin) => ({
      type: "Feature" as const,
      id: pin.placeId,
      geometry: {
        type: "Point" as const,
        coordinates: [pin.lng, pin.lat],
      },
      properties: {
        placeId: pin.placeId,
        placeName: pin.placeName,
        birthCount: pin.births.length,
        deathCount: pin.deaths.length,
      },
    })),
  };
}

function PanelPerson({
  person,
  role,
}: {
  person: PlacePerson;
  role: "birth" | "death";
}) {
  return (
    <li className="flex items-center gap-3 border-b border-rule py-3 last:border-b-0">
      <span
        className="flex-shrink-0"
        aria-label={role === "birth" ? "Birth" : "Death"}
        title={role === "birth" ? "Born here" : "Died here"}
      >
        {role === "birth" ? (
          <span
            className="block h-2.5 w-2.5 rounded-full bg-ink"
            aria-hidden="true"
          />
        ) : (
          <span
            className="block h-3 w-3 rounded-full border-2 border-ink"
            aria-hidden="true"
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <Link
          href={`/people/${person.id}`}
          className="font-sans text-ink underline-offset-2 hover:underline"
          style={{ fontSize: "var(--text-body)" }}
        >
          {person.name}
        </Link>
        {(person.birthDate || person.deathDate) && (
          <div
            className="font-mono text-ghost-strong mt-0.5"
            style={{ fontSize: "var(--text-date)" }}
          >
            {person.birthDate && <span>{person.birthDate}</span>}
            {person.birthDate && person.deathDate && (
              <span aria-hidden="true"> – </span>
            )}
            {person.deathDate && <span>{person.deathDate}</span>}
          </div>
        )}
      </div>
    </li>
  );
}

const MODES = [
  { label: "Generational", href: "/" },
  { label: "Alphabetical", href: "/alphabetical" },
  { label: "Geographical", href: "/geographical" },
] as const;

export function MapView({ pins, initialPlaceId, maptilerKey }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);
  const [selectedPin, setSelectedPin] = useState<PlacePin | null>(
    initialPlaceId ? (pins.find((p) => p.placeId === initialPlaceId) ?? null) : null
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!maptilerKey || !containerRef.current || mapRef.current) return;

    const container = containerRef.current;
    let map: import("maplibre-gl").Map;

    import("maplibre-gl")
      .then((maplibre) => {
        if (!container) return;

        // Use MapTiler's hosted dataviz style — minimal, light, proven to work.
        // Custom monochrome layer overrides are added after load.
        map = new maplibre.Map({
          container,
          style: `https://api.maptiler.com/maps/dataviz/style.json?key=${maptilerKey}`,
          center: [0, 30],
          zoom: 2,
          attributionControl: false,
        });

        map.addControl(
          new maplibre.AttributionControl({ compact: true }),
          "bottom-left"
        );

        map.on("error", (e) => {
          console.error("[MapView] MapLibre error:", e.error);
          setMapError(e.error?.message ?? "Map failed to load");
        });

        map.on("load", () => {
          map.addSource("pins", {
            type: "geojson",
            data: buildGeoJSON(pins),
          });

          for (const layer of PIN_LAYERS) {
            map.addLayer(layer as Parameters<typeof map.addLayer>[0]);
          }

          map.on("click", ["pins-birth", "pins-death"], (e) => {
            const feature = e.features?.[0];
            if (!feature) return;
            const placeId = feature.properties?.placeId as string;
            const pin = pins.find((p) => p.placeId === placeId) ?? null;
            setSelectedPin(pin);
          });

          map.on("mouseenter", ["pins-birth", "pins-death"], () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", ["pins-birth", "pins-death"], () => {
            map.getCanvas().style.cursor = "";
          });

          map.resize();
          setMapReady(true);
          mapRef.current = map;

          if (initialPlaceId) {
            const pin = pins.find((p) => p.placeId === initialPlaceId);
            if (pin) {
              map.flyTo({ center: [pin.lng, pin.lat], zoom: 8, duration: 0 });
            }
          }
        });
      })
      .catch((err) => {
        console.error("[MapView] Failed to load maplibre-gl:", err);
        setMapError("Failed to load map library");
      });

    return () => {
      map?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panelPeople: Array<{ person: PlacePerson; role: "birth" | "death" }> =
    selectedPin
      ? [
          ...selectedPin.births.map((p) => ({ person: p, role: "birth" as const })),
          ...selectedPin.deaths.map((p) => ({ person: p, role: "death" as const })),
        ]
      : [];

  if (!maptilerKey || mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-paper">
        <p
          className="font-mono uppercase text-ghost-strong"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-nav)" }}
        >
          {mapError ?? "Map unavailable — NEXT_PUBLIC_MAPTILER_KEY not configured"}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {/* Map canvas */}
      <div ref={containerRef} className="absolute inset-0" />

      {/* Floating mode nav + home */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-rule bg-paper/90 px-8 py-3 backdrop-blur-sm md:px-16"
      >
        <Link
          href="/"
          className="pointer-events-auto font-mono uppercase text-ghost-strong transition-colors hover:text-ink"
          style={{
            fontSize: "var(--text-nav)",
            letterSpacing: "var(--tracking-nav)",
          }}
        >
          Emmetry
        </Link>
        <nav className="pointer-events-auto hidden grid-cols-3 gap-8 md:grid">
          {MODES.map((mode) => {
            const active = mode.href === "/geographical";
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className={`font-mono uppercase transition-colors hover:text-ink ${
                  active ? "text-ink font-[500]" : "text-ghost-strong"
                }`}
                style={{
                  fontSize: "var(--text-nav)",
                  letterSpacing: "var(--tracking-nav)",
                }}
              >
                {mode.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Legend */}
      {mapReady && (
        <div
          className="pointer-events-none absolute bottom-8 left-8 z-10 flex flex-col gap-2 bg-paper/90 px-4 py-3 backdrop-blur-sm"
          style={{ border: "1px solid var(--color-rule)" }}
        >
          <div className="flex items-center gap-2">
            <span className="block h-2.5 w-2.5 rounded-full bg-ink flex-shrink-0" />
            <span
              className="font-mono uppercase text-ghost-strong"
              style={{ fontSize: "var(--text-date)" }}
            >
              Birth
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="block h-3 w-3 rounded-full border-2 border-ink flex-shrink-0" />
            <span
              className="font-mono uppercase text-ghost-strong"
              style={{ fontSize: "var(--text-date)" }}
            >
              Death
            </span>
          </div>
        </div>
      )}

      {/* Side panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-10 flex w-80 flex-col border-l border-rule bg-paper transition-transform duration-200 ${
          selectedPin ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "var(--ease-standard)" }}
      >
        {selectedPin && (
          <>
            <div className="flex items-start justify-between border-b border-rule px-6 py-5">
              <div>
                <p
                  className="font-mono uppercase text-ghost-strong"
                  style={{
                    fontSize: "var(--text-label)",
                    letterSpacing: "var(--tracking-nav)",
                  }}
                >
                  In the record
                </p>
                <h2
                  className="mt-1 font-sans text-ink"
                  style={{ fontSize: "var(--text-body)" }}
                >
                  {selectedPin.placeName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPin(null)}
                className="ml-4 font-mono text-ghost-strong transition-colors hover:text-ink"
                style={{ fontSize: "var(--text-label)" }}
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <ul>
                {panelPeople.map(({ person, role }) => (
                  <PanelPerson
                    key={`${person.id}-${role}`}
                    person={person}
                    role={role}
                  />
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

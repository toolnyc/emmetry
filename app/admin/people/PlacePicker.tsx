"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PlaceOption = {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  label: string;
  inputName: string;
  defaultValue?: { id: string; name: string } | null;
};

export function PlacePicker({ label, inputName, defaultValue }: Props) {
  const [query, setQuery] = useState(defaultValue?.name ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultValue?.id ?? null
  );
  const [options, setOptions] = useState<PlaceOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/places/search?q=${encodeURIComponent(q)}`
      );
      if (!res.ok) return;
      setOptions(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!open) return;
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectOption(option: PlaceOption) {
    setSelectedId(option.id);
    setQuery(option.name);
    setOpen(false);
  }

  async function createNew() {
    const name = query.trim();
    if (!name) return;
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    const place: PlaceOption = await res.json();
    selectOption(place);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelectedId(null);
    setOpen(true);
  }

  const exactMatch = options.find(
    (o) => o.name.toLowerCase() === query.trim().toLowerCase()
  );
  const showCreateOption = query.trim() && !exactMatch && !loading;

  const inputStyle = {
    fontSize: "var(--text-body)",
  } as React.CSSProperties;

  const labelStyle = {
    fontSize: "var(--text-label)",
    letterSpacing: "var(--tracking-nav)",
  } as React.CSSProperties;

  return (
    <div ref={containerRef}>
      <label
        className="block font-mono uppercase text-ghost-strong mb-2"
        style={labelStyle}
      >
        {label}
        {selectedId && (
          <span className="ml-2 text-ghost-mid normal-case tracking-normal">
            ✓
          </span>
        )}
      </label>
      <input type="hidden" name={inputName} value={selectedId ?? ""} />
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          placeholder="Search or type a new place…"
          autoComplete="off"
          className="w-full border border-rule bg-paper font-sans text-ink px-4 py-2 outline-none focus:border-ink"
          style={inputStyle}
        />
        {open && (options.length > 0 || showCreateOption) && (
          <ul
            className="absolute left-0 right-0 top-full z-20 border border-rule bg-paper"
            style={{ borderTop: "none" }}
          >
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => selectOption(option)}
                  className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-ghost-faint"
                >
                  <span className="font-sans text-ink" style={inputStyle}>
                    {option.name}
                  </span>
                  {option.lat != null && (
                    <span
                      className="ml-4 flex-shrink-0 font-mono text-ghost-strong"
                      style={{ fontSize: "var(--text-date)" }}
                      title="Geocoded"
                    >
                      ●
                    </span>
                  )}
                </button>
              </li>
            ))}
            {showCreateOption && (
              <li>
                <button
                  type="button"
                  onClick={createNew}
                  className="flex w-full items-center px-4 py-2 text-left hover:bg-ghost-faint"
                >
                  <span
                    className="font-mono uppercase text-ghost-strong"
                    style={labelStyle}
                  >
                    Add &ldquo;{query.trim()}&rdquo;
                  </span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
      {selectedId && !query.trim() && (
        <button
          type="button"
          onClick={() => {
            setSelectedId(null);
            setQuery("");
          }}
          className="mt-1 font-mono uppercase text-ghost-strong hover:text-ink"
          style={{ fontSize: "var(--text-date)" }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

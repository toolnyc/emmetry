"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { EASE, DURATION } from "@/lib/gsap-presets";
import { displayName } from "@/lib/names";

type Member = { id: string; name: string };

export function SearchAffordance({ people }: { people: Member[] }) {
  const router = useRouter();
  const named = useMemo(
    () =>
      people
        .filter((p): p is Member => Boolean(p.name))
        .map((p) => ({ id: p.id, name: displayName(p.name) })),
    [people]
  );

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [idx, setIdx] = useState(0);
  const circleRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (circleRef.current) gsap.set(circleRef.current, { opacity: 0, scale: 0.8 });
  }, []);

  const onIconEnter = () => {
    if (!circleRef.current) return;
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(circleRef.current, { opacity: 1, scale: 1, duration: r ? 0.01 : DURATION.base, ease: EASE.out });
  };
  const onIconLeave = () => {
    if (!circleRef.current) return;
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(circleRef.current, { opacity: 0, scale: 0.8, duration: r ? 0.01 : DURATION.fast, ease: EASE.in });
  };

  useEffect(() => {
    if (named.length === 0) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % named.length), 2800);
    return () => clearInterval(t);
  }, [named.length]);

  const placeholder = named[idx]?.name ?? "Search the record";

  const q = query.trim().toLowerCase();
  const matches = q
    ? named.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8)
    : [];

  const go = (id: string) => {
    setQuery("");
    setFocused(false);
    router.push(`/people/${id}`);
  };

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-4">
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-ink md:h-14 md:w-14"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-ink md:h-6 md:w-6"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
        </svg>
      </span>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) go(matches[0].id);
          if (e.key === "Escape") setQuery("");
        }}
        placeholder={placeholder}
        aria-label="Search the record"
        className="min-w-0 flex-1 bg-transparent font-sans text-ink outline-none placeholder:text-ghost-faint"
        style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)", lineHeight: "1" }}
      />

      {focused && matches.length > 0 && (
        <ul className="absolute left-16 right-0 top-full z-50 mt-2 max-h-80 overflow-auto border border-rule bg-paper">
          {matches.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(m.id)}
                className="block w-full px-4 py-2 text-left font-sans text-ink hover:bg-rule/40"
                style={{ fontSize: "var(--text-body)" }}
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

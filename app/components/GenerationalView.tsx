"use client";

import { useState } from "react";
import { PersonLink } from "./PersonLink";
import { LifeDates } from "./LifeDates";
import { UnionMarker } from "./UnionMarker";
import { Collapse } from "./Collapse";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

export type PersonLite = {
  id: string;
  name: string | null;
  preferredName: string | null;
  birthDate: string | null;
  deathDate: string | null;
  photoUrl: string | null;
};

export type CoupleUnit = {
  descendant: PersonLite;
  partner: PersonLite | null;
  children: PersonLite[];
};

export type GenerationGroup = {
  generation: string;
  year: number | null;
  couples: CoupleUnit[];
};

function headerTone(index: number, open: number): string {
  if (index === open) return "text-ghost-strong";
  if (Math.abs(index - open) === 1) return "text-ghost-mid";
  return "text-ghost-faint";
}

function yearTone(index: number, open: number): string {
  if (index === open) return "text-ghost-mid";
  return "text-ghost-faint";
}

function NameDates({ p, sub = false }: { p: PersonLite; sub?: boolean }) {
  const size = sub ? "var(--text-name-sub)" : "var(--text-name)";
  return (
    <span className="inline-flex items-center gap-2 md:gap-3">
      <PersonLink
        id={p.id}
        name={p.name}
        preferredName={p.preferredName}
        photoUrl={p.photoUrl}
        className="font-sans text-ink"
        style={{ fontSize: size, letterSpacing: "var(--tracking-name)" }}
      />
      <LifeDates
        birthDate={p.birthDate}
        deathDate={p.deathDate}
        sizeVar={size}
      />
    </span>
  );
}

function Couple({ couple }: { couple: CoupleUnit }) {
  const { descendant, partner, children } = couple;
  return (
    <div data-anim>
      {/* Mobile: flat stack; the dot has short vertical stubs extending toward
          both names so the union relationship is visually unambiguous. The
          horizontal rule crosses the pl-6 padding back to the spine rail. */}
      <div className="flex flex-col gap-2 md:hidden">
        <NameDates p={descendant} />
        {partner && (
          <div className="relative flex items-center gap-2 py-0.5">
            {/* Horizontal rule: spine rail → dot */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-px w-6 -translate-x-full -translate-y-1/2 bg-rule"
            />
            {/* Dot with vertical stubs pointing toward both names */}
            <span className="relative flex-shrink-0">
              <span
                aria-hidden="true"
                className="absolute left-1/2 bottom-full h-4 w-px -translate-x-1/2 bg-rule"
              />
              <span className="block h-2 w-2 rounded-full bg-union" />
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-full h-4 w-px -translate-x-1/2 bg-rule"
              />
            </span>
            <span
              className="font-mono uppercase text-ghost-strong"
              style={{
                fontSize: "var(--text-tagline)",
                letterSpacing: "var(--tracking-tagline)",
              }}
            >
              Union
            </span>
          </div>
        )}
        {partner && <NameDates p={partner} />}
        {children.length > 0 && (
          <div className="mt-2 flex flex-col gap-1 border-l border-rule pl-3">
            {children.map((c) => (
              <NameDates key={c.id} p={c} sub />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: couple on one non-wrapping line; children filed beneath in a
          horizontal scroll rail. */}
      <div className="hidden md:block">
        <div className="flex items-center gap-6">
          <NameDates p={descendant} />
          {partner && <UnionMarker orientation="horizontal" />}
          {partner && <NameDates p={partner} />}
        </div>
        {children.length > 0 && (
          <div className="mt-2 ml-6 border-l border-rule pl-4">
            <OverlayScrollbarsComponent
              element="div"
              defer
              options={{
                scrollbars: {
                  theme: "os-theme-emmetry",
                  autoHide: "scroll",
                  autoHideDelay: 600,
                },
                overflow: { x: "scroll", y: "hidden" },
              }}
            >
              <div className="flex gap-6 pb-3">
                {children.map((c) => (
                  <div key={c.id} className="flex-shrink-0">
                    <NameDates p={c} sub />
                  </div>
                ))}
              </div>
            </OverlayScrollbarsComponent>
          </div>
        )}
      </div>
    </div>
  );
}

export function GenerationalView({ groups }: { groups: GenerationGroup[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-6">
      {groups.map((group, i) => {
        const isOpen = i === open;
        return (
          <section key={group.generation}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="group block w-full cursor-pointer text-left"
            >
              <h2
                className={`font-sans font-[400] leading-[0.95] transition-colors duration-200 group-hover:text-ghost-strong ${headerTone(
                  i,
                  open
                )}`}
                style={{
                  fontSize: "var(--text-display)",
                  letterSpacing: "var(--tracking-display)",
                  transitionTimingFunction: "var(--ease-standard)",
                }}
              >
                {group.generation}
                {group.year != null && (
                  <span
                    className={`font-mono ${yearTone(i, open)}`}
                    style={{
                      fontSize: "0.5em",
                      letterSpacing: "normal",
                      verticalAlign: "middle",
                      marginLeft: "0.75em",
                    }}
                  >
                    {group.year}
                  </span>
                )}
              </h2>
            </button>

            <Collapse open={isOpen}>
              {group.couples.length > 0 && (
                <div className="mt-6">
                  <div className="mb-6 border-t border-rule" />
                  <div className="space-y-6 border-l border-ink/30 pl-6 md:space-y-4 md:border-l-0 md:pl-0">
                    {group.couples.map((couple) => (
                      <Couple key={couple.descendant.id} couple={couple} />
                    ))}
                  </div>
                  <div className="mt-6 hidden border-b border-rule md:block" />
                </div>
              )}
            </Collapse>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import { PersonLink } from "./PersonLink";
import { LifeDates } from "./LifeDates";
import { Collapse } from "./Collapse";
import type { PersonLite } from "./GenerationalView";

export type LineageSection = {
  title: string;
  members: PersonLite[];
};

function headerTone(index: number, open: number): string {
  if (index === open) return "text-ghost-strong";
  if (Math.abs(index - open) === 1) return "text-ghost-mid";
  return "text-ghost-faint";
}

export function LineageColumn({ sections }: { sections: LineageSection[] }) {
  const parentsIdx = sections.findIndex((s) => s.title === "Parents");
  const firstPopulated = sections.findIndex((s) => s.members.length > 0);
  const initial =
    parentsIdx >= 0 && sections[parentsIdx].members.length > 0
      ? parentsIdx
      : firstPopulated;
  const [open, setOpen] = useState(initial);

  return (
    <div className="space-y-2">
      {sections.map((section, i) => {
        const isOpen = i === open;
        return (
          <section key={section.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="group block w-full cursor-pointer text-left"
            >
              <h3
                className={`font-sans font-[400] leading-[1.05] transition-colors duration-200 group-hover:text-ghost-strong ${headerTone(
                  i,
                  open
                )}`}
                style={{
                  fontSize: "var(--text-name)",
                  letterSpacing: "var(--tracking-name)",
                  transitionTimingFunction: "var(--ease-standard)",
                }}
              >
                {section.title}
              </h3>
            </button>

            <Collapse open={isOpen}>
              <ul className="mt-2 mb-4 space-y-2 pl-1">
                {section.members.length === 0 ? (
                  <li
                    className="font-mono text-ghost-mid"
                    style={{ fontSize: "var(--text-label)" }}
                  >
                    —
                  </li>
                ) : (
                  section.members.map((p) => (
                    <li key={p.id} data-anim className="flex items-center gap-3">
                      <PersonLink
                        id={p.id}
                        name={p.name}
                        photoUrl={p.photoUrl}
                        className="font-sans text-ink"
                        style={{
                          fontSize: "var(--text-body)",
                          letterSpacing: "var(--tracking-name)",
                        }}
                      />
                      <LifeDates
                        birthDate={p.birthDate}
                        deathDate={p.deathDate}
                        sizeVar="var(--text-body)"
                      />
                    </li>
                  ))
                )}
              </ul>
            </Collapse>
          </section>
        );
      })}
    </div>
  );
}

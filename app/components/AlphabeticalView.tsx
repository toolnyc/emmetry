"use client";

import { useState } from "react";
import { PersonLink } from "./PersonLink";
import { LifeDates } from "./LifeDates";
import { Collapse } from "./Collapse";
import type { PersonLite } from "./GenerationalView";

export type AlphaGroup = {
  letter: string;
  members: PersonLite[];
};

function headerTone(index: number, open: number): string {
  if (index === open) return "text-ghost-strong";
  if (Math.abs(index - open) === 1) return "text-ghost-mid";
  return "text-ghost-faint";
}

export function AlphabeticalView({ groups }: { groups: AlphaGroup[] }) {
  const firstPopulated = groups.findIndex((g) => g.members.length > 0);
  const [open, setOpen] = useState(firstPopulated < 0 ? -1 : firstPopulated);

  return (
    <div className="space-y-4">
      {groups.map((group, i) => {
        const isOpen = i === open;
        const populated = group.members.length > 0;
        return (
          <section key={group.letter}>
            <button
              type="button"
              onClick={() => populated && setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              disabled={!populated}
              className="group block w-full text-left enabled:cursor-pointer"
            >
              <h2
                className={`font-sans font-[400] leading-[0.95] transition-colors duration-200 ${
                  populated ? "group-hover:text-ghost-strong" : ""
                } ${headerTone(i, open)}`}
                style={{
                  fontSize: "var(--text-display)",
                  letterSpacing: "var(--tracking-display)",
                  transitionTimingFunction: "var(--ease-standard)",
                }}
              >
                {group.letter}
              </h2>
            </button>

            <Collapse open={isOpen && populated}>
              <ul className="mt-3 mb-8 space-y-3 pl-2 md:pl-6">
                {group.members.map((p) => (
                  <li key={p.id} data-anim className="flex items-center gap-3">
                    <PersonLink
                      id={p.id}
                      name={p.name}
                      preferredName={p.preferredName}
                      photoUrl={p.photoUrl}
                      className="font-sans text-ink"
                      style={{
                        fontSize: "var(--text-name)",
                        letterSpacing: "var(--tracking-name)",
                      }}
                    />
                    <LifeDates birthDate={p.birthDate} deathDate={p.deathDate} />
                  </li>
                ))}
              </ul>
            </Collapse>
          </section>
        );
      })}
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { label: "Generational", href: "/", align: "text-left" },
  { label: "Alphabetical", href: "/alphabetical", align: "text-center" },
  { label: "Geographical", href: "/geographical", align: "text-right" },
] as const;

export function ModeNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:grid grid-cols-3 border-b border-rule px-8 py-3 md:px-16">
      {MODES.map((mode) => {
        const active =
          mode.href === "/"
            ? pathname === "/"
            : pathname.startsWith(mode.href);
        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={`font-mono uppercase transition-colors hover:text-ink ${mode.align} ${
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
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

const MODES: { label: string; href: string }[] = [
  { label: "Generational", href: "/" },
  { label: "Alphabetical", href: "/alphabetical" },
  { label: "Geographical", href: "/geographical" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  // Close the menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isFirst.current) {
      isFirst.current = false;
      gsap.set(el, { yPercent: 100 });
      return;
    }
    gsap.killTweensOf(el);
    if (reduce) {
      gsap.set(el, { yPercent: menuOpen ? 0 : 100 });
      return;
    }
    gsap.to(el, {
      yPercent: menuOpen ? 0 : 100,
      duration: menuOpen ? 0.3 : 0.22,
      ease: menuOpen ? "power3.out" : "power2.in",
    });
  }, [menuOpen]);

  if (pathname.startsWith("/admin")) return null;

  const itemClass =
    "font-mono uppercase text-on-footer hover:opacity-70 transition-opacity";
  const itemStyle = {
    fontSize: "var(--text-nav)",
    letterSpacing: "var(--tracking-nav)",
  } as React.CSSProperties;

  return (
    <>
      {/* Mobile slide-up menu panel (sits above the footer bar) */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-ink/20 md:hidden"
        />
      )}
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-5 bg-footer px-8 pb-20 pt-8 md:hidden"
        aria-hidden={!menuOpen}
      >
        {MODES.map((m) => {
          const active =
            m.href === "/" ? pathname === "/" : pathname.startsWith(m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`${itemClass} ${active ? "font-bold opacity-100" : ""}`}
              style={itemStyle}
            >
              {m.label}
            </Link>
          );
        })}
        <span className="my-1 border-t border-on-footer/20" />
        <span className={itemClass} style={itemStyle}>
          Info
        </span>
        <Link href="/admin/people" className={itemClass} style={itemStyle}>
          Login
        </Link>
        <span className={itemClass} style={itemStyle}>
          Submit
        </span>
      </div>

      <footer
        className="fixed bottom-0 left-0 right-0 bg-footer"
        style={{ zIndex: 50 }}
      >
        {/* Desktop: Info · Login · Submit */}
        <div className="hidden md:grid grid-cols-3 items-center px-8 py-4">
          <span className={itemClass} style={itemStyle}>
            Info
          </span>
          <Link
            href="/admin/people"
            className={`${itemClass} text-center`}
            style={itemStyle}
          >
            Login
          </Link>
          <span className={`${itemClass} text-right`} style={itemStyle}>
            Submit
          </span>
        </div>

        {/* Mobile: Menu trigger */}
        <div className="md:hidden flex justify-center px-8 py-4">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            className={`${itemClass} cursor-pointer`}
            style={itemStyle}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </footer>
    </>
  );
}

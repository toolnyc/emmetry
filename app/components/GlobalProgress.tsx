"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

/**
 * A thin top progress bar that fills 0 -> 100% across client navigations,
 * styled like the horizontal scrollbar (rule track + ghost-strong fill). It
 * starts on an internal link click and completes when the pathname changes.
 * See ADR-0007.
 */
export function GlobalProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const active = useRef(false);

  const reduce = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const start = () => {
    const b = bar.current,
      f = fill.current;
    if (!b || !f) return;
    active.current = true;
    gsap.killTweensOf([b, f]);
    gsap.set(b, { opacity: 1 });
    gsap.set(f, { scaleX: 0, transformOrigin: "left center" });
    gsap.to(f, {
      scaleX: 0.9,
      duration: reduce() ? 0.2 : 1.4,
      ease: "power1.out",
    });
  };

  const done = () => {
    const b = bar.current,
      f = fill.current;
    if (!b || !f || !active.current) return;
    active.current = false;
    gsap.killTweensOf(f);
    const tl = gsap.timeline();
    tl.to(f, { scaleX: 1, duration: 0.18, ease: "power2.out" });
    tl.to(b, { opacity: 0, duration: 0.25 }, ">");
    tl.set(f, { scaleX: 0 });
  };

  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      const target = a.getAttribute("target");
      if (!href || href.startsWith("#") || target === "_blank") return;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        )
          return;
      } catch {
        return;
      }
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      ref={bar}
      className="fixed inset-x-0 top-0 z-[60]"
      style={{ opacity: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <div className="loadbar-track">
        <div
          ref={fill}
          className="loadbar-fill"
          style={{ transformOrigin: "left center", transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

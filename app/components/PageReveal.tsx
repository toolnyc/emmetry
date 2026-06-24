"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, DURATION, STAGGER } from "@/lib/gsap-presets";

/**
 * Wraps page content and plays a staggered fade+rise entrance on mount.
 * Children with [data-reveal] receive the stagger; the root wrapper itself
 * fades in as a whole so content doesn't flash in during hydration.
 */
export function PageReveal({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = root.querySelectorAll<HTMLElement>("[data-reveal]");

    if (reduce) {
      gsap.set(root, { opacity: 1 });
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(root, { opacity: 0 });
    gsap.set(items, { opacity: 0, y: 16 });

    const tl = gsap.timeline();
    tl.to(root, { opacity: 1, duration: DURATION.fast, ease: EASE.out });
    if (items.length) {
      tl.to(
        items,
        {
          opacity: 1,
          y: 0,
          duration: DURATION.slow,
          ease: EASE.out,
          stagger: STAGGER,
        },
        0.05
      );
    }
  }, []);

  return (
    <div ref={rootRef} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

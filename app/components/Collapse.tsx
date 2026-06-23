"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Animates its content open/closed with GSAP: the outer wrapper tweens height,
 * the inner wrapper fades + slides, and any [data-anim] descendants cascade in
 * with a short stagger for a little flourish. Children stay mounted so the
 * collapse animates in both directions. Honors prefers-reduced-motion by
 * snapping without a tween. See ADR-0007.
 */
export function Collapse({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const isFirst = useRef(true);

  useLayoutEffect(() => {
    const el = outer.current;
    const content = inner.current;
    if (!el || !content) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items = content.querySelectorAll<HTMLElement>("[data-anim]");

    if (isFirst.current) {
      isFirst.current = false;
      gsap.set(el, { height: open ? "auto" : 0 });
      gsap.set(content, { opacity: open ? 1 : 0, y: open ? 0 : 8 });
      return;
    }

    gsap.killTweensOf([el, content, items]);

    if (reduce) {
      gsap.set(el, { height: open ? "auto" : 0 });
      gsap.set(content, { opacity: open ? 1 : 0, y: 0 });
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }

    if (open) {
      const tl = gsap.timeline();
      tl.to(el, { height: "auto", duration: 0.42, ease: "power3.out" }, 0);
      tl.to(
        content,
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
        0.04
      );
      if (items.length) {
        tl.fromTo(
          items,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
            stagger: 0.05,
          },
          0.08
        );
      }
    } else {
      const tl = gsap.timeline();
      tl.to(
        content,
        { opacity: 0, y: 8, duration: 0.18, ease: "power2.in" },
        0
      );
      tl.to(el, { height: 0, duration: 0.26, ease: "power3.inOut" }, 0.04);
    }
  }, [open]);

  return (
    <div ref={outer} style={{ overflow: "hidden" }}>
      <div ref={inner}>{children}</div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, DURATION } from "@/lib/gsap-presets";

/**
 * Logo: a single "E" that expands on hover to reveal "mmetry" and the tagline.
 *
 * Layout approach:
 *  - The suffix span uses overflow:hidden + width:0 so it is *removed from
 *    layout* when hidden — the cell shrinks to just the "E".  GSAP animates
 *    width to "auto" on hover, which naturally widens the header cell.
 *  - The tagline is position:absolute so it never contributes to the cell
 *    height; the "E" therefore stays vertically centred in its container at
 *    all times.
 *  - A small paddingRight on the suffix prevents subpixel clipping of the
 *    last glyph.
 */
export function Wordmark() {
  const suffixRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (suffixRef.current)
      gsap.set(suffixRef.current, { width: 0, overflow: "hidden" });
    if (taglineRef.current) gsap.set(taglineRef.current, { opacity: 0 });
  }, []);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onEnter = () => {
    tlRef.current?.kill();
    const r = reduced();
    tlRef.current = gsap
      .timeline()
      .to(suffixRef.current, {
        width: "auto",
        duration: r ? 0.01 : DURATION.slow,
        ease: EASE.out,
      })
      .to(
        taglineRef.current,
        { opacity: 1, duration: r ? 0.01 : DURATION.base, ease: EASE.out },
        `-=${DURATION.base}`
      );
  };

  const onLeave = () => {
    tlRef.current?.kill();
    const r = reduced();
    tlRef.current = gsap
      .timeline()
      .to(taglineRef.current, {
        opacity: 0,
        duration: r ? 0.01 : DURATION.fast,
        ease: EASE.in,
      })
      .to(
        suffixRef.current,
        {
          width: 0,
          duration: r ? 0.01 : DURATION.base,
          ease: EASE.in,
        },
        `-=${DURATION.fast * 0.5}`
      );
  };

  return (
    <Link
      href="/"
      className="relative block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* Name line — determines the cell height; inline-flex so it sizes to content */}
      <span
        className="inline-flex items-baseline font-sans font-[400] text-ink leading-none"
        style={{
          fontSize: "var(--text-wordmark)",
          letterSpacing: "var(--tracking-display)",
        }}
      >
        E
        <span
          ref={suffixRef}
          className="inline-block whitespace-nowrap"
          style={{ width: 0, overflow: "hidden", paddingRight: "1.5rem" }}
        >
          mmetry
        </span>
      </span>

      {/* Tagline — hidden on mobile (no hover), absolutely positioned on desktop */}
      <span
        ref={taglineRef}
        className="hidden md:block absolute left-0 font-mono uppercase text-ink whitespace-nowrap"
        style={{
          top: "calc(100% + 0.3em)",
          fontSize: "var(--text-tagline)",
          letterSpacing: "var(--tracking-tagline)",
          opacity: 0,
        }}
      >
        An Emmet Family Record
      </span>
    </Link>
  );
}

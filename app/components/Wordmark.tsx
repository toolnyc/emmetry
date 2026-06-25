"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, DURATION } from "@/lib/gsap-presets";

/**
 * Logo: a single "E" that expands on hover to reveal "mmetry" and the tagline.
 *
 * Layout approach:
 *  - A wrapper span with overflow:hidden and width:0 hides the suffix from
 *    both layout and view. GSAP animates the wrapper's width to the suffix's
 *    natural pixel width (measured once on mount) on hover.
 *  - The tagline is position:absolute so it never contributes to cell height.
 */
export function Wordmark() {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const suffixRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const naturalWidthRef = useRef<number>(0);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (suffixRef.current) {
      naturalWidthRef.current = suffixRef.current.offsetWidth;
    }
    if (wrapperRef.current) gsap.set(wrapperRef.current, { width: 0 });
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
      .to(wrapperRef.current, {
        width: naturalWidthRef.current,
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
        wrapperRef.current,
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
      {/* Name line */}
      <span
        className="inline-flex items-baseline font-sans font-[400] text-ink leading-none"
        style={{
          fontSize: "var(--text-wordmark)",
          letterSpacing: "var(--tracking-display)",
        }}
      >
        E
        {/* overflow:hidden wrapper — collapses to 0 when hidden.
            paddingBottom + negative marginBottom extend the clip area below
            the baseline so descenders (e.g. "y") are never cut off. */}
        <span
          ref={wrapperRef}
          className="inline-block overflow-hidden"
          style={{ width: 0, paddingBottom: "0.25em", marginBottom: "-0.25em" }}
        >
          <span
            ref={suffixRef}
            className="inline-block whitespace-nowrap"
            style={{ paddingRight: "0.2em" }}
          >
            mmetry
          </span>
        </span>
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { EASE, DURATION } from "@/lib/gsap-presets";

/**
 * Logo: a single "E" that expands on hover to reveal "mmetry" and the
 * tagline. The suffix is revealed via a clip-path wipe; the tagline fades in.
 * Collapses back on mouse-leave. Honors prefers-reduced-motion.
 */
export function Wordmark() {
  const suffixRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    if (suffixRef.current)
      gsap.set(suffixRef.current, { clipPath: "inset(0 100% 0 0)" });
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
        clipPath: "inset(0 0% 0 0)",
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
          clipPath: "inset(0 100% 0 0)",
          duration: r ? 0.01 : DURATION.base,
          ease: EASE.in,
        },
        `-=${DURATION.fast * 0.5}`
      );
  };

  return (
    <Link
      href="/"
      className="block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <span
        className="block font-sans font-[400] text-ink leading-none"
        style={{
          fontSize: "var(--text-wordmark)",
          letterSpacing: "var(--tracking-display)",
        }}
      >
        E
        <span
          ref={suffixRef}
          className="inline-block"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          mmetry
        </span>
      </span>
      <span
        ref={taglineRef}
        className="block font-mono uppercase text-ink mt-1"
        style={{
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

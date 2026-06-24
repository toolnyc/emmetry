"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { EASE, DURATION } from "@/lib/gsap-presets";
import { resolveDisplayName } from "@/lib/names";

/**
 * On desktop, hovering a name reveals its portrait pinned to the cursor. The
 * portrait is position:fixed (viewport coordinates), so it stays under the
 * cursor through scrolling without re-tracking. Gated to pointer-capable wide
 * viewports and faded via opacity. See DESIGN.md (quiet hover portrait).
 */
export function PersonLink({
  id,
  name,
  preferredName,
  photoUrl,
  className,
  style,
}: {
  id: string;
  name: string | null;
  preferredName?: string | null;
  photoUrl?: string | null;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const place = (x: number, y: number) => {
    posRef.current = { x, y };
    const el = imgRef.current;
    if (el) {
      el.style.left = `${x + 16}px`;
      el.style.top = `${y + 16}px`;
    }
  };

  const showPortrait = Boolean(photoUrl) && isDesktop;

  const onLinkEnter = () => {
    if (!linkRef.current) return;
    const r =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(linkRef.current, {
      opacity: 0.55,
      y: -2,
      duration: r ? 0.01 : DURATION.fast,
      ease: EASE.out,
    });
  };

  const onLinkLeave = () => {
    if (!linkRef.current) return;
    const r =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(linkRef.current, {
      opacity: 1,
      y: 0,
      duration: r ? 0.01 : DURATION.base,
      ease: EASE.out,
    });
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={(e) => {
        onLinkEnter();
        if (showPortrait) {
          place(e.clientX, e.clientY);
          setHovered(true);
        }
      }}
      onMouseMove={(e) => {
        if (hovered) place(e.clientX, e.clientY);
      }}
      onMouseLeave={() => {
        onLinkLeave();
        setHovered(false);
      }}
    >
      <Link
        ref={linkRef}
        href={`/people/${id}`}
        className={`cursor-pointer ${className ?? ""}`}
        style={style}
      >
        {resolveDisplayName(name, preferredName)}
      </Link>
      {showPortrait && (
        <img
          ref={imgRef}
          src={photoUrl as string}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed z-50 w-28 border border-rule bg-paper transition-opacity duration-150"
          style={{
            opacity: hovered ? 1 : 0,
            transitionTimingFunction: "var(--ease-standard)",
            left: posRef.current.x + 16,
            top: posRef.current.y + 16,
          }}
        />
      )}
    </span>
  );
}

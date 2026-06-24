/**
 * Shared GSAP animation constants.
 * All timed animations in the site should draw from these values so that
 * timing, easing, and stagger feel consistent everywhere.
 */

export const EASE = {
  out: "power3.out",
  in: "power2.in",
  inOut: "power3.inOut",
} as const;

export const DURATION = {
  fast: 0.15,
  base: 0.3,
  slow: 0.45,
} as const;

export const STAGGER = 0.05;

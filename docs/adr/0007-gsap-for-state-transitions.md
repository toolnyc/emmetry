# GSAP drives accordion and menu state transitions

The site uses GSAP for the smooth expand/collapse of the Generational and
Lineage accordions and the mobile menu slide-up, rather than CSS-only
transitions or another animation library.

## Context

DESIGN.md calls for restrained, archival motion (~150-200ms opacity/position
transitions, a simple accordion expand/collapse, a quiet hover portrait, all
gated by `prefers-reduced-motion`). The earlier design sprint deliberately added
no runtime dependencies.

Two forces pushed past CSS-only motion:

- Animating an accordion from a fixed height to its natural (`auto`) height is
  awkward in pure CSS, and the previous build simply mounted/unmounted content
  with no transition, which read as abrupt.
- We want a single, consistent easing/duration vocabulary across the accordions,
  the mobile menu, and future state changes.

The alternatives were CSS/Tailwind transitions (zero dependency, but clumsy for
height:auto and sequenced motion) and Framer Motion (also a dependency, heavier,
React-coupled). GSAP was chosen for precise, framework-agnostic control of
height/opacity/transform tweens.

## Decision

- Add `gsap` as a runtime dependency.
- A shared `Collapse` component animates height + opacity for the Generational
  and Lineage accordions; children stay mounted so collapse animates in both
  directions.
- The mobile menu panel slides via a GSAP `yPercent` tween in `SiteFooter`.
- All GSAP usage stays inside DESIGN.md's restraint: short durations
  (~0.2-0.3s), opacity/position/height only (no decorative flourishes), and a
  hard `prefers-reduced-motion` branch that snaps to the end state with no tween.

## Consequences

- This overrides the earlier no-new-dependencies stance, hence this record.
- New animated state changes should reuse `Collapse` or the same easing/duration
  vocabulary rather than introducing ad-hoc CSS transitions, to keep motion
  consistent.
- Reversing to CSS-only motion is possible but would reintroduce the
  height:auto problem and lose the shared motion vocabulary, so the choice is
  deliberate.
- GSAP is client-only; animated wrappers are Client Components, which is already
  true of the interactive accordions and footer.

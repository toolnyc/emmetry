# Emmetry — Design Language

The visual and interaction language for the Emmetry rebuild. This is the
companion to `CONTEXT.md`: that file owns the family's words, this one owns how
the record looks and behaves. Tokens are the source of truth in
`app/globals.css` (`@theme`); the contestable decisions are recorded in
`docs/adr/0005-design-language.md`. When something here names a domain concept,
it uses the `CONTEXT.md` vocabulary.

## The one idea

The site is **an archival family record**, not an app. It is near-monochrome
and type-driven. There is one organizing principle:

> **Grey encodes distance from focus.** Solid ink is real content. Oversized
> grey headings are wayfinding, and they fade paler the further they sit from
> what you are looking at. The single red is reserved for one thing: a Union.

Everything below serves that idea.

## Color

Recorded as tokens in `app/globals.css`.

| Token | Value | Role |
|---|---|---|
| `--color-paper` | `#ffffff` | Background. _Tunable knob_: warm archival alt `#faf8f4`. |
| `--color-ink` | `#1a1a1a` | Real content: names, dates, bio. |
| `--color-ghost-strong` | `#9b9b9b` | The open / nearest oversized header. |
| `--color-ghost-mid` | `#c7c7c7` | A collapsed header one step from focus. |
| `--color-ghost-faint` | `#e6e6e6` | A distant / upcoming collapsed header. |
| `--color-rule` | `#e0e0e0` | Hairline dividers. |
| `--color-union` | `#c8102e` | The Union marker only. _Tunable knob._ |
| `--color-footer` | `#2b2b2b` | Dark footer surface. |

Rules:
- Red means **Union**, full stop. It is never a generic highlight, hover, or
  call-to-action color.
- The grey ladder is ordered. Never reach for an off-ladder grey; pick the step
  that matches the element's distance from focus.

## Typography

Two families, self-hosted via `next/font`:

- **Inter** (sans) — names, bio, the giant ghosted headers, the wordmark.
- **IBM Plex Mono** (mono) — the navigation, field labels, the tagline, and the
  tiny stacked life dates.

The scale is **role-driven, not ratio-driven**. Display headers are fluid
(`clamp()`) so they track the viewport; small type is fixed so it stays
legible. See the `--text-*` tokens.

| Role | Token | Notes |
|---|---|---|
| Display / ghosted header | `--text-display` | Fluid `clamp(2.5rem, 8vw, 6rem)`. |
| Wordmark | `--text-wordmark` | Inter `800`, tracking `-0.02em`. |
| Person name | `--text-name` | Inter `400`, fluid. |
| Body / bio | `--text-body` | Inter `400`, line-height `1.6`. |
| Field label | `--text-label` | Mono. |
| Navigation | `--text-nav` | Mono, uppercase, tracking `0.08em`; active = bold. |
| Tagline | `--text-tagline` | Mono, uppercase, tracking `0.12em`. |
| Life dates | `--text-date` | Mono, tiny, two stacked lines (birth over death). |

## Geometry, spacing, motion

- **Rectilinear.** Corners are square (`--radius-none`). The only round shapes
  are the search affordance and the Union dot (`--radius-full`).
- **Spacing** is a `0.25rem`-based scale (`--spacing-*`).
- **Hairlines** for all rules; structure is implied by thin lines and whitespace,
  not boxes or shadows.
- **Motion** is restrained and archival: `~150–200ms` opacity/position
  transitions on the grey ladder, a simple accordion expand/collapse, a quiet
  fade-in for the hover portrait. All gated by `prefers-reduced-motion`.

## Interaction model

One pattern, used everywhere:

> **A ghosted header expands on click to reveal its content; siblings stay
> collapsed as pale labels. One open at a time.**

This drives both the Generation list (one Generation open, the rest ghosted
below) and the detail page's relationship sections (Grandparents, Parents,
Children, Grandchildren). The grey ladder always tells you what is open versus
collapsed.

## Voice and labels

- Public copy uses the family's vocabulary from `CONTEXT.md`. A marriage is a
  **Union**, on the page and in the code.
- Names render **plainly**. The Genealogical ID is never shown inline in a name.
- Identifiers are hidden from the public. Every person has a UUID (URLs, stable
  links); Descendants also carry the hand-assigned descent number as data, but
  it is not surfaced on public pages. See ADR-0001 and ADR-0005.
- There is **no gender field**.

## Component inventory

Named in domain vocabulary. To be built later (this task records only).

| Component | Responsibility |
|---|---|
| `SiteHeader` | Wordmark + tagline, search affordance, ghosted current-name. |
| `Wordmark` | "Emmetry" as live Inter heavy, tight tracking. |
| `ModeNav` | GENERATIONAL · ALPHABETICAL · GEOGRAPHICAL; active is bold. |
| `SiteFooter` | "Menu" trigger on mobile; Info · Login · Submit inline on desktop. |
| `GhostHeader` | The oversized fading section header; ladder step by focus state. |
| `GenerationSection` | Accordion section wrapping one Generation. |
| `AlphaSection` | Accordion section for an alphabetical letter band. |
| `PersonName` | Renders a name plainly; conveys Descendant vs Married-in. |
| `LifeDates` | Stacked mono birth/death. |
| `UnionMarker` | The red dot + "UNION" connector between two people. |
| `LineageColumn` | Detail-page relationship accordion (the one-step neighborhood). |
| `PersonPortrait` | Portrait; reveals on hover in list contexts. |
| `SearchAffordance` | The header search control. |

## Responsive

One mobile-first layout that reflows. Primary breakpoint `--breakpoint-md`
(768px); a wider refinement at `--breakpoint-lg` (1100px). The detail page
stacks on mobile and becomes two-column on desktop (bio left, relationship
accordion right). The footer collapses from the inline bar to a "Menu" trigger
below `md`.

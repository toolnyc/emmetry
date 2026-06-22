# The design language is a near-monochrome, type-driven archival record

Emmetry presents as an archival family record, not an application. The full
language lives in `DESIGN.md`; tokens are the source of truth in
`app/globals.css` (`@theme`). This ADR records the decisions that were
contestable, so later changes are deliberate rather than accidental.

## Decisions

- **Grey encodes distance from focus.** A three-step ghost ladder
  (`ghost-strong` / `ghost-mid` / `ghost-faint`) styles the oversized
  wayfinding headers; `ink` is reserved for real content and `paper` for the
  background. Greys are an ordered ladder, not an open palette.
- **Red means Union, only.** `--color-union` marks a Union (the red dot /
  connector). It is never a generic accent, hover, or call-to-action color. The
  descent line itself is rendered in ink/grey, not red.
- **Two type families.** Inter (sans) for names, bio, display headers, and the
  wordmark; IBM Plex Mono for navigation, labels, the tagline, and life dates.
  The wordmark is live text (Inter heavy, tight tracking), not an image asset.
- **Role-driven, hybrid scale.** Display headers are fluid (`clamp()`); body and
  small type are fixed for legibility. Named role tokens (`--text-display`,
  `--text-name`, `--text-body`, `--text-label`, `--text-date`) rather than a
  single mathematical ratio.
- **One disclosure pattern.** A ghosted header expands on click to reveal its
  content, one open at a time. Used for both Generations and the detail-page
  relationship sections.
- **Restrained motion**, gated by `prefers-reduced-motion`.
- **One reflowing mobile-first layout**, primary breakpoint 768px.
- **Identifiers are hidden from the public.** Every person has a UUID for
  URLs/keys; Descendants additionally keep the hand-assigned descent number as
  data. Neither appears on public pages, and the descent number never renders
  inline in a name. (See ADR-0001 for why the number stays meaningful data.)
- **Public voice is the family's vocabulary.** A marriage is a "Union" on the
  page, matching `CONTEXT.md`. Components are named in domain terms.
- **No gender field**, on the page or in the model. The mock's "Gender" row is
  dropped.

## Considered Options

The recovered mocks were taken as a starting point, not as ground truth. They
were corrected where they contradicted the domain model:

- "MARRIAGE" relabeled to **Union** (the family's word).
- "Generation ID: EMT-14422" removed; it conflated a synthetic key with the
  Genealogical ID. A name-derived hash as the sole identifier was rejected
  because it would break the Descendant/Married-in distinction (everyone has a
  name, Stubs have none) and discard the canonical descent ordering. Resolution:
  a separate opaque UUID for keys, the descent number kept as data.
- "Gender" dropped (absent from the data model; an extra field for a
  non-technical maintainer).
- Inline Genealogical ID in names ("Robert (2) Emmet") rejected as hard to read;
  names render plainly.

A heavier styling approach (component library such as shadcn/MUI, or CSS-in-JS)
was rejected: the design is custom signature patterns, not generic widgets, so
Tailwind v4 with CSS-first `@theme` tokens and hand-built components fits best.

## Consequences

- New UI must pick a grey from the ladder by focus distance, and must not
  introduce red for anything but a Union.
- Adding a public-facing identifier display would contradict this ADR and
  ADR-0001; reopen both if that need arises.
- The component inventory in `DESIGN.md` is the naming contract; new components
  use `CONTEXT.md` vocabulary.

# Custom scrollbars use OverlayScrollbars, not native scrollbar CSS

The page's vertical scrollbar and the Generational children rail's horizontal
scrollbar are rendered by the OverlayScrollbars library, rather than styled
native scrollbars.

## Context

DESIGN.md wants persistent, square, grey-ladder scrollbars (a rule-grey track
with a ghost-strong thumb) on both axes, consistent with the archival look.

Native scrollbar styling cannot deliver this consistently:

- WebKit/Blink (Chrome, Safari, Edge) expose `::-webkit-scrollbar*`, which gives
  full control (pixel size, track/thumb boxes, square corners).
- Firefox (Gecko) exposes only `scrollbar-width: auto | thin | none` and
  `scrollbar-color: <thumb> <track>` — no pixel width, no track box, no corner
  control.
- The two mechanisms are mutually exclusive: Blink **disables**
  `::-webkit-scrollbar` styling for any element that also sets the standard
  `scrollbar-width`/`scrollbar-color`.

The result was a 10px square custom bar in Chrome but only a thin OS-shaped
colored bar in Firefox, which on the slim children rail read as a stray
underline. Several CSS-only iterations confirmed no native approach makes the
two engines match.

## Decision

- Add `overlayscrollbars` + `overlayscrollbars-react` as runtime dependencies.
- Initialize OverlayScrollbars on `document.body` (via `BodyScrollbar`) for the
  page's vertical scrollbar, and wrap the children rail in
  `OverlayScrollbarsComponent` for its horizontal scrollbar.
- Style both through a single `.os-theme-emmetry` theme that maps the library's
  `--os-*` variables onto our design tokens (square corners, rule track,
  ghost-strong thumb, ink on hover), with `autoHide: "never"` so the bars are
  persistent like the mocks.
- Remove the native `::-webkit-scrollbar` / `scrollbar-*` rules they replace.

## Consequences

- This adds a dependency and lets a library restructure the body DOM, hence this
  record. Fixed-position chrome (header, footer, progress bar) is unaffected
  because it is positioned against the real viewport.
- Scrollbars are now pixel-identical across browsers and fully match the tokens,
  which native CSS could not achieve.
- New scroll containers that must look custom should reuse
  `OverlayScrollbarsComponent` with the `os-theme-emmetry` theme rather than
  re-introducing native scrollbar CSS.
- Reverting to native scrollbars would reintroduce the cross-engine mismatch, so
  the choice is deliberate.

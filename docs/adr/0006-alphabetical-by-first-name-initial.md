# The Alphabetical view groups by first-name initial

The Alphabetical browse mode groups people under the initial letter of their
**first name**, not their surname.

## Context

Almost everyone in the record shares the surname "Emmet". Grouping by surname
initial would collapse the entire family under a single letter (E), making the
Alphabetical mode useless as a wayfinding aid. The reference mock confirms the
intent: it lists "Andrea Stevens", "Adam Emmet", and "Andy Emmet" together under
**A**.

## Decision

- Group every named person (Descendants and Married-in alike) by the uppercased
  first character of their displayed name.
- Unnamed Stubs are excluded (they have no initial to sort under).
- All A–Z letters render as ghost headers; empty letters sit as faint ghost
  labels, consistent with the grey-encodes-distance ladder in ADR-0005.
- Names sort alphabetically within each letter.

## Consequences

- This is surprising to anyone expecting genealogical surname ordering, hence
  this record.
- Reversing to surname grouping is a single grouping-key change, but would
  re-shape the whole view, so the choice is deliberate.
- Married-in people are first-class entries here (unlike the Generational view,
  where they appear only beside a Descendant via a Union).

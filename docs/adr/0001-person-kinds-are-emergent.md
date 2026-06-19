# Person kinds are emergent from data, not a stored type

A person is either a Descendant or Married-in (see `CONTEXT.md`). We deliberately do **not** model this with a `role`/`type` column on `people`. The distinction is emergent from two nullable fields: a Descendant has a Genealogical ID; the Married-in has neither a Genealogical ID nor Parentage. The Root is the one Descendant with a Genealogical ID and no Parentage.

## Considered Options

An explicit `role` enum (`member` | `spouse`) was considered (Candidate 3 of the initial architecture review). Rejected: the Genealogical ID is hand-assigned and must be stored regardless, so it already marks descent membership. An enum would duplicate that signal and could drift out of sync with it.

## Consequences

- Listing a Generation filters on `genealogical_id IS NOT NULL`, not a type column.
- The model self-validates: exactly one Descendant should have no Parentage (the Root). If two do, that is a missing Parentage link — a data gap, not a second Root.
- The cell "no Genealogical ID + has Parentage" should never occur; it is a useful integrity assertion after migration.

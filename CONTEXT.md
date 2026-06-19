# Emmetry

The domain language for the Emmetry rebuild — a genealogy site documenting the descent from Thomas Addis Emmet and Jane Patten through six generations. These terms are the foundation; code and schema are expressions of them, not the other way around.

## Language

### Lineage and structure

**Lineage**:
The family's line of descent from the Founders. A given person's *Lineage* is also their immediate place in it: parents above, union(s) beside, children below — the whole one-step neighborhood a person's page renders.
_Avoid_: family tree, relationships, kin, getFamily

**Generation**:
A named band of descent: Founders, 1st through 6th. Anyone holding a Genealogical ID belongs to exactly one.
_Avoid_: cohort, level, tier

**Genealogical ID**:
The family's canonical, hand-assigned descent number (e.g. *Robert (2) Emmet*). Present for a Descendant, absent for the Married-in. Its presence is what marks membership in the descent — it is not merely a display label.
_Avoid_: genid, person number

**Parentage**:
The parent/child link that threads the descent across Generations.
_Avoid_: parent_child edge, ancestry link

**Union**:
The family's word for a marriage. Joins two people, at least one a Descendant; the other may be Married-in or, in a cousin marriage, also a Descendant. Carries a date and place.
_Avoid_: marriage, partnership

### Kinds of person

The two kinds are not a stored type. They are emergent from the data: a person's Genealogical ID and Parentage together say which they are. See `docs/adr/0001-*`.

**Descendant**:
A person in the bloodline. Has a Genealogical ID and belongs to a Generation.
_Avoid_: member, blood relative

**Married-in**:
A person known to the site only through a Union. Has neither a Genealogical ID nor Parentage.
_Avoid_: spouse, in-law, non-member

**Root**:
The single head of the descent (Thomas Addis Emmet) — the one Descendant with a Genealogical ID but no Parentage. Identified by inference, not a stored flag.
_Avoid_: origin, ancestor zero, patriarch

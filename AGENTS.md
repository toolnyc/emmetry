# Emmetry — Agent Context

## What This Is

A rebuild of emmetry.org — a family genealogy and history site documenting six generations of Emmets. The site went offline ~3 years ago. Content has been recovered from the Wayback Machine.

---

## Stack

- **Frontend**: Astro (SSG), hosted on Cloudflare Pages
- **Database**: Neon (serverless Postgres), raw SQL via `@neondatabase/serverless`
- **Media**: Cloudflare R2 (images, audio voice notes)
- **Admin**: Astro SSR at `/admin/*`, session cookie auth, Tiptap for rich text
- **Rebuild**: Cloudflare Pages deploy hook
---

## Data Model

133 individuals across 7 generations (Founders through 6th). Domain vocabulary lives in `CONTEXT.md`; read it before naming anything. Core tables:

- `people` — biographical records, photo_url, audio_url. `genealogical_id` and `generation` are nullable: a Descendant has both, a Married-in person has neither.
- `unions` — Unions (marriages), joining two people with date and place. At least one is a Descendant; cousin marriages mean both can be.
- `parent_child` — Parentage links.
- `sessions` — admin auth sessions

Relationships are strictly Parentage and Union. No complex graph edges.

The Descendant vs. Married-in distinction is **emergent**, not a stored type — see `docs/adr/0001-person-kinds-are-emergent.md`. The Root (Thomas Addis Emmet) is the one Descendant with a Genealogical ID and no Parentage; exactly one such record should exist, which doubles as a post-migration integrity check.

---

## Repo Structure

```
archive/          recovered Wayback Machine content
  extracts/
    CATALOG.md          structured extract of all 133 people
  site/               raw HTML files (emmetry.org and www.emmetry.org)

```

---

## Content Status

- 301 HTML pages recovered
- 79 images recovered (portraits, crests, site assets)
- 133 people fully cataloged in `archive/extracts/CATALOG.md`
- Migration to Neon: not yet done — pending schema creation and migration script

---

## Key Constraints

- Jesse is non-technical. Admin UI must be simple: find a person, edit a field, save.
- Edits will be infrequent (a few times a year). Polish matters less than clarity.
- Pete handles all initial content migration via script — admin is for ongoing maintenance only.
- Site must be live at emmetry.org. DNS currently on DreamHost — confirm transfer to Cloudflare.
- Audio (voice notes) is a future feature, not launch requirement.

---

## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

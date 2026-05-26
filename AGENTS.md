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

133 individuals across 7 generations (Founders through 6th). Core tables:

- `people` — biographical records, photo_url, audio_url
- `unions` — marriages, linking two people with date and place
- `parent_child` — parent/child relationships
- `sessions` — admin auth sessions


Relationships are strictly parent/child and marriage. No complex graph edges.

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

# Search is a static JSON index, not live database queries

The site has 133 people. Edits are infrequent (a few times a year) and every admin save triggers a Vercel redeploy. A full JSON dump of all person records is small enough to search client-side (Fuse.js or equivalent) with no perceptible latency. Rebuilding the index on each deploy means search is effectively real-time from an editor's perspective. A live database query path would add infrastructure complexity with no user-visible benefit at this scale.

## Considered Options

Live Postgres queries via a Next.js API route were considered. Rejected because the dataset is tiny and static, the database is only needed for admin writes, and a serverless query adds latency and cold-start risk that a pre-baked index avoids entirely.

## Consequences

- If the dataset grows significantly beyond its current size or search requirements become complex (faceted filters, fuzzy ranking), this decision should be revisited.
- Audio transcripts, if added later, should be included in the index as a text field on the person record.

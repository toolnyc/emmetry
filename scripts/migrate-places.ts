import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONN_STRING!);

async function main() {
  console.log("Creating places table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "places" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "name" text NOT NULL UNIQUE,
      "lat" double precision,
      "lng" double precision,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `;

  console.log("Collecting distinct place strings...");
  await sql`
    INSERT INTO "places" ("name")
    SELECT DISTINCT birth_place FROM "people"
    WHERE birth_place IS NOT NULL AND birth_place <> ''
    ON CONFLICT ("name") DO NOTHING
  `;
  await sql`
    INSERT INTO "places" ("name")
    SELECT DISTINCT death_place FROM "people"
    WHERE death_place IS NOT NULL AND death_place <> ''
    ON CONFLICT ("name") DO NOTHING
  `;
  await sql`
    INSERT INTO "places" ("name")
    SELECT DISTINCT place FROM "unions"
    WHERE place IS NOT NULL AND place <> ''
    ON CONFLICT ("name") DO NOTHING
  `;

  const placeRows = (await sql`SELECT id, name FROM "places"`) as { id: string; name: string }[];
  console.log(`  ${placeRows.length} distinct places`);

  console.log("Adding FK columns...");
  await sql`
    ALTER TABLE "people"
    ADD COLUMN IF NOT EXISTS "birth_place_id" uuid REFERENCES "places"("id"),
    ADD COLUMN IF NOT EXISTS "death_place_id" uuid REFERENCES "places"("id")
  `;
  await sql`
    ALTER TABLE "unions"
    ADD COLUMN IF NOT EXISTS "place_id" uuid REFERENCES "places"("id")
  `;

  console.log("Wiring FKs from existing text values...");
  await sql`
    UPDATE "people" p
    SET "birth_place_id" = pl."id"
    FROM "places" pl
    WHERE p."birth_place" = pl."name"
      AND p."birth_place" IS NOT NULL
      AND p."birth_place_id" IS NULL
  `;
  await sql`
    UPDATE "people" p
    SET "death_place_id" = pl."id"
    FROM "places" pl
    WHERE p."death_place" = pl."name"
      AND p."death_place" IS NOT NULL
      AND p."death_place_id" IS NULL
  `;
  await sql`
    UPDATE "unions" u
    SET "place_id" = pl."id"
    FROM "places" pl
    WHERE u."place" = pl."name"
      AND u."place" IS NOT NULL
      AND u."place_id" IS NULL
  `;

  console.log("Dropping old text columns...");
  await sql`ALTER TABLE "people" DROP COLUMN IF EXISTS "birth_place"`;
  await sql`ALTER TABLE "people" DROP COLUMN IF EXISTS "death_place"`;
  await sql`ALTER TABLE "unions" DROP COLUMN IF EXISTS "place"`;

  const birthWired = (await sql`
    SELECT COUNT(*) AS n FROM "people" WHERE "birth_place_id" IS NOT NULL
  `) as { n: string }[];
  const deathWired = (await sql`
    SELECT COUNT(*) AS n FROM "people" WHERE "death_place_id" IS NOT NULL
  `) as { n: string }[];
  console.log(
    `\nDone. ${birthWired[0].n} birth FKs, ${deathWired[0].n} death FKs wired.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

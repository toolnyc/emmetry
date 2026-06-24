import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_CONN_STRING!);

const BAD = [
  "unknown",
  "unknonwn",
  "killed in action over Germany (near Ulm) while in the US Army Air Force",
];

async function main() {
  for (const name of BAD) {
    const r = (await sql`
      UPDATE "places" SET lat = null, lng = null, updated_at = now()
      WHERE name = ${name} AND lat IS NOT NULL
      RETURNING name
    `) as { name: string }[];
    if (r.length) console.log("reset:", r[0].name);
  }
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

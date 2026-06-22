import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_CONN_STRING!,
  },
} satisfies Config;

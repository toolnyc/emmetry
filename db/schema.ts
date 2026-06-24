import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  genealogicalId: text("genealogical_id"),
  generation: text("generation"),
  birthDate: text("birth_date"),
  birthPlace: text("birth_place"),
  deathDate: text("death_date"),
  deathPlace: text("death_place"),
  preferredName: text("preferred_name"),
  bio: text("bio"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const unions = pgTable("unions", {
  id: uuid("id").primaryKey().defaultRandom(),
  personAId: uuid("person_a_id").references(() => people.id).notNull(),
  personBId: uuid("person_b_id").references(() => people.id).notNull(),
  date: text("date"),
  place: text("place"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const parentChild = pgTable("parent_child", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => people.id).notNull(),
  childId: uuid("child_id").references(() => people.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type Union = typeof unions.$inferSelect;
export type NewUnion = typeof unions.$inferInsert;
export type ParentChild = typeof parentChild.$inferSelect;
export type NewParentChild = typeof parentChild.$inferInsert;

import { pgTable, text, uuid, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  genealogicalId: text("genealogical_id"),
  generation: text("generation"),
  birthDate: text("birth_date"),
  birthPlaceId: uuid("birth_place_id").references(() => places.id),
  deathDate: text("death_date"),
  deathPlaceId: uuid("death_place_id").references(() => places.id),
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
  placeId: uuid("place_id").references(() => places.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const parentChild = pgTable("parent_child", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id").references(() => people.id).notNull(),
  childId: uuid("child_id").references(() => people.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;
export type Person = typeof people.$inferSelect;
export type NewPerson = typeof people.$inferInsert;
export type Union = typeof unions.$inferSelect;
export type NewUnion = typeof unions.$inferInsert;
export type ParentChild = typeof parentChild.$inferSelect;
export type NewParentChild = typeof parentChild.$inferInsert;

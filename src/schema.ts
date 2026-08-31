import { double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const hotspots = mysqlTable("hotspots", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }).notNull().unique(),
  latitude: double("latitude").notNull(),
  longitude: double("longitude").notNull(),
  detectedAt: timestamp("detectedAt").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  satelliteConfidence: double("satelliteConfidence"),
  classification: mysqlEnum("classification", ["industrial", "wildfire", "agricultural", "gas_flare", "mining", "unknown"]).default("unknown").notNull(),
  assessmentConfidence: double("assessmentConfidence"),
  industrialRisk: double("industrialRisk"),
  evidenceJson: text("evidenceJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hotspot = typeof hotspots.$inferSelect;
export type InsertHotspot = typeof hotspots.$inferInsert;

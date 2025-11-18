import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Reference: Replit Auth blueprint integration for authentication
// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const classPasses = pgTable("class_passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  studioName: text("studio_name").notNull(),
  trackingType: text("tracking_type").notNull().default('class_pack'), // 'class_pack' or 'usage_based'
  
  // Class pack fields (only used when trackingType = 'class_pack')
  totalClasses: integer("total_classes"),
  remainingClasses: integer("remaining_classes"),
  
  // Usage-based fields (only used when trackingType = 'usage_based')
  unitType: text("unit_type"), // e.g., 'hours', 'sessions', 'visits'
  costPerUnit: integer("cost_per_unit"), // cost per hour/session in cents
  membershipFee: integer("membership_fee"), // yearly/monthly membership fee in cents
  membershipPeriod: text("membership_period"), // 'yearly', 'monthly', 'one_time'
  
  purchaseDate: timestamp("purchase_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  cost: integer("cost").notNull(), // cost in cents (for class packs) or membership fee (for usage-based)
  notes: text("notes"),
  archived: boolean("archived").notNull().default(false),
});

export const classBookings = pgTable("class_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  passId: varchar("pass_id").notNull(),
  className: text("class_name").notNull(),
  instructorName: text("instructor_name"),
  classDate: timestamp("class_date").notNull(),
  checkedIn: timestamp("checked_in").notNull(),
});

// Usage sessions for usage-based tracking
export const usageSessions = pgTable("usage_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  passId: varchar("pass_id").notNull().references(() => classPasses.id, { onDelete: 'cascade' }),
  sessionDate: timestamp("session_date").notNull(),
  units: doublePrecision("units").notNull(), // decimal units (e.g., 2.5 hours)
  costPerUnit: integer("cost_per_unit").notNull(), // actual rate used for this session in cents (can be overridden)
  cost: integer("cost").notNull(), // auto-calculated cost in cents (units * costPerUnit)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for class pack type
const classPackFields = z.object({
  totalClasses: z.number().min(1).max(999),
  studioName: z.string().min(1).max(100),
  cost: z.number().min(0),
  notes: z.string().optional(),
  expirationDate: z.date().optional(),
  trackingType: z.literal('class_pack'),
});

// Insert schema for usage-based type
const usageBasedFields = z.object({
  studioName: z.string().min(1).max(100),
  unitType: z.string().min(1).max(50),
  costPerUnit: z.number().min(0),
  membershipFee: z.number().min(0).optional(),
  membershipPeriod: z.enum(['yearly', 'monthly', 'one_time']).optional(),
  cost: z.number().min(0), // stores the membership fee
  notes: z.string().optional(),
  expirationDate: z.date().optional(),
  trackingType: z.literal('usage_based'),
});

// Union schema that accepts either type
export const insertClassPassSchema = z.discriminatedUnion('trackingType', [
  classPackFields,
  usageBasedFields,
]);

// Schema for updating class passes - only allow specific fields
export const updateClassPassSchema = z.object({
  studioName: z.string().min(1).max(100).optional(),
  expirationDate: z.date().optional(),
  notes: z.string().optional(),
  remainingClasses: z.number().min(0).max(999).optional(),
  totalClasses: z.number().min(1).max(999).optional(),
  cost: z.number().min(0).optional(),
  archived: z.boolean().optional(),
});

export const insertClassBookingSchema = createInsertSchema(classBookings).omit({
  id: true,
  checkedIn: true,
});

// Insert schema for usage sessions
export const insertUsageSessionSchema = createInsertSchema(usageSessions).omit({
  id: true,
  passId: true, // will be provided in API route
  cost: true, // auto-calculated from units * costPerUnit
  costPerUnit: true, // optional override, defaults to pass.costPerUnit
  createdAt: true,
}).extend({
  sessionDate: z.date(),
  units: z.number().min(0.1).max(999),
  costPerUnit: z.number().int().positive().optional(), // optional override in cents
  notes: z.string().optional(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type ClassPass = typeof classPasses.$inferSelect;
export type InsertClassPass = z.infer<typeof insertClassPassSchema>;
export type UpdateClassPass = z.infer<typeof updateClassPassSchema>;
export type ClassBooking = typeof classBookings.$inferSelect;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;
export type UsageSession = typeof usageSessions.$inferSelect;
export type InsertUsageSession = z.infer<typeof insertUsageSessionSchema>;

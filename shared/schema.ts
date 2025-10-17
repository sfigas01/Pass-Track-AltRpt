import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
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
  totalClasses: integer("total_classes").notNull(),
  remainingClasses: integer("remaining_classes").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  cost: integer("cost").notNull(), // cost in cents to avoid decimal issues
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

export const insertClassPassSchema = createInsertSchema(classPasses).omit({
  id: true,
  userId: true, // userId will be added from authenticated session
  remainingClasses: true,
  purchaseDate: true,
  archived: true,
}).extend({
  totalClasses: z.number().min(1).max(999),
  studioName: z.string().min(1).max(100),
  cost: z.number().min(0), // cost in cents
  notes: z.string().optional(),
  expirationDate: z.date().optional(),
});

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

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type ClassPass = typeof classPasses.$inferSelect;
export type InsertClassPass = z.infer<typeof insertClassPassSchema>;
export type UpdateClassPass = z.infer<typeof updateClassPassSchema>;
export type ClassBooking = typeof classBookings.$inferSelect;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;

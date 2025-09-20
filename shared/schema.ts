import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const classPasses = pgTable("class_passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studioName: text("studio_name").notNull(),
  totalClasses: integer("total_classes").notNull(),
  remainingClasses: integer("remaining_classes").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  expirationDate: timestamp("expiration_date"),
  cost: integer("cost").notNull(), // cost in cents to avoid decimal issues
  notes: text("notes"),
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
  remainingClasses: true,
  purchaseDate: true,
}).extend({
  totalClasses: z.number().min(1).max(50),
  studioName: z.string().min(1).max(100),
  cost: z.number().min(0), // cost in cents
  notes: z.string().optional(),
  expirationDate: z.date().optional(),
});

export const insertClassBookingSchema = createInsertSchema(classBookings).omit({
  id: true,
  checkedIn: true,
});

export type ClassPass = typeof classPasses.$inferSelect;
export type InsertClassPass = z.infer<typeof insertClassPassSchema>;
export type ClassBooking = typeof classBookings.$inferSelect;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;

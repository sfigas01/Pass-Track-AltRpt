import { type ClassPass, type InsertClassPass, type ClassBooking, type InsertClassBooking, classPasses, classBookings } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getClassPass(id: string): Promise<ClassPass | undefined>;
  getAllClassPasses(): Promise<ClassPass[]>;
  createClassPass(pass: InsertClassPass & { purchaseDate: Date }): Promise<ClassPass>;
  updateClassPass(id: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined>;
  deleteClassPass(id: string): Promise<boolean>;
  
  getClassBooking(id: string): Promise<ClassBooking | undefined>;
  getClassBookingsByPassId(passId: string): Promise<ClassBooking[]>;
  createClassBooking(booking: InsertClassBooking): Promise<ClassBooking>;
}

export class DatabaseStorage implements IStorage {
  async getClassPass(id: string): Promise<ClassPass | undefined> {
    const [pass] = await db.select().from(classPasses).where(eq(classPasses.id, id));
    return pass || undefined;
  }

  async getAllClassPasses(): Promise<ClassPass[]> {
    return await db.select().from(classPasses);
  }

  async createClassPass(insertPass: InsertClassPass & { purchaseDate: Date }): Promise<ClassPass> {
    const [pass] = await db
      .insert(classPasses)
      .values({
        studioName: insertPass.studioName,
        totalClasses: insertPass.totalClasses,
        remainingClasses: insertPass.totalClasses,
        purchaseDate: insertPass.purchaseDate,
        expirationDate: insertPass.expirationDate,
        cost: insertPass.cost,
        notes: insertPass.notes || null,
      })
      .returning();
    return pass;
  }

  async updateClassPass(id: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined> {
    const [updatedPass] = await db
      .update(classPasses)
      .set(updates)
      .where(eq(classPasses.id, id))
      .returning();
    return updatedPass || undefined;
  }

  async deleteClassPass(id: string): Promise<boolean> {
    const result = await db
      .delete(classPasses)
      .where(eq(classPasses.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getClassBooking(id: string): Promise<ClassBooking | undefined> {
    const [booking] = await db.select().from(classBookings).where(eq(classBookings.id, id));
    return booking || undefined;
  }

  async getClassBookingsByPassId(passId: string): Promise<ClassBooking[]> {
    return await db.select().from(classBookings).where(eq(classBookings.passId, passId));
  }

  async createClassBooking(insertBooking: InsertClassBooking): Promise<ClassBooking> {
    const [booking] = await db
      .insert(classBookings)
      .values({
        ...insertBooking,
        instructorName: insertBooking.instructorName ?? null,
        checkedIn: new Date(),
      })
      .returning();
    return booking;
  }
}

export const storage = new DatabaseStorage();
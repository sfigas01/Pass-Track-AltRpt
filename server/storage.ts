// Reference: Replit Auth blueprint integration for user operations
import { type User, type UpsertUser, type ClassPass, type InsertClassPass, type ClassBooking, type InsertClassBooking, users, classPasses, classBookings } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Class pass operations - now filtered by userId for security
  getClassPass(id: string, userId: string): Promise<ClassPass | undefined>;
  getAllClassPasses(userId: string): Promise<ClassPass[]>;
  createClassPass(pass: InsertClassPass & { purchaseDate: Date; userId: string }): Promise<ClassPass>;
  updateClassPass(id: string, userId: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined>;
  deleteClassPass(id: string, userId: string): Promise<boolean>;
  archiveClassPass(id: string, userId: string): Promise<ClassPass | undefined>;
  unarchiveClassPass(id: string, userId: string): Promise<ClassPass | undefined>;
  
  getClassBooking(id: string): Promise<ClassBooking | undefined>;
  getClassBookingsByPassId(passId: string): Promise<ClassBooking[]>;
  createClassBooking(booking: InsertClassBooking): Promise<ClassBooking>;
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Class pass operations - now filtered by userId for security
  async getClassPass(id: string, userId: string): Promise<ClassPass | undefined> {
    const [pass] = await db.select().from(classPasses)
      .where(and(eq(classPasses.id, id), eq(classPasses.userId, userId)));
    return pass || undefined;
  }

  async getAllClassPasses(userId: string): Promise<ClassPass[]> {
    return await db.select().from(classPasses)
      .where(eq(classPasses.userId, userId))
      .orderBy(classPasses.purchaseDate);
  }

  async createClassPass(insertPass: InsertClassPass & { purchaseDate: Date; userId: string }): Promise<ClassPass> {
    const [pass] = await db
      .insert(classPasses)
      .values({
        userId: insertPass.userId,
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

  async updateClassPass(id: string, userId: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined> {
    const [updatedPass] = await db
      .update(classPasses)
      .set(updates)
      .where(and(eq(classPasses.id, id), eq(classPasses.userId, userId)))
      .returning();
    return updatedPass || undefined;
  }

  async deleteClassPass(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(classPasses)
      .where(and(eq(classPasses.id, id), eq(classPasses.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async archiveClassPass(id: string, userId: string): Promise<ClassPass | undefined> {
    return this.updateClassPass(id, userId, { archived: true });
  }

  async unarchiveClassPass(id: string, userId: string): Promise<ClassPass | undefined> {
    return this.updateClassPass(id, userId, { archived: false });
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
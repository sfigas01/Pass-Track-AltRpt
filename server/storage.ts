// Reference: Replit Auth blueprint integration for user operations
import { type User, type UpsertUser, type ClassPass, type InsertClassPass, type ClassBooking, type InsertClassBooking, type UsageSession, type InsertUsageSession, users, classPasses, classBookings, usageSessions } from "@shared/schema";
import { db } from "./db";
import { eq, and, sum, count } from "drizzle-orm";

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
  
  // Usage session operations - for usage-based tracking
  getUsageSessions(passId: string, userId: string): Promise<UsageSession[]>;
  createUsageSession(passId: string, userId: string, session: InsertUsageSession): Promise<UsageSession>;
  getUsageAnalytics(passId: string, userId: string): Promise<{ totalUnits: number; totalCost: number; sessionCount: number }>;
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
    // Handle both class pack and usage-based tracking types
    const baseValues = {
      userId: insertPass.userId,
      studioName: insertPass.studioName,
      trackingType: insertPass.trackingType,
      purchaseDate: insertPass.purchaseDate,
      expirationDate: insertPass.expirationDate,
      cost: insertPass.cost,
      notes: insertPass.notes || null,
    };

    let values;
    if (insertPass.trackingType === 'class_pack') {
      values = {
        ...baseValues,
        totalClasses: insertPass.totalClasses,
        remainingClasses: insertPass.totalClasses,
      };
    } else {
      // usage_based
      values = {
        ...baseValues,
        unitType: insertPass.unitType,
        costPerUnit: insertPass.costPerUnit,
        membershipFee: insertPass.membershipFee || null,
        membershipPeriod: insertPass.membershipPeriod || null,
      };
    }

    const [pass] = await db
      .insert(classPasses)
      .values(values)
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

  // Usage session operations - for usage-based tracking
  async getUsageSessions(passId: string, userId: string): Promise<UsageSession[]> {
    // Verify the pass belongs to the user
    const pass = await this.getClassPass(passId, userId);
    if (!pass) {
      return [];
    }

    return await db
      .select()
      .from(usageSessions)
      .where(eq(usageSessions.passId, passId))
      .orderBy(usageSessions.sessionDate);
  }

  async createUsageSession(passId: string, userId: string, session: InsertUsageSession): Promise<UsageSession> {
    // Verify the pass belongs to the user and is usage-based
    const pass = await this.getClassPass(passId, userId);
    if (!pass || pass.trackingType !== 'usage_based') {
      throw new Error('Invalid pass or not a usage-based tracking pass');
    }

    // Use override costPerUnit if provided, otherwise use the pass's default rate
    const costPerUnit = session.costPerUnit ?? pass.costPerUnit ?? 0;
    
    // Calculate cost: units * costPerUnit
    const cost = Math.round(session.units * costPerUnit);

    const [usageSession] = await db
      .insert(usageSessions)
      .values({
        passId,
        sessionDate: session.sessionDate,
        units: session.units,
        costPerUnit,
        cost,
        notes: session.notes || null,
      })
      .returning();

    return usageSession;
  }

  async getUsageAnalytics(passId: string, userId: string): Promise<{ totalUnits: number; totalCost: number; sessionCount: number }> {
    // Verify the pass belongs to the user
    const pass = await this.getClassPass(passId, userId);
    if (!pass) {
      return { totalUnits: 0, totalCost: 0, sessionCount: 0 };
    }

    const result = await db
      .select({
        totalUnits: sum(usageSessions.units),
        totalCost: sum(usageSessions.cost),
        sessionCount: count(),
      })
      .from(usageSessions)
      .where(eq(usageSessions.passId, passId));

    const data = result[0];
    return {
      totalUnits: Number(data.totalUnits) || 0,
      totalCost: Number(data.totalCost) || 0,
      sessionCount: Number(data.sessionCount) || 0,
    };
  }
}

export const storage = new DatabaseStorage();
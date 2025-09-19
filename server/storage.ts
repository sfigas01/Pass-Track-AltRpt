import { type ClassPass, type InsertClassPass, type ClassBooking, type InsertClassBooking } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getClassPass(id: string): Promise<ClassPass | undefined>;
  getAllClassPasses(): Promise<ClassPass[]>;
  createClassPass(pass: InsertClassPass): Promise<ClassPass>;
  updateClassPass(id: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined>;
  deleteClassPass(id: string): Promise<boolean>;
  
  getClassBooking(id: string): Promise<ClassBooking | undefined>;
  getClassBookingsByPassId(passId: string): Promise<ClassBooking[]>;
  createClassBooking(booking: InsertClassBooking): Promise<ClassBooking>;
}

export class MemStorage implements IStorage {
  private classPasses: Map<string, ClassPass>;
  private classBookings: Map<string, ClassBooking>;

  constructor() {
    this.classPasses = new Map();
    this.classBookings = new Map();
  }

  async getClassPass(id: string): Promise<ClassPass | undefined> {
    return this.classPasses.get(id);
  }

  async getAllClassPasses(): Promise<ClassPass[]> {
    return Array.from(this.classPasses.values());
  }

  async createClassPass(insertPass: InsertClassPass): Promise<ClassPass> {
    const id = randomUUID();
    const pass: ClassPass = { 
      ...insertPass, 
      id,
      remainingClasses: insertPass.totalClasses
    };
    this.classPasses.set(id, pass);
    return pass;
  }

  async updateClassPass(id: string, updates: Partial<ClassPass>): Promise<ClassPass | undefined> {
    const existingPass = this.classPasses.get(id);
    if (!existingPass) return undefined;
    
    const updatedPass = { ...existingPass, ...updates };
    this.classPasses.set(id, updatedPass);
    return updatedPass;
  }

  async deleteClassPass(id: string): Promise<boolean> {
    return this.classPasses.delete(id);
  }

  async getClassBooking(id: string): Promise<ClassBooking | undefined> {
    return this.classBookings.get(id);
  }

  async getClassBookingsByPassId(passId: string): Promise<ClassBooking[]> {
    return Array.from(this.classBookings.values()).filter(
      booking => booking.passId === passId
    );
  }

  async createClassBooking(insertBooking: InsertClassBooking): Promise<ClassBooking> {
    const id = randomUUID();
    const booking: ClassBooking = { 
      ...insertBooking,
      instructorName: insertBooking.instructorName ?? null,
      id,
      checkedIn: new Date()
    };
    this.classBookings.set(id, booking);
    return booking;
  }
}

export const storage = new MemStorage();

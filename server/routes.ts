import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClassPassSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Class Passes API Routes
  
  // GET /api/class-passes - Get all class passes
  app.get("/api/class-passes", async (req, res) => {
    try {
      const passes = await storage.getAllClassPasses();
      res.json(passes);
    } catch (error) {
      console.error("Error fetching class passes:", error);
      res.status(500).json({ message: "Failed to fetch class passes" });
    }
  });

  // GET /api/class-passes/:id - Get a specific class pass
  app.get("/api/class-passes/:id", async (req, res) => {
    try {
      const pass = await storage.getClassPass(req.params.id);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.json(pass);
    } catch (error) {
      console.error("Error fetching class pass:", error);
      res.status(500).json({ message: "Failed to fetch class pass" });
    }
  });

  // POST /api/class-passes - Create a new class pass
  app.post("/api/class-passes", async (req, res) => {
    try {
      const passData = insertClassPassSchema.parse({
        ...req.body,
        expirationDate: new Date(req.body.expirationDate)
      });

      const newPass = await storage.createClassPass({
        ...passData,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date()
      });
      res.status(201).json(newPass);
    } catch (error) {
      console.error("Error creating class pass:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class pass" });
    }
  });

  // PUT /api/class-passes/:id - Update a class pass
  app.put("/api/class-passes/:id", async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.expirationDate) {
        updates.expirationDate = new Date(updates.expirationDate);
      }
      if (updates.purchaseDate) {
        updates.purchaseDate = new Date(updates.purchaseDate);
      }

      const updatedPass = await storage.updateClassPass(req.params.id, updates);
      if (!updatedPass) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.json(updatedPass);
    } catch (error) {
      console.error("Error updating class pass:", error);
      res.status(500).json({ message: "Failed to update class pass" });
    }
  });

  // DELETE /api/class-passes/:id - Delete a class pass
  app.delete("/api/class-passes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteClassPass(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class pass:", error);
      res.status(500).json({ message: "Failed to delete class pass" });
    }
  });

  // POST /api/class-passes/:id/check-in - Check in to a class
  app.post("/api/class-passes/:id/check-in", async (req, res) => {
    try {
      const pass = await storage.getClassPass(req.params.id);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }

      if (pass.remainingClasses <= 0) {
        return res.status(400).json({ message: "No remaining classes" });
      }

      const updatedPass = await storage.updateClassPass(req.params.id, {
        remainingClasses: pass.remainingClasses - 1
      });

      res.json(updatedPass);
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

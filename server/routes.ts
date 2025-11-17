// Reference: Updated with Replit Auth authentication and security improvements
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClassPassSchema, updateClassPassSchema, insertUsageSessionSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication - must be first
  await setupAuth(app);

  // Auth route - get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user");
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Class Passes API Routes - All protected with authentication
  
  // GET /api/class-passes - Get all class passes for authenticated user
  app.get("/api/class-passes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const passes = await storage.getAllClassPasses(userId);
      res.json(passes);
    } catch (error) {
      console.error("Error fetching class passes");
      res.status(500).json({ message: "Failed to fetch class passes" });
    }
  });

  // GET /api/class-passes/:id - Get a specific class pass (user's own only)
  app.get("/api/class-passes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pass = await storage.getClassPass(req.params.id, userId);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.json(pass);
    } catch (error) {
      console.error("Error fetching class pass");
      res.status(500).json({ message: "Failed to fetch class pass" });
    }
  });

  // POST /api/class-passes - Create a new class pass
  app.post("/api/class-passes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate input with schema
      const passData = insertClassPassSchema.parse({
        ...req.body,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined
      });

      const newPass = await storage.createClassPass({
        ...passData,
        userId,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : new Date()
      });
      res.status(201).json(newPass);
    } catch (error) {
      console.error("Error creating class pass");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create class pass" });
    }
  });

  // PUT /api/class-passes/:id - Update a class pass (with proper validation)
  app.put("/api/class-passes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate updates with schema to prevent unauthorized field updates
      const updates = updateClassPassSchema.parse({
        ...req.body,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : undefined,
      });

      const updatedPass = await storage.updateClassPass(req.params.id, userId, updates);
      if (!updatedPass) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.json(updatedPass);
    } catch (error) {
      console.error("Error updating class pass");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update class pass" });
    }
  });

  // DELETE /api/class-passes/:id - Delete a class pass (user's own only)
  app.delete("/api/class-passes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteClassPass(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Class pass not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting class pass");
      res.status(500).json({ message: "Failed to delete class pass" });
    }
  });

  // POST /api/class-passes/:id/check-in - Check in to a class
  app.post("/api/class-passes/:id/check-in", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pass = await storage.getClassPass(req.params.id, userId);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }

      if (pass.remainingClasses <= 0) {
        return res.status(400).json({ message: "No remaining classes" });
      }

      const updatedPass = await storage.updateClassPass(req.params.id, userId, {
        remainingClasses: pass.remainingClasses - 1
      });

      res.json(updatedPass);
    } catch (error) {
      console.error("Error checking in");
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // POST /api/class-passes/:id/extend - Extend a class pass with additional classes
  app.post("/api/class-passes/:id/extend", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const extendSchema = z.object({
        additionalClasses: z.number().min(1).max(50),
        additionalCost: z.number().min(0)
      });

      const { additionalClasses, additionalCost } = extendSchema.parse(req.body);

      const pass = await storage.getClassPass(req.params.id, userId);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }

      const updatedPass = await storage.updateClassPass(req.params.id, userId, {
        totalClasses: pass.totalClasses + additionalClasses,
        remainingClasses: pass.remainingClasses + additionalClasses,
        cost: pass.cost + Math.round(additionalCost * 100) // Convert dollars to cents
      });

      res.json(updatedPass);
    } catch (error) {
      console.error("Error extending class pass");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to extend class pass" });
    }
  });

  // POST /api/class-passes/:id/archive - Archive a class pass
  app.post("/api/class-passes/:id/archive", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pass = await storage.getClassPass(req.params.id, userId);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }

      const updatedPass = await storage.archiveClassPass(req.params.id, userId);
      res.json(updatedPass);
    } catch (error) {
      console.error("Error archiving class pass");
      res.status(500).json({ message: "Failed to archive class pass" });
    }
  });

  // POST /api/class-passes/:id/unarchive - Unarchive a class pass
  app.post("/api/class-passes/:id/unarchive", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pass = await storage.getClassPass(req.params.id, userId);
      if (!pass) {
        return res.status(404).json({ message: "Class pass not found" });
      }

      const updatedPass = await storage.unarchiveClassPass(req.params.id, userId);
      res.json(updatedPass);
    } catch (error) {
      console.error("Error unarchiving class pass");
      res.status(500).json({ message: "Failed to unarchive class pass" });
    }
  });

  // Usage Sessions API Routes - For usage-based tracking
  
  // GET /api/class-passes/:passId/sessions - Get all usage sessions for a pass
  app.get("/api/class-passes/:passId/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUsageSessions(req.params.passId, userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching usage sessions");
      res.status(500).json({ message: "Failed to fetch usage sessions" });
    }
  });

  // POST /api/class-passes/:passId/sessions - Create a new usage session
  app.post("/api/class-passes/:passId/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate input with schema
      const sessionData = insertUsageSessionSchema.parse({
        ...req.body,
        sessionDate: req.body.sessionDate ? new Date(req.body.sessionDate) : new Date(),
      });

      const newSession = await storage.createUsageSession(req.params.passId, userId, sessionData);
      res.status(201).json(newSession);
    } catch (error) {
      console.error("Error creating usage session");
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create usage session" });
    }
  });

  // GET /api/class-passes/:passId/analytics - Get usage analytics for a pass
  app.get("/api/class-passes/:passId/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUsageAnalytics(req.params.passId, userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching usage analytics");
      res.status(500).json({ message: "Failed to fetch usage analytics" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, authenticate, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());

  app.get("/api/auth/bootstrap/status", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      return res.json({ 
        needsBootstrap: allUsers.length === 0 
      });
    } catch (error) {
      console.error("Bootstrap status error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/bootstrap", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      if (allUsers.length > 0) {
        return res.status(400).json({ 
          error: "Bootstrap not available. Users already exist in the system." 
        });
      }

      const bootstrapSchema = insertUserSchema.omit({ role: true });
      const validationResult = bootstrapSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { name, email, password } = validationResult.data;

      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "admin",
      });

      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        message: "First admin user created successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Bootstrap error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const { name, email, password, role } = validationResult.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role,
      });

      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken(userWithoutPassword);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Login successful",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logout successful" });
  });

  app.get("/api/auth/me", authenticate, (req: AuthRequest, res) => {
    return res.json({ user: req.user });
  });

  app.get("/api/admin/users", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      return res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id/role", authenticate, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !["project_manager", "team_member", "finance", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
      }

      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.json({ 
        message: "User role updated successfully",
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error("Update role error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

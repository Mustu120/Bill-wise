import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, authenticate, requireAdmin, type AuthRequest } from "./auth";
import { insertUserSchema, insertProjectSchema, insertTaskSchema, insertTimesheetSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error as Error, uploadDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

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

  app.get("/api/projects", authenticate, async (req: AuthRequest, res) => {
    try {
      const projects = await storage.getAllProjects();
      return res.json({ projects });
    } catch (error) {
      console.error("Get projects error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/projects/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json({ project });
    } catch (error) {
      console.error("Get project error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertProjectSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const project = await storage.createProject(validationResult.data);

      return res.status(201).json({
        message: "Project created successfully",
        project,
      });
    } catch (error) {
      console.error("Create project error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/projects/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateProject(id, req.body);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json({
        message: "Project updated successfully",
        project,
      });
    } catch (error) {
      console.error("Update project error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/projects/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProject(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Delete project error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/upload", authenticate, upload.single('file'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        message: "File uploaded successfully",
        url: fileUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "File upload failed" });
    }
  });

  app.get("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const { assignedTo } = req.query;
      
      let tasks;
      if (assignedTo) {
        tasks = await storage.getTasksByAssignee(assignedTo as string);
      } else {
        tasks = await storage.getAllTasks();
      }

      return res.json({ tasks });
    } catch (error) {
      console.error("Get tasks error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.json({ task });
    } catch (error) {
      console.error("Get task error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const taskData = {
        ...req.body,
        lastModifiedBy: req.user!.id,
      };

      const validationResult = insertTaskSchema.safeParse(taskData);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const task = await storage.createTask(validationResult.data);

      return res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const taskData = {
        ...req.body,
        lastModifiedBy: req.user!.id,
      };

      const task = await storage.updateTask(id, taskData);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.json({
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      console.error("Update task error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Task not found" });
      }

      return res.json({
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Delete task error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tasks/:taskId/timesheets", authenticate, async (req: AuthRequest, res) => {
    try {
      const { taskId } = req.params;
      const timesheets = await storage.getTimesheetsByTask(taskId);

      return res.json({ timesheets });
    } catch (error) {
      console.error("Get timesheets error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/timesheets", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertTimesheetSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const timesheet = await storage.createTimesheet(validationResult.data);

      return res.status(201).json({
        message: "Timesheet created successfully",
        timesheet,
      });
    } catch (error) {
      console.error("Create timesheet error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/timesheets/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const timesheet = await storage.updateTimesheet(id, req.body);
      
      if (!timesheet) {
        return res.status(404).json({ error: "Timesheet not found" });
      }

      return res.json({
        message: "Timesheet updated successfully",
        timesheet,
      });
    } catch (error) {
      console.error("Update timesheet error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/timesheets/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTimesheet(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Timesheet not found" });
      }

      return res.json({
        message: "Timesheet deleted successfully",
      });
    } catch (error) {
      console.error("Delete timesheet error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

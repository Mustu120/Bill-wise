import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import { hashPassword, comparePassword, generateToken, authenticate, requireAdmin, type AuthRequest } from "./auth";
import { 
  insertUserSchema, insertProjectSchema, insertTaskSchema, insertTimesheetSchema,
  insertPartnerSchema, insertProductSchema, insertTaxSchema,
  insertSalesOrderSchema, insertSalesOrderLineSchema,
  insertPurchaseOrderSchema, insertPurchaseOrderLineSchema,
  insertInvoiceSchema, insertInvoiceLineSchema,
  insertExpenseSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import Tesseract from "tesseract.js";

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
      const { id} = req.params;
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

  app.get("/api/analytics/kpis", authenticate, async (req: AuthRequest, res) => {
    try {
      const kpis = await storage.getAnalyticsKpis(req.query);
      return res.json(kpis);
    } catch (error) {
      console.error("Get KPIs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/project-costs", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getProjectCosts(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get project costs error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/resource-utilization", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getResourceUtilization(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get resource utilization error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/completion", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getProjectCompletion(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get project completion error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/workload-trend", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getWorkloadTrend(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get workload trend error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/revenue-expense", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getRevenueExpense(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get revenue expense error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/task-status", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = await storage.getTaskStatusDistribution(req.query);
      return res.json(data);
    } catch (error) {
      console.error("Get task status error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/analytics/filters", authenticate, async (req: AuthRequest, res) => {
    try {
      const filters = await storage.getAnalyticsFilters();
      return res.json(filters);
    } catch (error) {
      console.error("Get analytics filters error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Partners
  // ============================================================
  
  app.get("/api/partners", authenticate, async (req: AuthRequest, res) => {
    try {
      const partners = await storage.getAllPartners({
        search: req.query.search as string,
        type: req.query.type as "customer" | "vendor" | "both"
      });
      return res.json(partners);
    } catch (error) {
      console.error("Get partners error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partners/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const partner = await storage.getPartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.json(partner);
    } catch (error) {
      console.error("Get partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partners", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPartnerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const partner = await storage.createPartner(validationResult.data);
      return res.status(201).json(partner);
    } catch (error) {
      console.error("Create partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/partners/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPartnerSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const partner = await storage.updatePartner(req.params.id, validationResult.data);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.json(partner);
    } catch (error) {
      console.error("Update partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/partners/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deletePartner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Partner not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete partner error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Products
  // ============================================================
  
  app.get("/api/products", authenticate, async (req: AuthRequest, res) => {
    try {
      const products = await storage.getAllProducts({ search: req.query.search as string });
      return res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/products/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/products", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertProductSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const product = await storage.createProduct(validationResult.data);
      return res.status(201).json(product);
    } catch (error) {
      console.error("Create product error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/products/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertProductSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const product = await storage.updateProduct(req.params.id, validationResult.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete product error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Taxes
  // ============================================================
  
  app.get("/api/taxes", authenticate, async (req: AuthRequest, res) => {
    try {
      const taxes = await storage.getAllTaxes();
      return res.json(taxes);
    } catch (error) {
      console.error("Get taxes error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/taxes/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const tax = await storage.getTax(req.params.id);
      if (!tax) {
        return res.status(404).json({ error: "Tax not found" });
      }
      return res.json(tax);
    } catch (error) {
      console.error("Get tax error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/taxes", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertTaxSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const tax = await storage.createTax(validationResult.data);
      return res.status(201).json(tax);
    } catch (error) {
      console.error("Create tax error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/taxes/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertTaxSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const tax = await storage.updateTax(req.params.id, validationResult.data);
      if (!tax) {
        return res.status(404).json({ error: "Tax not found" });
      }
      return res.json(tax);
    } catch (error) {
      console.error("Update tax error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/taxes/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteTax(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Tax not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete tax error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Sales Orders
  // ============================================================
  
  app.get("/api/sales-orders", authenticate, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getAllSalesOrders({
        search: req.query.search as string,
        status: req.query.status as string
      });
      return res.json(orders);
    } catch (error) {
      console.error("Get sales orders error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/sales-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const order = await storage.getSalesOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Get sales order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sales-orders", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertSalesOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const order = await storage.createSalesOrder(validationResult.data);
      return res.status(201).json(order);
    } catch (error) {
      console.error("Create sales order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/sales-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertSalesOrderSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const order = await storage.updateSalesOrder(req.params.id, validationResult.data);
      if (!order) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Update sales order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/sales-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteSalesOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sales order not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete sales order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Sales Order Lines
  app.get("/api/sales-orders/:orderId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const lines = await storage.getSalesOrderLines(req.params.orderId);
      return res.json(lines);
    } catch (error) {
      console.error("Get sales order lines error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/sales-orders/:orderId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertSalesOrderLineSchema.safeParse({
        ...req.body,
        salesOrderId: req.params.orderId
      });
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.addSalesOrderLine(validationResult.data);
      return res.status(201).json(line);
    } catch (error) {
      console.error("Add sales order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/sales-order-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertSalesOrderLineSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.updateSalesOrderLine(req.params.id, validationResult.data);
      if (!line) {
        return res.status(404).json({ error: "Sales order line not found" });
      }
      return res.json(line);
    } catch (error) {
      console.error("Update sales order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/sales-order-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteSalesOrderLine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sales order line not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete sales order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Purchase Orders
  // ============================================================
  
  app.get("/api/purchase-orders", authenticate, async (req: AuthRequest, res) => {
    try {
      const orders = await storage.getAllPurchaseOrders({
        search: req.query.search as string,
        status: req.query.status as string
      });
      return res.json(orders);
    } catch (error) {
      console.error("Get purchase orders error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/purchase-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Get purchase order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/purchase-orders", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPurchaseOrderSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const order = await storage.createPurchaseOrder(validationResult.data);
      return res.status(201).json(order);
    } catch (error) {
      console.error("Create purchase order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/purchase-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPurchaseOrderSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const order = await storage.updatePurchaseOrder(req.params.id, validationResult.data);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Update purchase order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/purchase-orders/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete purchase order error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Purchase Order Lines
  app.get("/api/purchase-orders/:orderId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const lines = await storage.getPurchaseOrderLines(req.params.orderId);
      return res.json(lines);
    } catch (error) {
      console.error("Get purchase order lines error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/purchase-orders/:orderId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPurchaseOrderLineSchema.safeParse({
        ...req.body,
        purchaseOrderId: req.params.orderId
      });
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.addPurchaseOrderLine(validationResult.data);
      return res.status(201).json(line);
    } catch (error) {
      console.error("Add purchase order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/purchase-order-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertPurchaseOrderLineSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.updatePurchaseOrderLine(req.params.id, validationResult.data);
      if (!line) {
        return res.status(404).json({ error: "Purchase order line not found" });
      }
      return res.json(line);
    } catch (error) {
      console.error("Update purchase order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/purchase-order-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deletePurchaseOrderLine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order line not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete purchase order line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Invoices
  // ============================================================
  
  app.get("/api/invoices", authenticate, async (req: AuthRequest, res) => {
    try {
      const invoices = await storage.getAllInvoices({
        search: req.query.search as string,
        type: req.query.type as "customer" | "vendor",
        status: req.query.status as string
      });
      return res.json(invoices);
    } catch (error) {
      console.error("Get invoices error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/invoices/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      return res.json(invoice);
    } catch (error) {
      console.error("Get invoice error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/invoices", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertInvoiceSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const invoice = await storage.createInvoice(validationResult.data);
      return res.status(201).json(invoice);
    } catch (error) {
      console.error("Create invoice error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/invoices/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertInvoiceSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const invoice = await storage.updateInvoice(req.params.id, validationResult.data);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      return res.json(invoice);
    } catch (error) {
      console.error("Update invoice error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/invoices/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteInvoice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete invoice error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Invoice Lines
  app.get("/api/invoices/:invoiceId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const lines = await storage.getInvoiceLines(req.params.invoiceId);
      return res.json(lines);
    } catch (error) {
      console.error("Get invoice lines error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/invoices/:invoiceId/lines", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertInvoiceLineSchema.safeParse({
        ...req.body,
        invoiceId: req.params.invoiceId
      });
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.addInvoiceLine(validationResult.data);
      return res.status(201).json(line);
    } catch (error) {
      console.error("Add invoice line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/invoice-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const validationResult = insertInvoiceLineSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const line = await storage.updateInvoiceLine(req.params.id, validationResult.data);
      if (!line) {
        return res.status(404).json({ error: "Invoice line not found" });
      }
      return res.json(line);
    } catch (error) {
      console.error("Update invoice line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/invoice-lines/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteInvoiceLine(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Invoice line not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete invoice line error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - Expenses
  // ============================================================
  
  app.get("/api/expenses", authenticate, async (req: AuthRequest, res) => {
    try {
      const expenses = await storage.getAllExpenses({ search: req.query.search as string });
      return res.json(expenses);
    } catch (error) {
      console.error("Get expenses error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/expenses/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      return res.json(expense);
    } catch (error) {
      console.error("Get expense error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expenses", authenticate, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      const expenseData = req.body;
      if (req.file) {
        expenseData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const validationResult = insertExpenseSchema.safeParse(expenseData);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const expense = await storage.createExpense(validationResult.data);
      return res.status(201).json(expense);
    } catch (error) {
      console.error("Create expense error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/expenses/:id", authenticate, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      const expenseData = req.body;
      if (req.file) {
        expenseData.imageUrl = `/uploads/${req.file.filename}`;
      }
      
      const validationResult = insertExpenseSchema.partial().safeParse(expenseData);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const expense = await storage.updateExpense(req.params.id, validationResult.data);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      return res.json(expense);
    } catch (error) {
      console.error("Update expense error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/expenses/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const deleted = await storage.deleteExpense(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Expense not found" });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Delete expense error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================
  // FlowChain Settings - OCR for Expense Auto-fill
  // ============================================================
  
  app.post("/api/expenses/ocr", authenticate, upload.single('image'), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }

      const imagePath = req.file.path;
      
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: info => console.log('OCR progress:', info)
        }
      );

      const ocrData = {
        rawText: text,
        extractedData: {
          possibleVendor: null as string | null,
          possibleAmount: null as string | null,
          possibleDate: null as string | null,
        }
      };

      const lines = text.split('\n').filter(line => line.trim());
      
      const amountPattern = /\$?\d+[,.]?\d*\.?\d{2}/;
      const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/;
      
      for (const line of lines) {
        if (!ocrData.extractedData.possibleAmount) {
          const amountMatch = line.match(amountPattern);
          if (amountMatch) {
            ocrData.extractedData.possibleAmount = amountMatch[0].replace(/[$,]/g, '');
          }
        }
        
        if (!ocrData.extractedData.possibleDate) {
          const dateMatch = line.match(datePattern);
          if (dateMatch) {
            ocrData.extractedData.possibleDate = dateMatch[0];
          }
        }
        
        if (!ocrData.extractedData.possibleVendor && line.length > 3 && line.length < 50) {
          if (!line.match(amountPattern) && !line.match(datePattern)) {
            ocrData.extractedData.possibleVendor = line.trim();
          }
        }
      }

      return res.json(ocrData);
    } catch (error) {
      console.error("OCR processing error:", error);
      return res.status(500).json({ error: "Failed to process image with OCR" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

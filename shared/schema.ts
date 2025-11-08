import { sql } from "drizzle-orm";
import { pgTable, text, varchar, pgEnum, integer, timestamp, boolean, numeric, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["project_manager", "team_member", "finance", "admin"]);
export const statusEnum = pgEnum("status", ["Planned", "In Progress", "Completed", "On Hold"]);
export const taskStatusEnum = pgEnum("task_status", ["Planned", "In Progress", "Completed", "Blocked"]);
export const priorityEnum = pgEnum("priority", ["High", "Medium", "Low"]);
export const partnerTypeEnum = pgEnum("partner_type", ["customer", "vendor", "both"]);
export const invoiceTypeEnum = pgEnum("invoice_type", ["customer", "vendor"]);
export const orderStatusEnum = pgEnum("order_status", ["Draft", "Confirmed", "Cancelled"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
}).extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const selectUserSchema = createSelectSchema(users).omit({
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserWithoutPassword = Omit<User, 'password'>;

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  tags: text("tags").array(),
  manager: text("manager").notNull(),
  deadline: timestamp("deadline").notNull(),
  priority: priorityEnum("priority").notNull(),
  budget: integer("budget").notNull(),
  budgetSpent: integer("budget_spent").notNull().default(0),
  description: text("description"),
  status: statusEnum("status").notNull().default("Planned"),
  progress: integer("progress").notNull().default(0),
  cost: integer("cost").notNull().default(0),
  revenue: integer("revenue").notNull().default(0),
  totalTasks: integer("total_tasks").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  budgetSpent: true,
  progress: true,
  cost: true,
  revenue: true,
  totalTasks: true,
  completedTasks: true,
}).extend({
  name: z.string().min(1, 'Project name is required'),
  manager: z.string().min(1, 'Project manager is required'),
  budget: z.number().min(0, 'Budget must be a positive number'),
  deadline: z.coerce.date(),
});

export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskName: text("task_name").notNull(),
  assigneeId: varchar("assignee_id").references(() => users.id),
  projectId: varchar("project_id").references(() => projects.id),
  tags: text("tags").array(),
  deadline: timestamp("deadline"),
  description: text("description"),
  imageUrl: text("image_url"),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  lastModifiedOn: timestamp("last_modified_on").default(sql`CURRENT_TIMESTAMP`),
  totalHours: integer("total_hours").default(0),
  status: taskStatusEnum("status").notNull().default("Planned"),
  isBillable: boolean("is_billable").notNull().default(true),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  lastModifiedOn: true,
}).extend({
  taskName: z.string().min(1, 'Task name is required'),
  deadline: z.coerce.date().optional(),
});

export const selectTaskSchema = createSelectSchema(tasks);

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").references(() => tasks.id).notNull(),
  employeeId: varchar("employee_id").references(() => users.id).notNull(),
  timeLogged: integer("time_logged").notNull().default(0),
  billable: boolean("billable").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
}).extend({
  timeLogged: z.number().min(0, 'Time logged must be non-negative'),
});

export const selectTimesheetSchema = createSelectSchema(timesheets);

export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheets.$inferSelect;

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  type: partnerTypeEnum("type").notNull().default("both"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, 'Partner name is required'),
});

export const selectPartnerSchema = createSelectSchema(partners);

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  forSales: boolean("for_sales").notNull().default(false),
  forPurchase: boolean("for_purchase").notNull().default(false),
  forExpenses: boolean("for_expenses").notNull().default(false),
  salesPrice: numeric("sales_price", { precision: 12, scale: 2 }).default("0"),
  cost: numeric("cost", { precision: 12, scale: 2 }).default("0"),
  taxIds: text("tax_ids").array(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, 'Product name is required'),
  salesPrice: z.coerce.number().min(0).optional(),
  cost: z.coerce.number().min(0).optional(),
});

export const selectProductSchema = createSelectSchema(products);

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export const taxes = pgTable("taxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  rate: numeric("rate", { precision: 6, scale: 3 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertTaxSchema = createInsertSchema(taxes).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, 'Tax name is required'),
  rate: z.coerce.number().min(0).max(100),
});

export const selectTaxSchema = createSelectSchema(taxes);

export type InsertTax = z.infer<typeof insertTaxSchema>;
export type Tax = typeof taxes.$inferSelect;

export const salesOrders = pgTable("sales_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).unique().notNull(),
  customerId: varchar("customer_id").references(() => partners.id),
  projectId: varchar("project_id").references(() => projects.id),
  status: orderStatusEnum("status").notNull().default("Draft"),
  untaxedAmount: numeric("untaxed_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
}).extend({
  code: z.string().min(1, 'Order code is required'),
  untaxedAmount: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().min(0).optional(),
});

export const selectSalesOrderSchema = createSelectSchema(salesOrders);

export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;
export type SalesOrder = typeof salesOrders.$inferSelect;

export const salesOrderLines = pgTable("sales_order_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => salesOrders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxIds: text("tax_ids").array(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const insertSalesOrderLineSchema = createInsertSchema(salesOrderLines).omit({
  id: true,
}).extend({
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

export const selectSalesOrderLineSchema = createSelectSchema(salesOrderLines);

export type InsertSalesOrderLine = z.infer<typeof insertSalesOrderLineSchema>;
export type SalesOrderLine = typeof salesOrderLines.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 30 }).unique().notNull(),
  vendorId: varchar("vendor_id").references(() => partners.id),
  projectId: varchar("project_id").references(() => projects.id),
  status: orderStatusEnum("status").notNull().default("Draft"),
  untaxedAmount: numeric("untaxed_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
}).extend({
  code: z.string().min(1, 'Order code is required'),
  untaxedAmount: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().min(0).optional(),
});

export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrders);

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const purchaseOrderLines = pgTable("purchase_order_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => purchaseOrders.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxIds: text("tax_ids").array(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const insertPurchaseOrderLineSchema = createInsertSchema(purchaseOrderLines).omit({
  id: true,
}).extend({
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

export const selectPurchaseOrderLineSchema = createSelectSchema(purchaseOrderLines);

export type InsertPurchaseOrderLine = z.infer<typeof insertPurchaseOrderLineSchema>;
export type PurchaseOrderLine = typeof purchaseOrderLines.$inferSelect;

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  number: varchar("number", { length: 40 }).notNull(),
  type: invoiceTypeEnum("type").notNull(),
  partnerId: varchar("partner_id").references(() => partners.id),
  projectId: varchar("project_id").references(() => projects.id),
  status: orderStatusEnum("status").notNull().default("Draft"),
  untaxedAmount: numeric("untaxed_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
}).extend({
  number: z.string().min(1, 'Invoice number is required'),
  untaxedAmount: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().min(0).optional(),
});

export const selectInvoiceSchema = createSelectSchema(invoices);

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const invoiceLines = pgTable("invoice_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  productId: varchar("product_id").references(() => products.id),
  quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxIds: text("tax_ids").array(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
});

export const insertInvoiceLineSchema = createInsertSchema(invoiceLines).omit({
  id: true,
}).extend({
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

export const selectInvoiceLineSchema = createSelectSchema(invoiceLines);

export type InsertInvoiceLine = z.infer<typeof insertInvoiceLineSchema>;
export type InvoiceLine = typeof invoiceLines.$inferSelect;

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  imageUrl: text("image_url"),
  description: text("description"),
  ocrData: jsonb("ocr_data"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  ocrData: true,
}).extend({
  name: z.string().min(1, 'Expense name is required'),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export const selectExpenseSchema = createSelectSchema(expenses);

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

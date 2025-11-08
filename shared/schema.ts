import { sql } from "drizzle-orm";
import { pgTable, text, varchar, pgEnum, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["project_manager", "team_member", "finance", "admin"]);
export const statusEnum = pgEnum("status", ["Planned", "In Progress", "Completed", "On Hold"]);
export const priorityEnum = pgEnum("priority", ["High", "Medium", "Low"]);

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
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  budgetSpent: true,
  progress: true,
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
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
}).extend({
  timeLogged: z.number().min(0, 'Time logged must be non-negative'),
});

export const selectTimesheetSchema = createSelectSchema(timesheets);

export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheets.$inferSelect;

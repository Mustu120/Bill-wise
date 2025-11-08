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
  deadline: z.date(),
});

export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, projects, tasks, timesheets } from "@shared/schema";
import type { User, InsertUser, UserWithoutPassword, Project, InsertProject, Task, InsertTask, Timesheet, InsertTimesheet } from "@shared/schema";
import type { IStorage } from "./storage";

export class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    const result = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    }).from(users);
    return result;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ role: role as User["role"] })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return result[0];
  }

  async getAllProjects(): Promise<Project[]> {
    const result = await db.select().from(projects);
    return result;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const projectData: any = { ...insertProject };
    if (insertProject.status === 'Completed') {
      projectData.progress = 100;
    } else if (projectData.progress === undefined) {
      projectData.progress = 0;
    }
    const result = await db.insert(projects).values(projectData).returning();
    return result[0];
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const projectData: any = { ...updateData };
    if (updateData.status === 'Completed') {
      projectData.progress = 100;
    }
    const result = await db
      .update(projects)
      .set(projectData)
      .where(eq(projects.id, id))
      .returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return result[0];
  }

  async getAllTasks(): Promise<Task[]> {
    const result = await db.select().from(tasks);
    return result;
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    const result = await db.select().from(tasks).where(eq(tasks.assigneeId, assigneeId));
    return result;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values(insertTask).returning();
    return result[0];
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  async getTimesheetsByTask(taskId: string): Promise<Timesheet[]> {
    const result = await db.select().from(timesheets).where(eq(timesheets.taskId, taskId));
    return result;
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const result = await db.insert(timesheets).values(insertTimesheet).returning();
    return result[0];
  }

  async updateTimesheet(id: string, updateData: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const result = await db
      .update(timesheets)
      .set(updateData)
      .where(eq(timesheets.id, id))
      .returning();
    return result[0];
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    const result = await db.delete(timesheets).where(eq(timesheets.id, id)).returning();
    return result.length > 0;
  }
}

export const pgStorage = new PgStorage();

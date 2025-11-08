import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, projects } from "@shared/schema";
import type { User, InsertUser, UserWithoutPassword, Project, InsertProject } from "@shared/schema";
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
}

export const pgStorage = new PgStorage();

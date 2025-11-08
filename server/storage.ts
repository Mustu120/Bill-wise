import { type User, type InsertUser, type UserWithoutPassword, type Project, type InsertProject } from "@shared/schema";
import { pgStorage } from "./pg-storage";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<UserWithoutPassword[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<UserWithoutPassword[]> {
    return Array.from(this.users.values()).map(({ password, ...user }) => user);
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, role: role as User["role"] };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    let progress = (insertProject as any).progress;
    if (insertProject.status === 'Completed') {
      progress = 100;
    } else if (progress === undefined) {
      progress = 0;
    }
    const project: Project = { ...insertProject, id, progress, budgetSpent: 0 };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updateData: Partial<InsertProject>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...updateData };
    if (updateData.status === 'Completed') {
      updatedProject.progress = 100;
    }
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = pgStorage;

import { type User, type InsertUser, type UserWithoutPassword, type Project, type InsertProject, type Task, type InsertTask, type Timesheet, type InsertTimesheet } from "@shared/schema";
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
  
  getTask(id: string): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getTasksByAssignee(assigneeId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  getTimesheetsByTask(taskId: string): Promise<Timesheet[]>;
  createTimesheet(timesheet: InsertTimesheet): Promise<Timesheet>;
  updateTimesheet(id: string, timesheet: Partial<InsertTimesheet>): Promise<Timesheet | undefined>;
  deleteTimesheet(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private timesheets: Map<string, Timesheet>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.timesheets = new Map();
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
    const project: Project = { 
      ...insertProject, 
      id, 
      progress, 
      budgetSpent: 0,
      status: insertProject.status || 'Planned',
    };
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

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assigneeId === assigneeId,
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const task: Task = { 
      ...insertTask, 
      id,
      tags: insertTask.tags || null,
      deadline: insertTask.deadline || null,
      description: insertTask.description || null,
      imageUrl: insertTask.imageUrl || null,
      assigneeId: insertTask.assigneeId || null,
      projectId: insertTask.projectId || null,
      lastModifiedBy: insertTask.lastModifiedBy || null,
      lastModifiedOn: new Date(),
      totalHours: 0,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updateData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { 
      ...task, 
      ...updateData,
      lastModifiedOn: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTimesheetsByTask(taskId: string): Promise<Timesheet[]> {
    return Array.from(this.timesheets.values()).filter(
      (timesheet) => timesheet.taskId === taskId,
    );
  }

  async createTimesheet(insertTimesheet: InsertTimesheet): Promise<Timesheet> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const timesheet: Timesheet = { ...insertTimesheet, id };
    this.timesheets.set(id, timesheet);
    return timesheet;
  }

  async updateTimesheet(id: string, updateData: Partial<InsertTimesheet>): Promise<Timesheet | undefined> {
    const timesheet = this.timesheets.get(id);
    if (!timesheet) return undefined;
    
    const updatedTimesheet = { ...timesheet, ...updateData };
    this.timesheets.set(id, updatedTimesheet);
    return updatedTimesheet;
  }

  async deleteTimesheet(id: string): Promise<boolean> {
    return this.timesheets.delete(id);
  }
}

export const storage = pgStorage;

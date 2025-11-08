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
  
  getAnalyticsKpis(filters: any): Promise<any>;
  getProjectCosts(filters: any): Promise<any>;
  getResourceUtilization(filters: any): Promise<any>;
  getProjectCompletion(filters: any): Promise<any>;
  getWorkloadTrend(filters: any): Promise<any>;
  getRevenueExpense(filters: any): Promise<any>;
  getTaskStatusDistribution(filters: any): Promise<any>;
  getAnalyticsFilters(): Promise<any>;
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
      cost: 0,
      revenue: 0,
      totalTasks: 0,
      completedTasks: 0,
      tags: insertProject.tags || null,
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
      status: (insertTask as any).status || 'Planned',
      isBillable: (insertTask as any).isBillable !== undefined ? (insertTask as any).isBillable : true,
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
    const timesheet: Timesheet = { 
      ...insertTimesheet, 
      id,
      billable: (insertTimesheet as any).billable !== undefined ? (insertTimesheet as any).billable : true,
      createdAt: new Date(),
    };
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

  async getAnalyticsKpis(filters: any): Promise<any> {
    let projects = Array.from(this.projects.values());
    let tasks = Array.from(this.tasks.values());
    let timesheets = Array.from(this.timesheets.values());

    if (filters.project && filters.project !== 'all') {
      tasks = tasks.filter(t => t.projectId === filters.project);
      projects = projects.filter(p => p.id === filters.project);
    }

    if (filters.employee && filters.employee !== 'all') {
      tasks = tasks.filter(t => t.assigneeId === filters.employee);
    }

    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }

    const taskIds = new Set(tasks.map(t => t.id));
    timesheets = timesheets.filter(ts => taskIds.has(ts.taskId));

    if (filters.billable && filters.billable !== 'all') {
      const isBillable = filters.billable === 'true';
      timesheets = timesheets.filter(ts => ts.billable === isBillable);
    }

    if (filters.start || filters.end) {
      timesheets = timesheets.filter(ts => {
        if (!ts.createdAt) return false;
        const tsDate = ts.createdAt instanceof Date ? ts.createdAt : new Date(ts.createdAt);
        if (filters.start && tsDate < new Date(filters.start)) return false;
        if (filters.end && tsDate > new Date(filters.end)) return false;
        return true;
      });
    }

    const totalProjects = projects.length;
    const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
    const totalHours = timesheets.reduce((sum, t) => sum + t.timeLogged, 0);
    const billableHours = timesheets.filter(t => t.billable).reduce((sum, t) => sum + t.timeLogged, 0);
    const nonBillableHours = totalHours - billableHours;

    return {
      totalProjects,
      tasksCompleted,
      totalHours,
      billableHours,
      nonBillableHours,
      billablePercentage: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
    };
  }

  async getProjectCosts(filters: any): Promise<any> {
    let projects = Array.from(this.projects.values());
    
    if (filters.project && filters.project !== 'all') {
      projects = projects.filter(p => p.id === filters.project);
    }

    return projects.map(p => ({
      name: p.name,
      cost: p.cost,
      revenue: p.revenue,
    }));
  }

  async getResourceUtilization(filters: any): Promise<any> {
    let timesheets = Array.from(this.timesheets.values());

    if (filters.project && filters.project !== 'all') {
      const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === filters.project);
      const taskIds = new Set(tasks.map(t => t.id));
      timesheets = timesheets.filter(ts => taskIds.has(ts.taskId));
    }

    if (filters.employee && filters.employee !== 'all') {
      timesheets = timesheets.filter(ts => ts.employeeId === filters.employee);
    }

    if (filters.start || filters.end) {
      timesheets = timesheets.filter(ts => {
        if (!ts.createdAt) return false;
        const tsDate = ts.createdAt instanceof Date ? ts.createdAt : new Date(ts.createdAt);
        if (filters.start && tsDate < new Date(filters.start)) return false;
        if (filters.end && tsDate > new Date(filters.end)) return false;
        return true;
      });
    }

    const billableHours = timesheets.filter(t => t.billable).reduce((sum, t) => sum + t.timeLogged, 0);
    const nonBillableHours = timesheets.filter(t => !t.billable).reduce((sum, t) => sum + t.timeLogged, 0);

    return [
      { name: 'Billable', value: billableHours },
      { name: 'Non-Billable', value: nonBillableHours },
    ];
  }

  async getProjectCompletion(filters: any): Promise<any> {
    let projects = Array.from(this.projects.values());
    
    if (filters.project && filters.project !== 'all') {
      projects = projects.filter(p => p.id === filters.project);
    }

    return projects.map(p => ({
      name: p.name,
      value: p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0,
    }));
  }

  async getWorkloadTrend(filters: any): Promise<any> {
    let timesheets = Array.from(this.timesheets.values());
    
    if (filters.project && filters.project !== 'all') {
      const tasks = Array.from(this.tasks.values()).filter(t => t.projectId === filters.project);
      const taskIds = new Set(tasks.map(t => t.id));
      timesheets = timesheets.filter(ts => taskIds.has(ts.taskId));
    }
    
    if (filters.employee && filters.employee !== 'all') {
      timesheets = timesheets.filter(ts => ts.employeeId === filters.employee);
    }

    const monthlyData: Record<string, number> = {};

    timesheets.forEach(t => {
      if (t.createdAt) {
        const tsDate = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
        const month = tsDate.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + t.timeLogged;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      hours: monthlyData[month] || 0,
    }));
  }

  async getRevenueExpense(filters: any): Promise<any> {
    let projects = Array.from(this.projects.values());
    
    if (filters.project && filters.project !== 'all') {
      projects = projects.filter(p => p.id === filters.project);
    }

    const monthlyData: Record<string, { revenue: number; expense: number }> = {};

    projects.forEach(p => {
      if (p.deadline) {
        const deadlineDate = p.deadline instanceof Date ? p.deadline : new Date(p.deadline);
        const month = deadlineDate.toLocaleDateString('en-US', { month: 'short' });
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, expense: 0 };
        }
        monthlyData[month].revenue += p.revenue;
        monthlyData[month].expense += p.cost;
      }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      revenue: monthlyData[month]?.revenue || 0,
      expense: monthlyData[month]?.expense || 0,
    }));
  }

  async getTaskStatusDistribution(filters: any): Promise<any> {
    let tasks = Array.from(this.tasks.values());

    if (filters.project && filters.project !== 'all') {
      tasks = tasks.filter(t => t.projectId === filters.project);
    }

    if (filters.employee && filters.employee !== 'all') {
      tasks = tasks.filter(t => t.assigneeId === filters.employee);
    }

    const statusCounts: Record<string, number> = {};

    tasks.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }

  async getAnalyticsFilters(): Promise<any> {
    const projects = Array.from(this.projects.values());
    const users = Array.from(this.users.values());

    return {
      projects: projects.map(p => ({ id: p.id, name: p.name })),
      employees: users.map(u => ({ id: u.id, name: u.name })),
      statuses: ['Planned', 'In Progress', 'Completed', 'Blocked'],
    };
  }
}

export const storage = pgStorage;

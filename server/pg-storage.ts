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

  async getAnalyticsKpis(filters: any): Promise<any> {
    let allProjects = await db.select().from(projects);
    let allTasks = await db.select().from(tasks);
    let allTimesheets = await db.select().from(timesheets);

    if (filters.project && filters.project !== 'all') {
      allTasks = allTasks.filter(t => t.projectId === filters.project);
      allProjects = allProjects.filter(p => p.id === filters.project);
    }

    if (filters.employee && filters.employee !== 'all') {
      allTasks = allTasks.filter(t => t.assigneeId === filters.employee);
    }

    if (filters.status && filters.status !== 'all') {
      allTasks = allTasks.filter(t => t.status === filters.status);
    }

    const taskIds = new Set(allTasks.map(t => t.id));
    allTimesheets = allTimesheets.filter(ts => taskIds.has(ts.taskId));

    if (filters.billable && filters.billable !== 'all') {
      const isBillable = filters.billable === 'true';
      allTimesheets = allTimesheets.filter(ts => ts.billable === isBillable);
    }

    if (filters.start || filters.end) {
      allTimesheets = allTimesheets.filter(ts => {
        if (!ts.createdAt) return false;
        const tsDate = ts.createdAt instanceof Date ? ts.createdAt : new Date(ts.createdAt);
        if (filters.start && tsDate < new Date(filters.start)) return false;
        if (filters.end && tsDate > new Date(filters.end)) return false;
        return true;
      });
    }

    const totalProjects = allProjects.length;
    const tasksCompleted = allTasks.filter(t => t.status === 'Completed').length;
    const totalHours = allTimesheets.reduce((sum, t) => sum + t.timeLogged, 0);
    const billableHours = allTimesheets.filter(t => t.billable).reduce((sum, t) => sum + t.timeLogged, 0);
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
    let allProjects = await db.select().from(projects);
    
    if (filters.project && filters.project !== 'all') {
      allProjects = allProjects.filter(p => p.id === filters.project);
    }

    return allProjects.map(p => ({
      name: p.name,
      cost: p.cost,
      revenue: p.revenue,
    }));
  }

  async getResourceUtilization(filters: any): Promise<any> {
    let allTimesheets = await db.select().from(timesheets);

    if (filters.project && filters.project !== 'all') {
      const allTasks = await db.select().from(tasks);
      const filteredTasks = allTasks.filter(t => t.projectId === filters.project);
      const taskIds = new Set(filteredTasks.map(t => t.id));
      allTimesheets = allTimesheets.filter(ts => taskIds.has(ts.taskId));
    }

    if (filters.employee && filters.employee !== 'all') {
      allTimesheets = allTimesheets.filter(ts => ts.employeeId === filters.employee);
    }

    if (filters.start || filters.end) {
      allTimesheets = allTimesheets.filter(ts => {
        if (!ts.createdAt) return false;
        const tsDate = ts.createdAt instanceof Date ? ts.createdAt : new Date(ts.createdAt);
        if (filters.start && tsDate < new Date(filters.start)) return false;
        if (filters.end && tsDate > new Date(filters.end)) return false;
        return true;
      });
    }

    const billableHours = allTimesheets.filter(t => t.billable).reduce((sum, t) => sum + t.timeLogged, 0);
    const nonBillableHours = allTimesheets.filter(t => !t.billable).reduce((sum, t) => sum + t.timeLogged, 0);

    return [
      { name: 'Billable', value: billableHours },
      { name: 'Non-Billable', value: nonBillableHours },
    ];
  }

  async getProjectCompletion(filters: any): Promise<any> {
    let allProjects = await db.select().from(projects);
    
    if (filters.project && filters.project !== 'all') {
      allProjects = allProjects.filter(p => p.id === filters.project);
    }

    return allProjects.map(p => ({
      name: p.name,
      value: p.totalTasks > 0 ? Math.round((p.completedTasks / p.totalTasks) * 100) : 0,
    }));
  }

  async getWorkloadTrend(filters: any): Promise<any> {
    let allTimesheets = await db.select().from(timesheets);
    
    if (filters.project && filters.project !== 'all') {
      const allTasks = await db.select().from(tasks);
      const filteredTasks = allTasks.filter(t => t.projectId === filters.project);
      const taskIds = new Set(filteredTasks.map(t => t.id));
      allTimesheets = allTimesheets.filter(ts => taskIds.has(ts.taskId));
    }
    
    if (filters.employee && filters.employee !== 'all') {
      allTimesheets = allTimesheets.filter(ts => ts.employeeId === filters.employee);
    }

    const monthlyData: Record<string, number> = {};

    allTimesheets.forEach(t => {
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
    let allProjects = await db.select().from(projects);
    
    if (filters.project && filters.project !== 'all') {
      allProjects = allProjects.filter(p => p.id === filters.project);
    }

    const monthlyData: Record<string, { revenue: number; expense: number }> = {};

    allProjects.forEach(p => {
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
    let allTasks = await db.select().from(tasks);

    if (filters.project && filters.project !== 'all') {
      allTasks = allTasks.filter(t => t.projectId === filters.project);
    }

    if (filters.employee && filters.employee !== 'all') {
      allTasks = allTasks.filter(t => t.assigneeId === filters.employee);
    }

    const statusCounts: Record<string, number> = {};

    allTasks.forEach(t => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }

  async getAnalyticsFilters(): Promise<any> {
    const allProjects = await db.select().from(projects);
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    }).from(users);

    return {
      projects: allProjects.map(p => ({ id: p.id, name: p.name })),
      employees: allUsers.map(u => ({ id: u.id, name: u.name })),
      statuses: ['Planned', 'In Progress', 'Completed', 'Blocked'],
    };
  }
}

export const pgStorage = new PgStorage();

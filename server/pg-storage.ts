import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  users, projects, tasks, timesheets, partners, products, taxes,
  salesOrders, salesOrderLines, purchaseOrders, purchaseOrderLines,
  invoices, invoiceLines, expenses
} from "@shared/schema";
import type { 
  User, InsertUser, UserWithoutPassword, 
  Project, InsertProject, 
  Task, InsertTask, 
  Timesheet, InsertTimesheet,
  Partner, InsertPartner,
  Product, InsertProduct,
  Tax, InsertTax,
  SalesOrder, InsertSalesOrder,
  SalesOrderLine, InsertSalesOrderLine,
  PurchaseOrder, InsertPurchaseOrder,
  PurchaseOrderLine, InsertPurchaseOrderLine,
  Invoice, InsertInvoice,
  InvoiceLine, InsertInvoiceLine,
  Expense, InsertExpense
} from "@shared/schema";
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

  async getPartner(id: string): Promise<Partner | undefined> {
    const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
    return result[0];
  }

  async getAllPartners(filters?: any): Promise<Partner[]> {
    const result = await db.select().from(partners);
    return result;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const result = await db.insert(partners).values(insertPartner).returning();
    return result[0];
  }

  async updatePartner(id: string, updateData: Partial<InsertPartner>): Promise<Partner | undefined> {
    const result = await db
      .update(partners)
      .set(updateData)
      .where(eq(partners.id, id))
      .returning();
    return result[0];
  }

  async deletePartner(id: string): Promise<boolean> {
    const result = await db.delete(partners).where(eq(partners.id, id)).returning();
    return result.length > 0;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async getAllProducts(filters?: any): Promise<Product[]> {
    const result = await db.select().from(products);
    return result;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const productData: any = { ...insertProduct };
    if (productData.salesPrice !== undefined && typeof productData.salesPrice === 'number') {
      productData.salesPrice = productData.salesPrice.toFixed(2);
    }
    if (productData.cost !== undefined && typeof productData.cost === 'number') {
      productData.cost = productData.cost.toFixed(2);
    }
    const result = await db.insert(products).values(productData).returning();
    return result[0];
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const productData: any = { ...updateData };
    if (productData.salesPrice !== undefined && typeof productData.salesPrice === 'number') {
      productData.salesPrice = productData.salesPrice.toFixed(2);
    }
    if (productData.cost !== undefined && typeof productData.cost === 'number') {
      productData.cost = productData.cost.toFixed(2);
    }
    const result = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async getTax(id: string): Promise<Tax | undefined> {
    const result = await db.select().from(taxes).where(eq(taxes.id, id)).limit(1);
    return result[0];
  }

  async getAllTaxes(): Promise<Tax[]> {
    const result = await db.select().from(taxes);
    return result;
  }

  async createTax(insertTax: InsertTax): Promise<Tax> {
    const taxData: any = { ...insertTax };
    if (taxData.rate !== undefined && typeof taxData.rate === 'number') {
      taxData.rate = taxData.rate.toFixed(3);
    }
    const result = await db.insert(taxes).values(taxData).returning();
    return result[0];
  }

  async updateTax(id: string, updateData: Partial<InsertTax>): Promise<Tax | undefined> {
    const taxData: any = { ...updateData };
    if (taxData.rate !== undefined && typeof taxData.rate === 'number') {
      taxData.rate = taxData.rate.toFixed(3);
    }
    const result = await db
      .update(taxes)
      .set(taxData)
      .where(eq(taxes.id, id))
      .returning();
    return result[0];
  }

  async deleteTax(id: string): Promise<boolean> {
    const result = await db.delete(taxes).where(eq(taxes.id, id)).returning();
    return result.length > 0;
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    const result = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1);
    return result[0];
  }

  async getAllSalesOrders(filters?: any): Promise<SalesOrder[]> {
    const result = await db.select().from(salesOrders);
    return result;
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const orderData: any = { ...insertOrder };
    if (orderData.untaxedAmount !== undefined && typeof orderData.untaxedAmount === 'number') {
      orderData.untaxedAmount = orderData.untaxedAmount.toFixed(2);
    }
    if (orderData.totalAmount !== undefined && typeof orderData.totalAmount === 'number') {
      orderData.totalAmount = orderData.totalAmount.toFixed(2);
    }
    const result = await db.insert(salesOrders).values(orderData).returning();
    return result[0];
  }

  async updateSalesOrder(id: string, updateData: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const orderData: any = { ...updateData };
    if (orderData.untaxedAmount !== undefined && typeof orderData.untaxedAmount === 'number') {
      orderData.untaxedAmount = orderData.untaxedAmount.toFixed(2);
    }
    if (orderData.totalAmount !== undefined && typeof orderData.totalAmount === 'number') {
      orderData.totalAmount = orderData.totalAmount.toFixed(2);
    }
    const result = await db
      .update(salesOrders)
      .set(orderData)
      .where(eq(salesOrders.id, id))
      .returning();
    return result[0];
  }

  async deleteSalesOrder(id: string): Promise<boolean> {
    const result = await db.delete(salesOrders).where(eq(salesOrders.id, id)).returning();
    return result.length > 0;
  }

  async getSalesOrderLines(orderId: string): Promise<SalesOrderLine[]> {
    const result = await db.select().from(salesOrderLines).where(eq(salesOrderLines.orderId, orderId));
    return result;
  }

  async addSalesOrderLine(insertLine: InsertSalesOrderLine): Promise<SalesOrderLine> {
    const lineData: any = { ...insertLine };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db.insert(salesOrderLines).values(lineData).returning();
    return result[0];
  }

  async updateSalesOrderLine(id: string, updateData: Partial<InsertSalesOrderLine>): Promise<SalesOrderLine | undefined> {
    const lineData: any = { ...updateData };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db
      .update(salesOrderLines)
      .set(lineData)
      .where(eq(salesOrderLines.id, id))
      .returning();
    return result[0];
  }

  async deleteSalesOrderLine(id: string): Promise<boolean> {
    const result = await db.delete(salesOrderLines).where(eq(salesOrderLines.id, id)).returning();
    return result.length > 0;
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    const result = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);
    return result[0];
  }

  async getAllPurchaseOrders(filters?: any): Promise<PurchaseOrder[]> {
    const result = await db.select().from(purchaseOrders);
    return result;
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const orderData: any = { ...insertOrder };
    if (orderData.untaxedAmount !== undefined && typeof orderData.untaxedAmount === 'number') {
      orderData.untaxedAmount = orderData.untaxedAmount.toFixed(2);
    }
    if (orderData.totalAmount !== undefined && typeof orderData.totalAmount === 'number') {
      orderData.totalAmount = orderData.totalAmount.toFixed(2);
    }
    const result = await db.insert(purchaseOrders).values(orderData).returning();
    return result[0];
  }

  async updatePurchaseOrder(id: string, updateData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const orderData: any = { ...updateData };
    if (orderData.untaxedAmount !== undefined && typeof orderData.untaxedAmount === 'number') {
      orderData.untaxedAmount = orderData.untaxedAmount.toFixed(2);
    }
    if (orderData.totalAmount !== undefined && typeof orderData.totalAmount === 'number') {
      orderData.totalAmount = orderData.totalAmount.toFixed(2);
    }
    const result = await db
      .update(purchaseOrders)
      .set(orderData)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return result[0];
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    const result = await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id)).returning();
    return result.length > 0;
  }

  async getPurchaseOrderLines(orderId: string): Promise<PurchaseOrderLine[]> {
    const result = await db.select().from(purchaseOrderLines).where(eq(purchaseOrderLines.orderId, orderId));
    return result;
  }

  async addPurchaseOrderLine(insertLine: InsertPurchaseOrderLine): Promise<PurchaseOrderLine> {
    const lineData: any = { ...insertLine };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db.insert(purchaseOrderLines).values(lineData).returning();
    return result[0];
  }

  async updatePurchaseOrderLine(id: string, updateData: Partial<InsertPurchaseOrderLine>): Promise<PurchaseOrderLine | undefined> {
    const lineData: any = { ...updateData };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db
      .update(purchaseOrderLines)
      .set(lineData)
      .where(eq(purchaseOrderLines.id, id))
      .returning();
    return result[0];
  }

  async deletePurchaseOrderLine(id: string): Promise<boolean> {
    const result = await db.delete(purchaseOrderLines).where(eq(purchaseOrderLines.id, id)).returning();
    return result.length > 0;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return result[0];
  }

  async getAllInvoices(filters?: any): Promise<Invoice[]> {
    const result = await db.select().from(invoices);
    return result;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const invoiceData: any = { ...insertInvoice };
    if (invoiceData.untaxedAmount !== undefined && typeof invoiceData.untaxedAmount === 'number') {
      invoiceData.untaxedAmount = invoiceData.untaxedAmount.toFixed(2);
    }
    if (invoiceData.totalAmount !== undefined && typeof invoiceData.totalAmount === 'number') {
      invoiceData.totalAmount = invoiceData.totalAmount.toFixed(2);
    }
    const result = await db.insert(invoices).values(invoiceData).returning();
    return result[0];
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoiceData: any = { ...updateData };
    if (invoiceData.untaxedAmount !== undefined && typeof invoiceData.untaxedAmount === 'number') {
      invoiceData.untaxedAmount = invoiceData.untaxedAmount.toFixed(2);
    }
    if (invoiceData.totalAmount !== undefined && typeof invoiceData.totalAmount === 'number') {
      invoiceData.totalAmount = invoiceData.totalAmount.toFixed(2);
    }
    const result = await db
      .update(invoices)
      .set(invoiceData)
      .where(eq(invoices.id, id))
      .returning();
    return result[0];
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return result.length > 0;
  }

  async getInvoiceLines(invoiceId: string): Promise<InvoiceLine[]> {
    const result = await db.select().from(invoiceLines).where(eq(invoiceLines.invoiceId, invoiceId));
    return result;
  }

  async addInvoiceLine(insertLine: InsertInvoiceLine): Promise<InvoiceLine> {
    const lineData: any = { ...insertLine };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db.insert(invoiceLines).values(lineData).returning();
    return result[0];
  }

  async updateInvoiceLine(id: string, updateData: Partial<InsertInvoiceLine>): Promise<InvoiceLine | undefined> {
    const lineData: any = { ...updateData };
    if (lineData.quantity !== undefined && typeof lineData.quantity === 'number') {
      lineData.quantity = lineData.quantity.toFixed(3);
    }
    if (lineData.unitPrice !== undefined && typeof lineData.unitPrice === 'number') {
      lineData.unitPrice = lineData.unitPrice.toFixed(2);
    }
    if (lineData.amount !== undefined && typeof lineData.amount === 'number') {
      lineData.amount = lineData.amount.toFixed(2);
    }
    const result = await db
      .update(invoiceLines)
      .set(lineData)
      .where(eq(invoiceLines.id, id))
      .returning();
    return result[0];
  }

  async deleteInvoiceLine(id: string): Promise<boolean> {
    const result = await db.delete(invoiceLines).where(eq(invoiceLines.id, id)).returning();
    return result.length > 0;
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return result[0];
  }

  async getAllExpenses(filters?: any): Promise<Expense[]> {
    const result = await db.select().from(expenses);
    return result;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const expenseData: any = { ...insertExpense };
    if (expenseData.periodStart) {
      const date = new Date(expenseData.periodStart);
      if (!isNaN(date.getTime())) {
        expenseData.periodStart = date.toISOString().split('T')[0];
      }
    }
    if (expenseData.periodEnd) {
      const date = new Date(expenseData.periodEnd);
      if (!isNaN(date.getTime())) {
        expenseData.periodEnd = date.toISOString().split('T')[0];
      }
    }
    const result = await db.insert(expenses).values(expenseData).returning();
    return result[0];
  }

  async updateExpense(id: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expenseData: any = { ...updateData };
    if (expenseData.periodStart) {
      const date = new Date(expenseData.periodStart);
      if (!isNaN(date.getTime())) {
        expenseData.periodStart = date.toISOString().split('T')[0];
      }
    }
    if (expenseData.periodEnd) {
      const date = new Date(expenseData.periodEnd);
      if (!isNaN(date.getTime())) {
        expenseData.periodEnd = date.toISOString().split('T')[0];
      }
    }
    const result = await db
      .update(expenses)
      .set(expenseData)
      .where(eq(expenses.id, id))
      .returning();
    return result[0];
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id)).returning();
    return result.length > 0;
  }
}

export const pgStorage = new PgStorage();

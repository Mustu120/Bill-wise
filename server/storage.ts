import { 
  type User, type InsertUser, type UserWithoutPassword, 
  type Project, type InsertProject, 
  type Task, type InsertTask, 
  type Timesheet, type InsertTimesheet,
  type Partner, type InsertPartner,
  type Product, type InsertProduct,
  type Tax, type InsertTax,
  type SalesOrder, type InsertSalesOrder,
  type SalesOrderLine, type InsertSalesOrderLine,
  type PurchaseOrder, type InsertPurchaseOrder,
  type PurchaseOrderLine, type InsertPurchaseOrderLine,
  type Invoice, type InsertInvoice,
  type InvoiceLine, type InsertInvoiceLine,
  type Expense, type InsertExpense
} from "@shared/schema";
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
  
  getPartner(id: string): Promise<Partner | undefined>;
  getAllPartners(filters?: any): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<boolean>;
  
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(filters?: any): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  getTax(id: string): Promise<Tax | undefined>;
  getAllTaxes(): Promise<Tax[]>;
  createTax(tax: InsertTax): Promise<Tax>;
  updateTax(id: string, tax: Partial<InsertTax>): Promise<Tax | undefined>;
  deleteTax(id: string): Promise<boolean>;
  
  getSalesOrder(id: string): Promise<SalesOrder | undefined>;
  getAllSalesOrders(filters?: any): Promise<SalesOrder[]>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: string, order: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(id: string): Promise<boolean>;
  getSalesOrderLines(orderId: string): Promise<SalesOrderLine[]>;
  addSalesOrderLine(line: InsertSalesOrderLine): Promise<SalesOrderLine>;
  updateSalesOrderLine(id: string, line: Partial<InsertSalesOrderLine>): Promise<SalesOrderLine | undefined>;
  deleteSalesOrderLine(id: string): Promise<boolean>;
  
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(filters?: any): Promise<PurchaseOrder[]>;
  createPurchaseOrder(order: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, order: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  deletePurchaseOrder(id: string): Promise<boolean>;
  getPurchaseOrderLines(orderId: string): Promise<PurchaseOrderLine[]>;
  addPurchaseOrderLine(line: InsertPurchaseOrderLine): Promise<PurchaseOrderLine>;
  updatePurchaseOrderLine(id: string, line: Partial<InsertPurchaseOrderLine>): Promise<PurchaseOrderLine | undefined>;
  deletePurchaseOrderLine(id: string): Promise<boolean>;
  
  getInvoice(id: string): Promise<Invoice | undefined>;
  getAllInvoices(filters?: any): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getInvoiceLines(invoiceId: string): Promise<InvoiceLine[]>;
  addInvoiceLine(line: InsertInvoiceLine): Promise<InvoiceLine>;
  updateInvoiceLine(id: string, line: Partial<InsertInvoiceLine>): Promise<InvoiceLine | undefined>;
  deleteInvoiceLine(id: string): Promise<boolean>;
  
  getExpense(id: string): Promise<Expense | undefined>;
  getAllExpenses(filters?: any): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<string, Project>;
  private tasks: Map<string, Task>;
  private timesheets: Map<string, Timesheet>;
  private partners: Map<string, Partner>;
  private products: Map<string, Product>;
  private taxes: Map<string, Tax>;
  private salesOrders: Map<string, SalesOrder>;
  private salesOrderLines: Map<string, SalesOrderLine>;
  private purchaseOrders: Map<string, PurchaseOrder>;
  private purchaseOrderLines: Map<string, PurchaseOrderLine>;
  private invoices: Map<string, Invoice>;
  private invoiceLines: Map<string, InvoiceLine>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.timesheets = new Map();
    this.partners = new Map();
    this.products = new Map();
    this.taxes = new Map();
    this.salesOrders = new Map();
    this.salesOrderLines = new Map();
    this.purchaseOrders = new Map();
    this.purchaseOrderLines = new Map();
    this.invoices = new Map();
    this.invoiceLines = new Map();
    this.expenses = new Map();
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
      description: insertProject.description || null,
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

  async getPartner(id: string): Promise<Partner | undefined> {
    return this.partners.get(id);
  }

  async getAllPartners(filters?: any): Promise<Partner[]> {
    let partners = Array.from(this.partners.values());
    if (filters?.search) {
      partners = partners.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters?.type && filters.type !== 'all') {
      partners = partners.filter(p => p.type === filters.type || p.type === 'both');
    }
    return partners;
  }

  async createPartner(insertPartner: InsertPartner): Promise<Partner> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const partner: Partner = { 
      ...insertPartner, 
      id, 
      type: insertPartner.type || "both",
      createdAt: new Date() 
    };
    this.partners.set(id, partner);
    return partner;
  }

  async updatePartner(id: string, updateData: Partial<InsertPartner>): Promise<Partner | undefined> {
    const partner = this.partners.get(id);
    if (!partner) return undefined;
    const updatedPartner = { ...partner, ...updateData };
    this.partners.set(id, updatedPartner);
    return updatedPartner;
  }

  async deletePartner(id: string): Promise<boolean> {
    return this.partners.delete(id);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(filters?: any): Promise<Product[]> {
    let products = Array.from(this.products.values());
    if (filters?.search) {
      products = products.filter(p => p.name.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters?.forSales !== undefined) {
      products = products.filter(p => p.forSales === filters.forSales);
    }
    if (filters?.forPurchase !== undefined) {
      products = products.filter(p => p.forPurchase === filters.forPurchase);
    }
    if (filters?.forExpenses !== undefined) {
      products = products.filter(p => p.forExpenses === filters.forExpenses);
    }
    return products;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const product: Product = { 
      name: insertProduct.name,
      forSales: insertProduct.forSales || false,
      forPurchase: insertProduct.forPurchase || false,
      forExpenses: insertProduct.forExpenses || false,
      salesPrice: insertProduct.salesPrice !== undefined ? insertProduct.salesPrice.toFixed(2) : "0",
      cost: insertProduct.cost !== undefined ? insertProduct.cost.toFixed(2) : "0",
      taxIds: insertProduct.taxIds || null,
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    const updatedProduct = { 
      ...product, 
      ...updateData,
      salesPrice: updateData.salesPrice !== undefined ? updateData.salesPrice.toFixed(2) : product.salesPrice,
      cost: updateData.cost !== undefined ? updateData.cost.toFixed(2) : product.cost,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getTax(id: string): Promise<Tax | undefined> {
    return this.taxes.get(id);
  }

  async getAllTaxes(): Promise<Tax[]> {
    return Array.from(this.taxes.values());
  }

  async createTax(insertTax: InsertTax): Promise<Tax> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const tax: Tax = { 
      name: insertTax.name,
      rate: insertTax.rate.toFixed(3),
      id, 
      createdAt: new Date() 
    };
    this.taxes.set(id, tax);
    return tax;
  }

  async updateTax(id: string, updateData: Partial<InsertTax>): Promise<Tax | undefined> {
    const tax = this.taxes.get(id);
    if (!tax) return undefined;
    const updatedTax = { 
      ...tax, 
      ...updateData,
      rate: updateData.rate !== undefined ? updateData.rate.toFixed(3) : tax.rate,
    };
    this.taxes.set(id, updatedTax);
    return updatedTax;
  }

  async deleteTax(id: string): Promise<boolean> {
    return this.taxes.delete(id);
  }

  async getSalesOrder(id: string): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async getAllSalesOrders(filters?: any): Promise<SalesOrder[]> {
    let orders = Array.from(this.salesOrders.values());
    if (filters?.search) {
      orders = orders.filter(o => o.code.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters?.projectId && filters.projectId !== 'all') {
      orders = orders.filter(o => o.projectId === filters.projectId);
    }
    if (filters?.customerId && filters.customerId !== 'all') {
      orders = orders.filter(o => o.customerId === filters.customerId);
    }
    if (filters?.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status === filters.status);
    }
    return orders;
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const order: SalesOrder = { 
      code: insertOrder.code,
      customerId: insertOrder.customerId || null,
      projectId: insertOrder.projectId || null,
      status: insertOrder.status || "Draft",
      id, 
      untaxedAmount: "0",
      totalAmount: "0",
      createdAt: new Date() 
    };
    this.salesOrders.set(id, order);
    return order;
  }

  async updateSalesOrder(id: string, updateData: Partial<InsertSalesOrder>): Promise<SalesOrder | undefined> {
    const order = this.salesOrders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updateData };
    this.salesOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteSalesOrder(id: string): Promise<boolean> {
    return this.salesOrders.delete(id);
  }

  async getSalesOrderLines(orderId: string): Promise<SalesOrderLine[]> {
    return Array.from(this.salesOrderLines.values()).filter(l => l.orderId === orderId);
  }

  async addSalesOrderLine(insertLine: InsertSalesOrderLine): Promise<SalesOrderLine> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const line: SalesOrderLine = { 
      orderId: insertLine.orderId,
      productId: insertLine.productId || null,
      quantity: insertLine.quantity.toFixed(3),
      unit: insertLine.unit || null,
      unitPrice: insertLine.unitPrice.toFixed(2),
      taxIds: insertLine.taxIds || null,
      amount: insertLine.amount.toFixed(2),
      id 
    };
    this.salesOrderLines.set(id, line);
    return line;
  }

  async updateSalesOrderLine(id: string, updateData: Partial<InsertSalesOrderLine>): Promise<SalesOrderLine | undefined> {
    const line = this.salesOrderLines.get(id);
    if (!line) return undefined;
    const updatedLine = { 
      ...line, 
      ...updateData,
      quantity: updateData.quantity !== undefined ? updateData.quantity.toFixed(3) : line.quantity,
      unitPrice: updateData.unitPrice !== undefined ? updateData.unitPrice.toFixed(2) : line.unitPrice,
      amount: updateData.amount !== undefined ? updateData.amount.toFixed(2) : line.amount,
    };
    this.salesOrderLines.set(id, updatedLine);
    return updatedLine;
  }

  async deleteSalesOrderLine(id: string): Promise<boolean> {
    return this.salesOrderLines.delete(id);
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return this.purchaseOrders.get(id);
  }

  async getAllPurchaseOrders(filters?: any): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.purchaseOrders.values());
    if (filters?.search) {
      orders = orders.filter(o => o.code.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters?.projectId && filters.projectId !== 'all') {
      orders = orders.filter(o => o.projectId === filters.projectId);
    }
    if (filters?.vendorId && filters.vendorId !== 'all') {
      orders = orders.filter(o => o.vendorId === filters.vendorId);
    }
    if (filters?.status && filters.status !== 'all') {
      orders = orders.filter(o => o.status === filters.status);
    }
    return orders;
  }

  async createPurchaseOrder(insertOrder: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const order: PurchaseOrder = { 
      code: insertOrder.code,
      vendorId: insertOrder.vendorId || null,
      projectId: insertOrder.projectId || null,
      status: insertOrder.status || "Draft",
      id, 
      untaxedAmount: "0",
      totalAmount: "0",
      createdAt: new Date() 
    };
    this.purchaseOrders.set(id, order);
    return order;
  }

  async updatePurchaseOrder(id: string, updateData: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const order = this.purchaseOrders.get(id);
    if (!order) return undefined;
    const updatedOrder = { ...order, ...updateData };
    this.purchaseOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deletePurchaseOrder(id: string): Promise<boolean> {
    return this.purchaseOrders.delete(id);
  }

  async getPurchaseOrderLines(orderId: string): Promise<PurchaseOrderLine[]> {
    return Array.from(this.purchaseOrderLines.values()).filter(l => l.orderId === orderId);
  }

  async addPurchaseOrderLine(insertLine: InsertPurchaseOrderLine): Promise<PurchaseOrderLine> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const line: PurchaseOrderLine = { 
      orderId: insertLine.orderId,
      productId: insertLine.productId || null,
      quantity: insertLine.quantity.toFixed(3),
      unit: insertLine.unit || null,
      unitPrice: insertLine.unitPrice.toFixed(2),
      taxIds: insertLine.taxIds || null,
      amount: insertLine.amount.toFixed(2),
      id 
    };
    this.purchaseOrderLines.set(id, line);
    return line;
  }

  async updatePurchaseOrderLine(id: string, updateData: Partial<InsertPurchaseOrderLine>): Promise<PurchaseOrderLine | undefined> {
    const line = this.purchaseOrderLines.get(id);
    if (!line) return undefined;
    const updatedLine = { 
      ...line, 
      ...updateData,
      quantity: updateData.quantity !== undefined ? updateData.quantity.toFixed(3) : line.quantity,
      unitPrice: updateData.unitPrice !== undefined ? updateData.unitPrice.toFixed(2) : line.unitPrice,
      amount: updateData.amount !== undefined ? updateData.amount.toFixed(2) : line.amount,
    };
    this.purchaseOrderLines.set(id, updatedLine);
    return updatedLine;
  }

  async deletePurchaseOrderLine(id: string): Promise<boolean> {
    return this.purchaseOrderLines.delete(id);
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(filters?: any): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());
    if (filters?.search) {
      invoices = invoices.filter(i => i.number.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters?.type && filters.type !== 'all') {
      invoices = invoices.filter(i => i.type === filters.type);
    }
    if (filters?.projectId && filters.projectId !== 'all') {
      invoices = invoices.filter(i => i.projectId === filters.projectId);
    }
    if (filters?.partnerId && filters.partnerId !== 'all') {
      invoices = invoices.filter(i => i.partnerId === filters.partnerId);
    }
    if (filters?.status && filters.status !== 'all') {
      invoices = invoices.filter(i => i.status === filters.status);
    }
    return invoices;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const invoice: Invoice = { 
      number: insertInvoice.number,
      type: insertInvoice.type,
      partnerId: insertInvoice.partnerId || null,
      projectId: insertInvoice.projectId || null,
      status: insertInvoice.status || "Draft",
      id, 
      untaxedAmount: "0",
      totalAmount: "0",
      createdAt: new Date() 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: string, updateData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    const updatedInvoice = { ...invoice, ...updateData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  async getInvoiceLines(invoiceId: string): Promise<InvoiceLine[]> {
    return Array.from(this.invoiceLines.values()).filter(l => l.invoiceId === invoiceId);
  }

  async addInvoiceLine(insertLine: InsertInvoiceLine): Promise<InvoiceLine> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const line: InvoiceLine = { 
      invoiceId: insertLine.invoiceId,
      productId: insertLine.productId || null,
      quantity: insertLine.quantity.toFixed(3),
      unitPrice: insertLine.unitPrice.toFixed(2),
      taxIds: insertLine.taxIds || null,
      amount: insertLine.amount.toFixed(2),
      id 
    };
    this.invoiceLines.set(id, line);
    return line;
  }

  async updateInvoiceLine(id: string, updateData: Partial<InsertInvoiceLine>): Promise<InvoiceLine | undefined> {
    const line = this.invoiceLines.get(id);
    if (!line) return undefined;
    const updatedLine = { 
      ...line, 
      ...updateData,
      quantity: updateData.quantity !== undefined ? updateData.quantity.toFixed(3) : line.quantity,
      unitPrice: updateData.unitPrice !== undefined ? updateData.unitPrice.toFixed(2) : line.unitPrice,
      amount: updateData.amount !== undefined ? updateData.amount.toFixed(2) : line.amount,
    };
    this.invoiceLines.set(id, updatedLine);
    return updatedLine;
  }

  async deleteInvoiceLine(id: string): Promise<boolean> {
    return this.invoiceLines.delete(id);
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getAllExpenses(filters?: any): Promise<Expense[]> {
    let expenses = Array.from(this.expenses.values());
    if (filters?.search) {
      expenses = expenses.filter(e => 
        e.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    if (filters?.projectId && filters.projectId !== 'all') {
      expenses = expenses.filter(e => e.projectId === filters.projectId);
    }
    return expenses;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const crypto = await import("crypto");
    const id = crypto.randomUUID();
    const expense: Expense = { 
      name: insertExpense.name,
      projectId: insertExpense.projectId || null,
      periodStart: insertExpense.periodStart ? new Date(insertExpense.periodStart).toISOString().slice(0, 10) : null,
      periodEnd: insertExpense.periodEnd ? new Date(insertExpense.periodEnd).toISOString().slice(0, 10) : null,
      imageUrl: insertExpense.imageUrl || null,
      description: insertExpense.description || null,
      id, 
      ocrData: null,
      createdAt: new Date() 
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    const updatedExpense = { 
      ...expense, 
      ...updateData,
      periodStart: updateData.periodStart !== undefined 
        ? (updateData.periodStart ? new Date(updateData.periodStart).toISOString().slice(0, 10) : null)
        : expense.periodStart,
      periodEnd: updateData.periodEnd !== undefined 
        ? (updateData.periodEnd ? new Date(updateData.periodEnd).toISOString().slice(0, 10) : null)
        : expense.periodEnd,
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }
}

export const storage = pgStorage;

// Database storage implementation following javascript_database blueprint
import {
  customers,
  users,
  datasets,
  dashboards,
  charts,
  insights,
  customMetrics,
  llmProviders,
  customerLlmConfigs,
  type Customer,
  type InsertCustomer,
  type User,
  type InsertUser,
  type Dataset,
  type InsertDataset,
  type Dashboard,
  type InsertDashboard,
  type Chart,
  type InsertChart,
  type Insight,
  type InsertInsight,
  type CustomMetric,
  type InsertCustomMetric,
  type LlmProvider,
  type InsertLlmProvider,
  type CustomerLlmConfig,
  type InsertCustomerLlmConfig,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customer methods
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerBySlug(slug: string): Promise<Customer | undefined>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<void>;

  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUsers(customerId?: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;

  // LLM Provider methods
  createLlmProvider(provider: InsertLlmProvider): Promise<LlmProvider>;
  getLlmProviders(): Promise<LlmProvider[]>;
  getLlmProvider(id: string): Promise<LlmProvider | undefined>;
  updateLlmProvider(id: string, provider: Partial<InsertLlmProvider>): Promise<LlmProvider | undefined>;
  deleteLlmProvider(id: string): Promise<void>;

  // Customer LLM Config methods
  createCustomerLlmConfig(config: InsertCustomerLlmConfig): Promise<CustomerLlmConfig>;
  getCustomerLlmConfigs(customerId: string): Promise<CustomerLlmConfig[]>;
  getDefaultLlmConfig(customerId: string): Promise<CustomerLlmConfig | undefined>;
  updateCustomerLlmConfig(id: string, config: Partial<InsertCustomerLlmConfig>): Promise<CustomerLlmConfig | undefined>;
  deleteCustomerLlmConfig(id: string): Promise<void>;

  // Dataset methods
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDatasets(customerId: string): Promise<Dataset[]>;
  getDataset(id: string, customerId: string): Promise<Dataset | undefined>;
  deleteDataset(id: string, customerId: string): Promise<void>;

  // Dashboard methods
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  getDashboards(customerId: string, userId?: string): Promise<Dashboard[]>;
  getDashboard(id: string, customerId: string): Promise<Dashboard | undefined>;
  updateDashboard(id: string, customerId: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string, customerId: string): Promise<void>;

  // Chart methods
  createChart(chart: InsertChart): Promise<Chart>;
  getCharts(dashboardId: string, customerId: string): Promise<Chart[]>;
  getChart(id: string, customerId: string): Promise<Chart | undefined>;
  updateChart(id: string, customerId: string, chart: Partial<InsertChart>): Promise<Chart | undefined>;
  deleteChart(id: string, customerId: string): Promise<void>;

  // Insight methods
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsights(customerId: string, dashboardId?: string, datasetId?: string): Promise<Insight[]>;

  // Custom metric methods
  createCustomMetric(metric: InsertCustomMetric): Promise<CustomMetric>;
  getCustomMetrics(customerId: string, datasetId: string): Promise<CustomMetric[]>;
  deleteCustomMetric(id: string, customerId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Customer methods
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [result] = await db.insert(customers).values(customer).returning();
    return result;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerBySlug(slug: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.slug, slug));
    return customer || undefined;
  }

  async updateCustomer(id: string, customerUpdate: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ ...customerUpdate, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }

  async getUsers(customerId?: string): Promise<User[]> {
    if (customerId) {
      return await db.select().from(users).where(eq(users.customerId, customerId)).orderBy(desc(users.createdAt));
    }
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async updateUser(id: string, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...userUpdate, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // LLM Provider methods
  async createLlmProvider(provider: InsertLlmProvider): Promise<LlmProvider> {
    const [result] = await db.insert(llmProviders).values(provider).returning();
    return result;
  }

  async getLlmProviders(): Promise<LlmProvider[]> {
    return await db.select().from(llmProviders).orderBy(desc(llmProviders.createdAt));
  }

  async getLlmProvider(id: string): Promise<LlmProvider | undefined> {
    const [provider] = await db.select().from(llmProviders).where(eq(llmProviders.id, id));
    return provider || undefined;
  }

  async updateLlmProvider(id: string, providerUpdate: Partial<InsertLlmProvider>): Promise<LlmProvider | undefined> {
    const [updated] = await db
      .update(llmProviders)
      .set(providerUpdate)
      .where(eq(llmProviders.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteLlmProvider(id: string): Promise<void> {
    await db.delete(llmProviders).where(eq(llmProviders.id, id));
  }

  // Customer LLM Config methods
  async createCustomerLlmConfig(config: InsertCustomerLlmConfig): Promise<CustomerLlmConfig> {
    const [result] = await db.insert(customerLlmConfigs).values(config).returning();
    return result;
  }

  async getCustomerLlmConfigs(customerId: string): Promise<CustomerLlmConfig[]> {
    return await db
      .select()
      .from(customerLlmConfigs)
      .where(eq(customerLlmConfigs.customerId, customerId))
      .orderBy(desc(customerLlmConfigs.createdAt));
  }

  async getDefaultLlmConfig(customerId: string): Promise<CustomerLlmConfig | undefined> {
    const [config] = await db
      .select()
      .from(customerLlmConfigs)
      .where(and(
        eq(customerLlmConfigs.customerId, customerId),
        eq(customerLlmConfigs.isDefault, true)
      ));
    return config || undefined;
  }

  async updateCustomerLlmConfig(id: string, configUpdate: Partial<InsertCustomerLlmConfig>): Promise<CustomerLlmConfig | undefined> {
    const [updated] = await db
      .update(customerLlmConfigs)
      .set({ ...configUpdate, updatedAt: new Date() })
      .where(eq(customerLlmConfigs.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCustomerLlmConfig(id: string): Promise<void> {
    await db.delete(customerLlmConfigs).where(eq(customerLlmConfigs.id, id));
  }

  // Dataset methods
  async createDataset(data: InsertDataset): Promise<Dataset> {
    const id = randomUUID();

    // Extract column names from schema or data
    let columns: string[] = [];
    if (data.schemaInfo && typeof data.schemaInfo === 'object' && 'columns' in data.schemaInfo) {
      const schemaInfo = data.schemaInfo as any;
      columns = schemaInfo.columns?.map((c: any) => c.name) || [];
    } else if (Array.isArray(data.uploadedData) && data.uploadedData.length > 0) {
      columns = Object.keys(data.uploadedData[0]);
    }

    const [dataset] = await db
      .insert(datasets)
      .values({
        id,
        ...data,
        columns,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return dataset;
  }

  async getDatasets(customerId: string): Promise<Dataset[]> {
    return await db
      .select()
      .from(datasets)
      .where(eq(datasets.customerId, customerId))
      .orderBy(desc(datasets.createdAt));
  }

  async getDataset(id: string, customerId: string): Promise<Dataset | undefined> {
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(and(
        eq(datasets.id, id),
        eq(datasets.customerId, customerId)
      ));
    return dataset || undefined;
  }

  async deleteDataset(id: string, customerId: string): Promise<void> {
    await db.delete(datasets).where(and(
      eq(datasets.id, id),
      eq(datasets.customerId, customerId)
    ));
  }

  // Dashboard methods
  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values(insertDashboard)
      .returning();
    return dashboard;
  }

  async getDashboards(customerId: string, userId?: string): Promise<Dashboard[]> {
    if (userId) {
      return await db
        .select()
        .from(dashboards)
        .where(and(
          eq(dashboards.customerId, customerId),
          eq(dashboards.userId, userId)
        ))
        .orderBy(desc(dashboards.updatedAt));
    }
    return await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.customerId, customerId))
      .orderBy(desc(dashboards.updatedAt));
  }

  async getDashboard(id: string, customerId: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(and(
        eq(dashboards.id, id),
        eq(dashboards.customerId, customerId)
      ));
    return dashboard || undefined;
  }

  async updateDashboard(
    id: string,
    customerId: string,
    dashboardUpdate: Partial<InsertDashboard>
  ): Promise<Dashboard | undefined> {
    const [updated] = await db
      .update(dashboards)
      .set({ ...dashboardUpdate, updatedAt: new Date() })
      .where(and(
        eq(dashboards.id, id),
        eq(dashboards.customerId, customerId)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteDashboard(id: string, customerId: string): Promise<void> {
    await db.delete(dashboards).where(and(
      eq(dashboards.id, id),
      eq(dashboards.customerId, customerId)
    ));
  }

  // Chart methods
  async createChart(insertChart: InsertChart): Promise<Chart> {
    const [chart] = await db
      .insert(charts)
      .values(insertChart)
      .returning();
    return chart;
  }

  async getCharts(dashboardId: string, customerId: string): Promise<Chart[]> {
    return await db
      .select()
      .from(charts)
      .where(and(
        eq(charts.dashboardId, dashboardId),
        eq(charts.customerId, customerId)
      ))
      .orderBy(desc(charts.createdAt));
  }

  async getChart(id: string, customerId: string): Promise<Chart | undefined> {
    const [chart] = await db
      .select()
      .from(charts)
      .where(and(
        eq(charts.id, id),
        eq(charts.customerId, customerId)
      ));
    return chart || undefined;
  }

  async updateChart(
    id: string,
    customerId: string,
    chartUpdate: Partial<InsertChart>
  ): Promise<Chart | undefined> {
    const [updated] = await db
      .update(charts)
      .set({ ...chartUpdate, updatedAt: new Date() })
      .where(and(
        eq(charts.id, id),
        eq(charts.customerId, customerId)
      ))
      .returning();
    return updated || undefined;
  }

  async deleteChart(id: string, customerId: string): Promise<void> {
    await db.delete(charts).where(and(
      eq(charts.id, id),
      eq(charts.customerId, customerId)
    ));
  }

  // Insight methods
  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values(insertInsight)
      .returning();
    return insight;
  }

  async getInsights(customerId: string, dashboardId?: string, datasetId?: string): Promise<Insight[]> {
    if (dashboardId) {
      return await db
        .select()
        .from(insights)
        .where(and(
          eq(insights.customerId, customerId),
          eq(insights.dashboardId, dashboardId)
        ))
        .orderBy(desc(insights.generatedAt));
    }
    if (datasetId) {
      return await db
        .select()
        .from(insights)
        .where(and(
          eq(insights.customerId, customerId),
          eq(insights.datasetId, datasetId)
        ))
        .orderBy(desc(insights.generatedAt));
    }
    return await db
      .select()
      .from(insights)
      .where(eq(insights.customerId, customerId))
      .orderBy(desc(insights.generatedAt));
  }

  // Custom metric methods
  async createCustomMetric(insertMetric: InsertCustomMetric): Promise<CustomMetric> {
    const [metric] = await db
      .insert(customMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async getCustomMetrics(customerId: string, datasetId: string): Promise<CustomMetric[]> {
    return await db
      .select()
      .from(customMetrics)
      .where(and(
        eq(customMetrics.customerId, customerId),
        eq(customMetrics.datasetId, datasetId)
      ))
      .orderBy(desc(customMetrics.createdAt));
  }

  async deleteCustomMetric(id: string, customerId: string): Promise<void> {
    await db.delete(customMetrics).where(and(
      eq(customMetrics.id, id),
      eq(customMetrics.customerId, customerId)
    ));
  }
}

export const storage = new DatabaseStorage();
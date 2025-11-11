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
  usageMetrics,
  customerQuotas,
  dataSources,
  syncJobs,
  dataSourceLogs,
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
  type UsageMetric,
  type InsertUsageMetric,
  type CustomerQuota,
  type InsertCustomerQuota,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
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
  createDataset(dataset: InsertDataset, customerId: string): Promise<Dataset>;
  getDatasets(customerId: string): Promise<Dataset[]>;
  getDataset(id: string, customerId: string): Promise<Dataset | undefined>;
  deleteDataset(id: string, customerId: string): Promise<void>;

  // Dashboard methods
  createDashboard(dashboard: InsertDashboard, customerId: string): Promise<Dashboard>;
  getDashboards(customerId: string, userId?: string): Promise<Dashboard[]>;
  getDashboard(id: string, customerId: string): Promise<(Dashboard & { charts: Chart[] }) | undefined>;
  updateDashboard(id: string, customerId: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string, customerId: string): Promise<void>;

  // Chart methods
  createChart(chart: InsertChart, customerId: string): Promise<Chart>;
  getCharts(customerId: string): Promise<Chart[]>;
  getChart(id: string, customerId: string): Promise<Chart | undefined>;
  updateChart(id: string, customerId: string, chart: Partial<InsertChart>): Promise<Chart | undefined>;
  deleteChart(id: string, customerId: string): Promise<void>;

  // Insight methods
  createInsight(insight: InsertInsight, customerId: string): Promise<Insight>;
  getInsights(customerId: string, dashboardId?: string, datasetId?: string): Promise<Insight[]>;

  // Custom metric methods
  createCustomMetric(metric: InsertCustomMetric): Promise<CustomMetric>;
  getCustomMetrics(customerId: string, datasetId: string): Promise<CustomMetric[]>;
  deleteCustomMetric(id: string, customerId: string): Promise<void>;

  // Usage metrics methods
  createUsageMetric(metric: InsertUsageMetric): Promise<UsageMetric>;
  getUsageMetrics(customerId: string, metricType?: string, startDate?: Date, endDate?: Date): Promise<UsageMetric[]>;
  getUsageStats(customerId: string, period: 'day' | 'week' | 'month'): Promise<any>;

  // Quota methods
  createCustomerQuota(quota: InsertCustomerQuota): Promise<CustomerQuota>;
  getCustomerQuotas(customerId: string): Promise<CustomerQuota[]>;
  getCustomerQuota(customerId: string, quotaType: string): Promise<CustomerQuota | undefined>;
  updateQuotaUsage(id: string, used: number): Promise<CustomerQuota | undefined>;
  incrementQuotaUsage(customerId: string, quotaType: string, amount: number): Promise<void>;
  resetQuotas(): Promise<void>;

  // Data source methods
  createDataSource(dataSource: any): Promise<any>;
  getDataSource(id: string, customerId: string): Promise<any>;
  getDataSources(customerId: string): Promise<any[]>;
  updateDataSource(id: string, updates: any): Promise<any>;
  deleteDataSource(id: string, customerId: string): Promise<void>;
  createSyncJob(dataSourceId: string): Promise<any>;
  updateSyncJob(id: string, updates: any): Promise<void>;
  getSyncJobs(dataSourceId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // Helper function to validate tenant access - ensures data isolation
  private async validateTenantAccess(resourceCustomerId: string, requestingCustomerId: string): Promise<boolean> {
    // Super admin access is handled outside of storage layer
    // This function assumes it's called from authenticated context
    if (requestingCustomerId === resourceCustomerId) {
      return true;
    }
    // For this method, we return true if the customer IDs match, 
    // otherwise authorization must be verified at a higher level
    return false;
  }

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

    if (config) {
      config.apiKey = process.env.OPENAI_API_KEY || '';
    }

    return config || undefined;
  }

  async updateCustomerLlmConfig(id: string, configUpdate: Partial<InsertCustomerLlmConfig>): Promise<CustomerLlmConfig | undefined> {
    // First, get the existing config to check if it belongs to the right customer
    const existingConfig = await db
      .select()
      .from(customerLlmConfigs)
      .where(eq(customerLlmConfigs.id, id))
      .limit(1);

    if (!existingConfig[0]) {
      return undefined; // Config doesn't exist
    }

    // Verify customer ownership before updating
    if (configUpdate.customerId && configUpdate.customerId !== existingConfig[0].customerId) {
      throw new Error('Cannot transfer LLM config to a different customer');
    }

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
  async createDataset(data: InsertDataset, customerId: string): Promise<Dataset> {
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
        customerId,
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
  async createDashboard(data: InsertDashboard, customerId: string): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values({ ...data, customerId })
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

  async getDashboard(id: string, customerId: string): Promise<(Dashboard & { charts: Chart[] }) | undefined> {
    const dashboard = await db.query.dashboards.findFirst({
      where: and(
        eq(dashboards.id, id),
        eq(dashboards.customerId, customerId)
      ),
      with: {
        charts: true,
      },
    });
    return dashboard;
  }

  async updateDashboard(
    id: string,
    customerId: string,
    dashboardUpdate: Partial<InsertDashboard>
  ): Promise<Dashboard | undefined> {
    // Verify the dashboard belongs to the correct customer before updating
    const existingDashboard = await db
      .select()
      .from(dashboards)
      .where(and(
        eq(dashboards.id, id),
        eq(dashboards.customerId, customerId)
      ))
      .limit(1);

    if (!existingDashboard[0]) {
      return undefined; // Dashboard doesn't exist or doesn't belong to customer
    }

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
  async createChart(data: InsertChart, customerId: string): Promise<Chart> {
    const [chart] = await db
      .insert(charts)
      .values({ ...data, customerId })
      .returning();
    return chart;
  }

  async getCharts(customerId: string): Promise<Chart[]> {
    return await db
      .select()
      .from(charts)
      .where(eq(charts.customerId, customerId))
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
    // Verify the chart belongs to the correct customer before updating
    const existingChart = await db
      .select()
      .from(charts)
      .where(and(
        eq(charts.id, id),
        eq(charts.customerId, customerId)
      ))
      .limit(1);

    if (!existingChart[0]) {
      return undefined; // Chart doesn't exist or doesn't belong to customer
    }

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
  async createInsight(data: InsertInsight, customerId: string): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values({ ...data, customerId })
      .returning();
    return insight;
  }

  async getInsights(customerId: string, dashboardId?: string, datasetId?: string): Promise<Insight[]> {
    if (dashboardId) {
      return await db.select()
        .from(insights)
        .where(and(
          eq(insights.customerId, customerId),
          eq(insights.dashboardId, dashboardId)
        ))
        .orderBy(desc(insights.generatedAt));
    } else if (datasetId) {
      return await db.select()
        .from(insights)
        .where(and(
          eq(insights.customerId, customerId),
          eq(insights.datasetId, datasetId)
        ))
        .orderBy(desc(insights.generatedAt));
    }

    return await db.select()
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

  // Additional admin methods
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByCustomer(customerId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.customerId, customerId)).orderBy(desc(users.createdAt));
  }

  async getCustomerUsageStats(customerId: string): Promise<any> {
    const [datasetCount] = await db.select({ count: sql<number>`count(*)` })
      .from(datasets)
      .where(eq(datasets.customerId, customerId));

    const [dashboardCount] = await db.select({ count: sql<number>`count(*)` })
      .from(dashboards)
      .where(eq(dashboards.customerId, customerId));

    const [chartCount] = await db.select({ count: sql<number>`count(*)` })
      .from(charts)
      .where(eq(charts.customerId, customerId));

    const [userCount] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.customerId, customerId));

    return {
      datasets: datasetCount?.count || 0,
      dashboards: dashboardCount?.count || 0,
      charts: chartCount?.count || 0,
      users: userCount?.count || 0,
    };
  }

  // Usage metrics methods
  async createUsageMetric(metric: InsertUsageMetric): Promise<UsageMetric> {
    const [result] = await db.insert(usageMetrics).values(metric).returning();
    return result;
  }

  async getUsageMetrics(customerId: string, metricType?: string, startDate?: Date, endDate?: Date): Promise<UsageMetric[]> {
    if (metricType) {
      return await db.select()
        .from(usageMetrics)
        .where(and(
          eq(usageMetrics.customerId, customerId),
          eq(usageMetrics.metricType, metricType)
        ))
        .orderBy(desc(usageMetrics.timestamp));
    }

    return await db.select()
      .from(usageMetrics)
      .where(eq(usageMetrics.customerId, customerId))
      .orderBy(desc(usageMetrics.timestamp));
  }

  async getUsageStats(customerId: string, period: 'day' | 'week' | 'month'): Promise<any> {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const metrics = await db.select()
      .from(usageMetrics)
      .where(and(
        eq(usageMetrics.customerId, customerId),
        sql`${usageMetrics.timestamp} >= ${startDate}`
      ));

    const stats: any = {
      api_calls: 0,
      ai_tokens: 0,
      storage: 0,
    };

    metrics.forEach(metric => {
      if (metric.metricType in stats) {
        stats[metric.metricType] += metric.value;
      }
    });

    return stats;
  }

  // Quota methods
  async createCustomerQuota(quota: InsertCustomerQuota): Promise<CustomerQuota> {
    const [result] = await db.insert(customerQuotas).values(quota).returning();
    return result;
  }

  async getCustomerQuotas(customerId: string): Promise<CustomerQuota[]> {
    return await db.select()
      .from(customerQuotas)
      .where(eq(customerQuotas.customerId, customerId));
  }

  async getCustomerQuota(customerId: string, quotaType: string): Promise<CustomerQuota | undefined> {
    const [quota] = await db.select()
      .from(customerQuotas)
      .where(and(
        eq(customerQuotas.customerId, customerId),
        eq(customerQuotas.quotaType, quotaType)
      ));
    return quota || undefined;
  }

  async updateQuotaUsage(id: string, used: number): Promise<CustomerQuota | undefined> {
    const [updated] = await db.update(customerQuotas)
      .set({ used, updatedAt: new Date() })
      .where(eq(customerQuotas.id, id))
      .returning();
    return updated || undefined;
  }

  async incrementQuotaUsage(customerId: string, quotaType: string, amount: number): Promise<void> {
    await db.update(customerQuotas)
      .set({
        used: sql`${customerQuotas.used} + ${amount}`,
        updatedAt: new Date()
      })
      .where(and(
        eq(customerQuotas.customerId, customerId),
        eq(customerQuotas.quotaType, quotaType)
      ));
  }

  async resetQuotas(): Promise<void> {
    const now = new Date();
    await db.update(customerQuotas)
      .set({ used: 0, resetAt: now, updatedAt: now })
      .where(sql`${customerQuotas.resetAt} <= ${now}`);
  }

  // Data source methods
  async createDataSource(dataSource: any): Promise<any> {
    const [result] = await db.insert(dataSources).values(dataSource).returning();
    return result;
  }

  async getDataSource(id: string, customerId: string): Promise<any> {
    const [source] = await db.select()
      .from(dataSources)
      .where(and(eq(dataSources.id, id), eq(dataSources.customerId, customerId)));
    return source;
  }

  async getDataSources(customerId: string): Promise<any[]> {
    return await db.select()
      .from(dataSources)
      .where(eq(dataSources.customerId, customerId))
      .orderBy(desc(dataSources.createdAt));
  }

  async updateDataSource(id: string, updates: any): Promise<any> {
    // Verify the data source belongs to the correct customer before updating
    const existingSource = await db
      .select()
      .from(dataSources)
      .where(and(
        eq(dataSources.id, id),
        eq(dataSources.customerId, updates.customerId)
      ))
      .limit(1);

    if (!existingSource[0]) {
      throw new Error('Cannot update data source: does not exist or does not belong to customer');
    }

    const [result] = await db.update(dataSources)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dataSources.id, id))
      .returning();
    return result;
  }

  async deleteDataSource(id: string, customerId: string): Promise<void> {
    await db.delete(dataSources)
      .where(and(eq(dataSources.id, id), eq(dataSources.customerId, customerId)));
  }

  async createSyncJob(dataSourceId: string): Promise<any> {
    const [job] = await db.insert(syncJobs)
      .values({
        dataSourceId,
        status: 'pending',
      })
      .returning();
    return job;
  }

  async updateSyncJob(id: string, updates: any): Promise<void> {
    await db.update(syncJobs)
      .set(updates)
      .where(eq(syncJobs.id, id));
  }

  async getSyncJobs(dataSourceId: string): Promise<any[]> {
    return await db.select()
      .from(syncJobs)
      .where(eq(syncJobs.dataSourceId, dataSourceId))
      .orderBy(desc(syncJobs.createdAt));
  }
}

export const storage = new DatabaseStorage();
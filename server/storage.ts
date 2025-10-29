// Database storage implementation following javascript_database blueprint
import {
  datasets,
  dashboards,
  charts,
  insights,
  customMetrics,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Dataset methods
  createDataset(dataset: InsertDataset): Promise<Dataset>;
  getDatasets(): Promise<Dataset[]>;
  getDataset(id: string): Promise<Dataset | undefined>;
  deleteDataset(id: string): Promise<void>;

  // Dashboard methods
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  getDashboards(userId?: string): Promise<Dashboard[]>;
  getDashboard(id: string): Promise<Dashboard | undefined>;
  updateDashboard(id: string, dashboard: Partial<InsertDashboard>): Promise<Dashboard | undefined>;
  deleteDashboard(id: string): Promise<void>;

  // Chart methods
  createChart(chart: InsertChart): Promise<Chart>;
  getCharts(dashboardId: string): Promise<Chart[]>;
  getChart(id: string): Promise<Chart | undefined>;
  updateChart(id: string, chart: Partial<InsertChart>): Promise<Chart | undefined>;
  deleteChart(id: string): Promise<void>;

  // Insight methods
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsights(dashboardId?: string, datasetId?: string): Promise<Insight[]>;

  // Custom metric methods
  createCustomMetric(metric: InsertCustomMetric): Promise<CustomMetric>;
  getCustomMetrics(datasetId: string): Promise<CustomMetric[]>;
  deleteCustomMetric(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Dataset methods
  async createDataset(insertDataset: InsertDataset): Promise<Dataset> {
    const [dataset] = await db
      .insert(datasets)
      .values(insertDataset)
      .returning();
    return dataset;
  }

  async getDatasets(): Promise<Dataset[]> {
    return await db
      .select()
      .from(datasets)
      .orderBy(desc(datasets.createdAt));
  }

  async getDataset(id: string): Promise<Dataset | undefined> {
    const [dataset] = await db
      .select()
      .from(datasets)
      .where(eq(datasets.id, id));
    return dataset || undefined;
  }

  async deleteDataset(id: string): Promise<void> {
    await db.delete(datasets).where(eq(datasets.id, id));
  }

  // Dashboard methods
  async createDashboard(insertDashboard: InsertDashboard): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values(insertDashboard)
      .returning();
    return dashboard;
  }

  async getDashboards(userId?: string): Promise<Dashboard[]> {
    if (userId) {
      return await db
        .select()
        .from(dashboards)
        .where(eq(dashboards.userId, userId))
        .orderBy(desc(dashboards.updatedAt));
    }
    return await db
      .select()
      .from(dashboards)
      .orderBy(desc(dashboards.updatedAt));
  }

  async getDashboard(id: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.id, id));
    return dashboard || undefined;
  }

  async updateDashboard(
    id: string,
    dashboardUpdate: Partial<InsertDashboard>
  ): Promise<Dashboard | undefined> {
    const [updated] = await db
      .update(dashboards)
      .set({ ...dashboardUpdate, updatedAt: new Date() })
      .where(eq(dashboards.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDashboard(id: string): Promise<void> {
    await db.delete(dashboards).where(eq(dashboards.id, id));
  }

  // Chart methods
  async createChart(insertChart: InsertChart): Promise<Chart> {
    const [chart] = await db
      .insert(charts)
      .values(insertChart)
      .returning();
    return chart;
  }

  async getCharts(dashboardId: string): Promise<Chart[]> {
    return await db
      .select()
      .from(charts)
      .where(eq(charts.dashboardId, dashboardId))
      .orderBy(desc(charts.createdAt));
  }

  async getChart(id: string): Promise<Chart | undefined> {
    const [chart] = await db
      .select()
      .from(charts)
      .where(eq(charts.id, id));
    return chart || undefined;
  }

  async updateChart(
    id: string,
    chartUpdate: Partial<InsertChart>
  ): Promise<Chart | undefined> {
    const [updated] = await db
      .update(charts)
      .set({ ...chartUpdate, updatedAt: new Date() })
      .where(eq(charts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteChart(id: string): Promise<void> {
    await db.delete(charts).where(eq(charts.id, id));
  }

  // Insight methods
  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db
      .insert(insights)
      .values(insertInsight)
      .returning();
    return insight;
  }

  async getInsights(dashboardId?: string, datasetId?: string): Promise<Insight[]> {
    if (dashboardId) {
      return await db
        .select()
        .from(insights)
        .where(eq(insights.dashboardId, dashboardId))
        .orderBy(desc(insights.generatedAt));
    }
    if (datasetId) {
      return await db
        .select()
        .from(insights)
        .where(eq(insights.datasetId, datasetId))
        .orderBy(desc(insights.generatedAt));
    }
    return await db
      .select()
      .from(insights)
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

  async getCustomMetrics(datasetId: string): Promise<CustomMetric[]> {
    return await db
      .select()
      .from(customMetrics)
      .where(eq(customMetrics.datasetId, datasetId))
      .orderBy(desc(customMetrics.createdAt));
  }

  async deleteCustomMetric(id: string): Promise<void> {
    await db.delete(customMetrics).where(eq(customMetrics.id, id));
  }
}

export const storage = new DatabaseStorage();

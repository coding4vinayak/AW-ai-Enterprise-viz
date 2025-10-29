import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Datasets table - stores uploaded CSV/Excel data
export const datasets = pgTable("datasets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'csv' | 'excel' | 'api'
  uploadedData: jsonb("uploaded_data").notNull(), // Array of data rows
  schemaInfo: jsonb("schema_info").notNull(), // Column definitions { columns: [{name, type}] }
  rowCount: integer("row_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Dashboards table - stores user dashboard configurations
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  name: text("name").notNull(),
  description: text("description"),
  isPreset: boolean("is_preset").notNull().default(false),
  layout: jsonb("layout"), // Grid layout configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Charts table - stores individual chart configurations
export const charts = pgTable("charts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").notNull(),
  datasetId: varchar("dataset_id").notNull(),
  type: text("type").notNull(), // 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'kpi'
  title: text("title").notNull(),
  config: jsonb("config").notNull(), // Chart configuration { metric, filters, xAxis, yAxis, etc. }
  position: jsonb("position"), // { x, y, w, h } for grid layout
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insights table - stores AI-generated insights
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id"),
  datasetId: varchar("dataset_id"),
  type: text("type").notNull(), // 'summary' | 'trend' | 'anomaly' | 'forecast'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // Additional context data
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

// Custom metrics table - stores user-defined calculated metrics
export const customMetrics = pgTable("custom_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  formula: text("formula").notNull(), // e.g., "(selling_price - cost_price) / selling_price"
  datasetId: varchar("dataset_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  generatedAt: true,
});

export const insertCustomMetricSchema = createInsertSchema(customMetrics).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Dataset = typeof datasets.$inferSelect;
export type InsertDataset = z.infer<typeof insertDatasetSchema>;

export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;

export type Chart = typeof charts.$inferSelect;
export type InsertChart = z.infer<typeof insertChartSchema>;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

export type CustomMetric = typeof customMetrics.$inferSelect;
export type InsertCustomMetric = z.infer<typeof insertCustomMetricSchema>;

// Additional TypeScript interfaces for frontend
export interface ChartConfig {
  metric: string;
  xAxis?: string;
  yAxis?: string;
  filters?: Record<string, any>;
  dateRange?: { start: string; end: string };
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy?: string;
  color?: string;
}

export interface DatasetColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sample?: any;
}

export interface DatasetSchema {
  columns: DatasetColumn[];
}

export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  confidence?: { lower: number; upper: number };
}

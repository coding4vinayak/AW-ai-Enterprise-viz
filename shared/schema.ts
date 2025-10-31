import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Customers/Tenants table - multi-tenancy support
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),
  branding: jsonb("branding"),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Users table with enhanced fields for authentication and roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// LLM Providers table - stores available AI providers
export const llmProviders = pgTable("llm_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  baseUrl: text("base_url"),
  defaultModel: text("default_model"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Customer LLM Configuration - links customers to their LLM providers
export const customerLlmConfigs = pgTable("customer_llm_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  providerId: varchar("provider_id").notNull().references(() => llmProviders.id),
  apiKey: text("api_key").notNull(),
  model: text("model"),
  settings: jsonb("settings"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Datasets table - stores uploaded CSV/Excel data
export const datasets = pgTable("datasets", {
  id: text("id").primaryKey(),
  customerId: varchar("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // csv, excel, json, etc.
  uploadedData: jsonb("uploaded_data").notNull(),
  schemaInfo: jsonb("schema_info"),
  columns: text("columns").array(),
  rowCount: integer("row_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Dashboards table - stores user dashboard configurations
export const dashboards = pgTable("dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  userId: varchar("user_id").references(() => users.id),
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
  customerId: varchar("customer_id").references(() => customers.id),
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
  customerId: varchar("customer_id").references(() => customers.id),
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
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  formula: text("formula").notNull(), // e.g., "(selling_price - cost_price) / selling_price"
  datasetId: varchar("dataset_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmProviderSchema = createInsertSchema(llmProviders).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerLlmConfigSchema = createInsertSchema(customerLlmConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDatasetSchema = createInsertSchema(datasets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// Dashboard sharing configuration
export const dashboardShares = pgTable("dashboard_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").notNull().references(() => dashboards.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  expiresAt: timestamp("expires_at"),
  isPublic: boolean("is_public").notNull().default(false),
  password: text("password"),
  allowedEmails: text("allowed_emails").array(),
  permissions: jsonb("permissions"), // { canEdit: false, canExport: true }
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


// Scheduled email reports
export const emailReports = pgTable("email_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  dashboardId: varchar("dashboard_id").notNull().references(() => dashboards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  recipients: text("recipients").array().notNull(),
  schedule: text("schedule").notNull(), // cron expression
  format: text("format").notNull().default("pdf"), // pdf, excel, png
  isActive: boolean("is_active").notNull().default(true),
  lastSentAt: timestamp("last_sent_at"),
  nextRunAt: timestamp("next_run_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailReport = typeof emailReports.$inferSelect;
export type InsertEmailReport = typeof emailReports.$inferInsert;


export type DashboardShare = typeof dashboardShares.$inferSelect;
export type InsertDashboardShare = typeof dashboardShares.$inferInsert;

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
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LlmProvider = typeof llmProviders.$inferSelect;
export type InsertLlmProvider = z.infer<typeof insertLlmProviderSchema>;

export type CustomerLlmConfig = typeof customerLlmConfigs.$inferSelect;
export type InsertCustomerLlmConfig = z.infer<typeof insertCustomerLlmConfigSchema>;

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


// Usage Metrics Schema
export const usageMetrics = pgTable("usage_metrics", {
  id: varchar("id").primaryKey(),
  customerId: varchar("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  metricType: text("metric_type").notNull(), // 'api_call', 'storage', 'ai_tokens'
  value: integer("value").notNull(),
  metadata: jsonb("metadata"), // { endpoint, model, duration, etc }
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const customerQuotas = pgTable("customer_quotas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  quotaType: text("quota_type").notNull(),
  limit: integer("limit").notNull(),
  used: integer("used").notNull().default(0),
  period: text("period").notNull(),
  resetAt: timestamp("reset_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Data Sources for BI Integration
export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rest_api' | 'graphql' | 'database' | 'file' | 'webhook'
  connectionConfig: jsonb("connection_config").notNull(),
  syncSchedule: text("sync_schedule"),
  syncEnabled: boolean("sync_enabled").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: text("last_sync_status"),
  dataMapping: jsonb("data_mapping"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const syncJobs = pgTable("sync_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataSourceId: varchar("data_source_id").references(() => dataSources.id).notNull(),
  status: text("status").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  recordsProcessed: integer("records_processed").default(0),
  recordsInserted: integer("records_inserted").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dataSourceLogs = pgTable("data_source_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataSourceId: varchar("data_source_id").references(() => dataSources.id).notNull(),
  syncJobId: varchar("sync_job_id").references(() => syncJobs.id),
  level: text("level").notNull(),
  message: text("message").notNull(),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type UsageMetric = typeof usageMetrics.$inferSelect;
export type InsertUsageMetric = typeof usageMetrics.$inferInsert;
export type CustomerQuota = typeof customerQuotas.$inferSelect;
export type InsertCustomerQuota = typeof customerQuotas.$inferInsert;

export type DataSource = typeof dataSources.$inferSelect;
export type InsertDataSource = typeof dataSources.$inferInsert;
export type SyncJob = typeof syncJobs.$inferSelect;
export type InsertSyncJob = typeof syncJobs.$inferInsert;
export type DataSourceLog = typeof dataSourceLogs.$inferSelect;
export type InsertDataSourceLog = typeof dataSourceLogs.$inferInsert;

# BI Dashboard Implementation Guide
## Enterprise-Grade Business Intelligence & Data Processing Framework

---

## Executive Summary

This document provides a detailed roadmap for implementing a complete Business Intelligence (BI) dashboard system with data ingestion from multiple sources (APIs, databases, files), data processing pipelines, and interactive visualization capabilities. The framework is designed to be enterprise-grade, scalable, and maintainable.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Ingestion Layer](#data-ingestion-layer)
3. [Data Processing Pipeline](#data-processing-pipeline)
4. [Dashboard Builder System](#dashboard-builder-system)
5. [Visualization Components](#visualization-components)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Code Examples](#code-examples)

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA SOURCES LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  • REST APIs        • CSV/Excel Files    • Databases        │
│  • GraphQL APIs     • JSON Files         • Webhooks         │
│  • Third-party SaaS (Salesforce, Stripe, Google Analytics)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA INGESTION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  • API Connectors   • File Parsers      • ETL Jobs          │
│  • Data Validation  • Schema Detection  • Error Handling    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA PROCESSING LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  • Data Transformation    • Aggregation   • Filtering       │
│  • Calculated Fields      • Joins         • Time-series     │
│  • Data Enrichment        • Deduplication • Normalization   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA STORAGE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  • PostgreSQL (Relational)  • JSONB (Flexible Schema)       │
│  • Time-series Optimization • Indexing Strategy             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BI DASHBOARD LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  • Chart Builder    • KPI Metrics       • Custom Widgets    │
│  • Filters          • Drill-down        • Real-time Updates │
│  • Export Features  • Sharing           • Scheduling        │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Ingestion Layer

### Phase 1: API Data Connectors

#### 1.1 Database Schema for Data Sources

**New Tables to Add:**

```typescript
// server/shared/schema.ts additions

export const dataSources = pgTable("data_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'rest_api' | 'graphql' | 'database' | 'file' | 'webhook'
  
  // Connection details (encrypted)
  connectionConfig: jsonb("connection_config").notNull(),
  // {
  //   url: string,
  //   method: 'GET' | 'POST',
  //   headers: Record<string, string>,
  //   authentication: { type: 'bearer' | 'api_key' | 'oauth', credentials: string },
  //   queryParams: Record<string, string>,
  //   requestBody: any
  // }
  
  // Sync settings
  syncSchedule: text("sync_schedule"), // cron expression: '0 */6 * * *' = every 6 hours
  syncEnabled: boolean("sync_enabled").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: text("last_sync_status"), // 'success' | 'failed' | 'in_progress'
  
  // Data mapping
  dataMapping: jsonb("data_mapping"), // How to transform API response to our schema
  
  status: text("status").default("active"), // 'active' | 'inactive' | 'error'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const syncJobs = pgTable("sync_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataSourceId: varchar("data_source_id").references(() => dataSources.id),
  status: text("status").notNull(), // 'pending' | 'running' | 'completed' | 'failed'
  
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
  dataSourceId: varchar("data_source_id").references(() => dataSources.id),
  syncJobId: varchar("sync_job_id").references(() => syncJobs.id),
  
  level: text("level").notNull(), // 'info' | 'warning' | 'error'
  message: text("message").notNull(),
  details: jsonb("details"),
  
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});
```

#### 1.2 API Connector Implementation

**File: `server/lib/data-connectors/base.ts`**

```typescript
export interface DataConnector {
  connect(): Promise<void>;
  fetchData(config: any): Promise<any[]>;
  validateConnection(): Promise<boolean>;
  disconnect(): Promise<void>;
}

export interface FetchResult {
  data: any[];
  metadata: {
    totalRecords: number;
    fetchedAt: Date;
    hasMore: boolean;
    nextPageToken?: string;
  };
}

export abstract class BaseDataConnector implements DataConnector {
  protected config: any;
  protected customerId: string;
  
  constructor(config: any, customerId: string) {
    this.config = config;
    this.customerId = customerId;
  }
  
  abstract connect(): Promise<void>;
  abstract fetchData(options?: any): Promise<FetchResult>;
  abstract validateConnection(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  
  protected async logActivity(level: 'info' | 'warning' | 'error', message: string, details?: any) {
    // Log to database
    console.log(`[${level.toUpperCase()}] ${message}`, details);
  }
}
```

**File: `server/lib/data-connectors/rest-api.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';
import { BaseDataConnector, FetchResult } from './base';

interface RestApiConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  authentication?: {
    type: 'bearer' | 'api_key' | 'basic' | 'oauth';
    credentials: string;
    headerName?: string; // For api_key type
  };
  queryParams?: Record<string, string>;
  requestBody?: any;
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    limitParam: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
    limitValue: number;
  };
  dataPath?: string; // JSONPath to extract data array from response
}

export class RestApiConnector extends BaseDataConnector {
  private client: AxiosInstance | null = null;
  private config: RestApiConfig;
  
  constructor(config: RestApiConfig, customerId: string) {
    super(config, customerId);
    this.config = config;
  }
  
  async connect(): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };
    
    // Add authentication
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.authentication.credentials}`;
          break;
        case 'api_key':
          const headerName = this.config.authentication.headerName || 'X-API-Key';
          headers[headerName] = this.config.authentication.credentials;
          break;
        case 'basic':
          headers['Authorization'] = `Basic ${this.config.authentication.credentials}`;
          break;
      }
    }
    
    this.client = axios.create({
      baseURL: this.config.url,
      headers,
      timeout: 30000,
    });
    
    await this.logActivity('info', 'API connector initialized');
  }
  
  async fetchData(options?: { page?: number; cursor?: string }): Promise<FetchResult> {
    if (!this.client) {
      await this.connect();
    }
    
    const params = { ...this.config.queryParams };
    
    // Handle pagination
    if (this.config.pagination) {
      const { type, limitParam, limitValue } = this.config.pagination;
      params[limitParam] = limitValue.toString();
      
      if (type === 'offset' && this.config.pagination.offsetParam) {
        const offset = ((options?.page || 1) - 1) * limitValue;
        params[this.config.pagination.offsetParam] = offset.toString();
      } else if (type === 'page' && this.config.pagination.pageParam) {
        params[this.config.pagination.pageParam] = (options?.page || 1).toString();
      } else if (type === 'cursor' && this.config.pagination.cursorParam && options?.cursor) {
        params[this.config.pagination.cursorParam] = options.cursor;
      }
    }
    
    try {
      const response = await this.client!.request({
        method: this.config.method,
        params,
        data: this.config.requestBody,
      });
      
      // Extract data using dataPath if provided
      let data = response.data;
      if (this.config.dataPath) {
        data = this.extractDataByPath(data, this.config.dataPath);
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [data];
      }
      
      await this.logActivity('info', `Fetched ${data.length} records from API`);
      
      return {
        data,
        metadata: {
          totalRecords: data.length,
          fetchedAt: new Date(),
          hasMore: data.length === (this.config.pagination?.limitValue || 0),
        },
      };
    } catch (error: any) {
      await this.logActivity('error', 'API fetch failed', {
        message: error.message,
        status: error.response?.status,
      });
      throw error;
    }
  }
  
  async validateConnection(): Promise<boolean> {
    try {
      await this.connect();
      // Try a simple request
      await this.fetchData();
      return true;
    } catch (error) {
      await this.logActivity('error', 'Connection validation failed', error);
      return false;
    }
  }
  
  async disconnect(): Promise<void> {
    this.client = null;
    await this.logActivity('info', 'API connector disconnected');
  }
  
  private extractDataByPath(data: any, path: string): any {
    const keys = path.split('.');
    let result = data;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) {
        throw new Error(`Data path ${path} not found in response`);
      }
    }
    return result;
  }
}
```

#### 1.3 Data Source Routes

**File: `server/data-source-routes.ts`**

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { storage } from './storage';
import { RestApiConnector } from './lib/data-connectors/rest-api';

const router = Router();

// Create data source
router.post('/api/data-sources', authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    
    const dataSource = await storage.createDataSource({
      ...req.body,
      customerId,
    });
    
    res.json(dataSource);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Test connection
router.post('/api/data-sources/test-connection', authenticateUser, async (req, res) => {
  try {
    const { type, connectionConfig } = req.body;
    
    let connector;
    if (type === 'rest_api') {
      connector = new RestApiConnector(connectionConfig, req.user!.customerId);
    } else {
      throw new Error('Unsupported connector type');
    }
    
    const isValid = await connector.validateConnection();
    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(400).json({ valid: false, error: error.message });
  }
});

// Trigger manual sync
router.post('/api/data-sources/:id/sync', authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataSource = await storage.getDataSource(req.params.id, customerId);
    
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    // Create sync job
    const syncJob = await storage.createSyncJob(dataSource.id);
    
    // Start sync in background
    performDataSync(dataSource, syncJob.id).catch(console.error);
    
    res.json({ jobId: syncJob.id, status: 'started' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

async function performDataSync(dataSource: any, syncJobId: string) {
  try {
    await storage.updateSyncJob(syncJobId, {
      status: 'running',
      startedAt: new Date(),
    });
    
    let connector;
    if (dataSource.type === 'rest_api') {
      connector = new RestApiConnector(dataSource.connectionConfig, dataSource.customerId);
    } else {
      throw new Error('Unsupported connector type');
    }
    
    const result = await connector.fetchData();
    
    // Transform and save data
    const dataset = await storage.createDataset({
      name: `${dataSource.name} - ${new Date().toISOString()}`,
      type: 'api',
      uploadedData: result.data,
      schemaInfo: detectSchema(result.data),
      rowCount: result.data.length,
    }, dataSource.customerId);
    
    await storage.updateSyncJob(syncJobId, {
      status: 'completed',
      completedAt: new Date(),
      recordsProcessed: result.data.length,
      recordsInserted: result.data.length,
    });
    
    await storage.updateDataSource(dataSource.id, {
      lastSyncAt: new Date(),
      lastSyncStatus: 'success',
    });
    
  } catch (error: any) {
    await storage.updateSyncJob(syncJobId, {
      status: 'failed',
      completedAt: new Date(),
      errorMessage: error.message,
    });
  }
}

function detectSchema(data: any[]) {
  if (data.length === 0) return { columns: [] };
  
  const sample = data[0];
  const columns = Object.keys(sample).map(key => ({
    name: key,
    type: typeof sample[key],
  }));
  
  return { columns };
}

export default router;
```

---

## Data Processing Pipeline

### Phase 2: Data Transformation Engine

#### 2.1 Calculated Fields System

**File: `server/lib/data-processing/calculated-fields.ts`**

```typescript
export interface CalculatedField {
  id: string;
  name: string;
  expression: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  description?: string;
}

export class CalculatedFieldProcessor {
  // Safe evaluation of expressions
  evaluateExpression(expression: string, row: Record<string, any>): any {
    // Create a safe evaluation context
    const context = { ...row };
    
    try {
      // Replace field references with actual values
      let processedExpression = expression;
      
      // Handle common functions
      processedExpression = processedExpression
        .replace(/SUM\(([^)]+)\)/g, (_, field) => this.aggregateFunction('sum', field, [row]))
        .replace(/AVG\(([^)]+)\)/g, (_, field) => this.aggregateFunction('avg', field, [row]))
        .replace(/MAX\(([^)]+)\)/g, (_, field) => this.aggregateFunction('max', field, [row]))
        .replace(/MIN\(([^)]+)\)/g, (_, field) => this.aggregateFunction('min', field, [row]));
      
      // Replace field references [FieldName]
      processedExpression = processedExpression.replace(/\[([^\]]+)\]/g, (_, fieldName) => {
        const value = row[fieldName];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      
      // Use Function constructor for safe evaluation
      const func = new Function('context', `with(context) { return ${processedExpression}; }`);
      return func(context);
    } catch (error) {
      console.error('Expression evaluation failed:', error);
      return null;
    }
  }
  
  private aggregateFunction(func: string, field: string, data: any[]): number {
    const values = data.map(row => row[field]).filter(v => typeof v === 'number');
    
    switch (func) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        return 0;
    }
  }
  
  applyCalculatedFields(data: any[], fields: CalculatedField[]): any[] {
    return data.map(row => {
      const newRow = { ...row };
      
      for (const field of fields) {
        newRow[field.name] = this.evaluateExpression(field.expression, row);
      }
      
      return newRow;
    });
  }
}
```

#### 2.2 Data Aggregation Engine

**File: `server/lib/data-processing/aggregation.ts`**

```typescript
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'distinct_count';

export interface AggregationConfig {
  metric: string; // Field to aggregate
  aggregation: AggregationType;
  groupBy?: string[]; // Fields to group by
  filters?: FilterConfig[];
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: any;
}

export class DataAggregator {
  aggregate(data: any[], config: AggregationConfig): any[] {
    // Apply filters first
    let filteredData = data;
    if (config.filters && config.filters.length > 0) {
      filteredData = this.applyFilters(data, config.filters);
    }
    
    // If no groupBy, return single aggregated value
    if (!config.groupBy || config.groupBy.length === 0) {
      const result = this.performAggregation(
        filteredData,
        config.metric,
        config.aggregation
      );
      return [{ value: result, _count: filteredData.length }];
    }
    
    // Group data
    const groups = this.groupData(filteredData, config.groupBy);
    
    // Aggregate each group
    const results = [];
    for (const [key, groupData] of Object.entries(groups)) {
      const groupKeys = this.parseGroupKey(key, config.groupBy);
      const aggregatedValue = this.performAggregation(
        groupData,
        config.metric,
        config.aggregation
      );
      
      results.push({
        ...groupKeys,
        value: aggregatedValue,
        _count: groupData.length,
      });
    }
    
    return results;
  }
  
  private applyFilters(data: any[], filters: FilterConfig[]): any[] {
    return data.filter(row => {
      return filters.every(filter => {
        const fieldValue = row[filter.field];
        
        switch (filter.operator) {
          case 'eq':
            return fieldValue === filter.value;
          case 'ne':
            return fieldValue !== filter.value;
          case 'gt':
            return fieldValue > filter.value;
          case 'gte':
            return fieldValue >= filter.value;
          case 'lt':
            return fieldValue < filter.value;
          case 'lte':
            return fieldValue <= filter.value;
          case 'contains':
            return String(fieldValue).includes(String(filter.value));
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'between':
            return fieldValue >= filter.value[0] && fieldValue <= filter.value[1];
          default:
            return true;
        }
      });
    });
  }
  
  private groupData(data: any[], groupBy: string[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};
    
    for (const row of data) {
      const key = groupBy.map(field => row[field]).join('::');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    }
    
    return groups;
  }
  
  private parseGroupKey(key: string, groupBy: string[]): Record<string, any> {
    const values = key.split('::');
    const result: Record<string, any> = {};
    
    groupBy.forEach((field, index) => {
      result[field] = values[index];
    });
    
    return result;
  }
  
  private performAggregation(data: any[], metric: string, type: AggregationType): number {
    const values = data.map(row => row[metric]).filter(v => v !== null && v !== undefined);
    
    switch (type) {
      case 'sum':
        return values.reduce((a, b) => Number(a) + Number(b), 0);
      
      case 'avg':
        const sum = values.reduce((a, b) => Number(a) + Number(b), 0);
        return sum / values.length;
      
      case 'count':
        return values.length;
      
      case 'min':
        return Math.min(...values.map(Number));
      
      case 'max':
        return Math.max(...values.map(Number));
      
      case 'median':
        const sorted = values.map(Number).sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];
      
      case 'distinct_count':
        return new Set(values).size;
      
      default:
        return 0;
    }
  }
}
```

---

## Dashboard Builder System

### Phase 3: Interactive Dashboard Creation

#### 3.1 Enhanced Chart Configuration Schema

```typescript
// Update shared/schema.ts

export const chartConfigurations = pgTable("chart_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chartId: varchar("chart_id").references(() => charts.id),
  
  // Data configuration
  datasetId: varchar("dataset_id").notNull(),
  xAxis: text("x_axis"), // Field name for X-axis
  yAxis: text("y_axis"), // Field name for Y-axis
  series: jsonb("series"), // Multiple series for complex charts
  
  // Aggregation
  aggregation: jsonb("aggregation"), // AggregationConfig
  
  // Filtering
  filters: jsonb("filters").default([]), // FilterConfig[]
  
  // Calculated fields
  calculatedFields: jsonb("calculated_fields").default([]), // CalculatedField[]
  
  // Styling
  colors: jsonb("colors"), // Color scheme
  legend: jsonb("legend"), // Legend configuration
  axes: jsonb("axes"), // Axis configuration
  
  // Interactivity
  drilldown: jsonb("drilldown"), // Drill-down configuration
  tooltip: jsonb("tooltip"), // Tooltip configuration
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### 3.2 Dashboard Builder UI Component

**File: `client/src/components/dashboard/advanced-chart-builder.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDatasets } from '@/lib/api-hooks';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

interface ChartBuilderProps {
  onSave: (config: any) => void;
}

export function AdvancedChartBuilder({ onSave }: ChartBuilderProps) {
  const { data: datasets } = useDatasets();
  
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'area'>('bar');
  const [xAxis, setXAxis] = useState<string>('');
  const [yAxis, setYAxis] = useState<string>('');
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count' | 'max' | 'min'>('sum');
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  
  useEffect(() => {
    if (selectedDataset) {
      const dataset = datasets?.find(d => d.id === selectedDataset);
      if (dataset) {
        const data = dataset.uploadedData as any[];
        setColumns(Object.keys(data[0] || {}));
        processData(data);
      }
    }
  }, [selectedDataset, xAxis, yAxis, aggregation, groupBy, filters]);
  
  const processData = (rawData: any[]) => {
    if (!xAxis || !yAxis) {
      setPreviewData([]);
      return;
    }
    
    // Apply filters
    let filtered = rawData;
    filters.forEach(filter => {
      filtered = filtered.filter(row => {
        const value = row[filter.field];
        switch (filter.operator) {
          case 'eq': return value === filter.value;
          case 'gt': return value > filter.value;
          case 'lt': return value < filter.value;
          case 'contains': return String(value).includes(filter.value);
          default: return true;
        }
      });
    });
    
    // Group and aggregate
    if (groupBy.length > 0) {
      const grouped = new Map();
      
      filtered.forEach(row => {
        const key = groupBy.map(field => row[field]).join('::');
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key).push(row);
      });
      
      const aggregated = Array.from(grouped.entries()).map(([key, values]) => {
        const groupKeys = key.split('::');
        const result: any = {};
        
        groupBy.forEach((field, idx) => {
          result[field] = groupKeys[idx];
        });
        
        // Perform aggregation
        const nums = (values as any[]).map(v => Number(v[yAxis])).filter(n => !isNaN(n));
        switch (aggregation) {
          case 'sum':
            result[yAxis] = nums.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            result[yAxis] = nums.reduce((a, b) => a + b, 0) / nums.length;
            break;
          case 'count':
            result[yAxis] = values.length;
            break;
          case 'max':
            result[yAxis] = Math.max(...nums);
            break;
          case 'min':
            result[yAxis] = Math.min(...nums);
            break;
        }
        
        return result;
      });
      
      setPreviewData(aggregated);
    } else {
      setPreviewData(filtered.slice(0, 50)); // Limit preview to 50 rows
    }
  };
  
  const renderChart = () => {
    if (previewData.length === 0) return <div className="text-center text-muted-foreground p-8">Configure chart to see preview</div>;
    
    const chartProps = {
      data: previewData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };
    
    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={yAxis} stroke="hsl(var(--primary))" />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={yAxis} fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey={yAxis} fill="hsl(var(--primary))" fillOpacity={0.6} stroke="hsl(var(--primary))" />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={previewData}
                dataKey={yAxis}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dataset</Label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets?.map(ds => (
                    <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>X-Axis (Dimension)</Label>
              <Select value={xAxis} onValueChange={setXAxis} disabled={!selectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Y-Axis (Metric)</Label>
              <Select value={yAxis} onValueChange={setYAxis} disabled={!selectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Aggregation</Label>
              <Select value={aggregation} onValueChange={(v: any) => setAggregation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sum">Sum</SelectItem>
                  <SelectItem value="avg">Average</SelectItem>
                  <SelectItem value="count">Count</SelectItem>
                  <SelectItem value="max">Maximum</SelectItem>
                  <SelectItem value="min">Minimum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => onSave({
                datasetId: selectedDataset,
                type: chartType,
                xAxis,
                yAxis,
                aggregation,
                groupBy,
                filters
              })}
            >
              Save Chart
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview Panel */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Chart Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## Implementation Roadmap

### **Phase 1: Foundation (Weeks 1-2)**

**Week 1: Database Schema & API Connectors**
- [ ] Create data_sources, sync_jobs, data_source_logs tables
- [ ] Implement BaseDataConnector abstract class
- [ ] Build RestApiConnector with authentication
- [ ] Create data-source-routes.ts with CRUD operations
- [ ] Add encryption for API credentials

**Week 2: File Processing Enhancement**
- [ ] Enhance CSV/Excel parser with schema detection
- [ ] Add data validation layer
- [ ] Implement error handling and logging
- [ ] Create data preview functionality

### **Phase 2: Data Processing (Weeks 3-4)**

**Week 3: Aggregation & Transformation**
- [ ] Implement DataAggregator class
- [ ] Create CalculatedFieldProcessor
- [ ] Add filtering engine
- [ ] Build data transformation pipelines

**Week 4: Advanced Features**
- [ ] Implement joins across datasets
- [ ] Add time-series specific functions
- [ ] Create data enrichment capabilities
- [ ] Build data quality checks

### **Phase 3: Dashboard Builder (Weeks 5-7)**

**Week 5: Chart Builder UI**
- [ ] Create AdvancedChartBuilder component
- [ ] Implement drag-and-drop dashboard layout
- [ ] Add real-time chart preview
- [ ] Build chart configuration panel

**Week 6: Visualization Library**
- [ ] Implement 10+ chart types
- [ ] Add custom color schemes
- [ ] Create interactive tooltips
- [ ] Build drill-down functionality

**Week 7: Dashboard Features**
- [ ] Implement dashboard sharing
- [ ] Add export to PDF/PNG
- [ ] Create scheduled reports
- [ ] Build email notifications

### **Phase 4: Advanced BI Features (Weeks 8-10)**

**Week 8: Analytics**
- [ ] Implement trend analysis
- [ ] Add forecasting capabilities
- [ ] Create anomaly detection
- [ ] Build cohort analysis

**Week 9: Collaboration**
- [ ] Add comments on charts
- [ ] Create annotation tools
- [ ] Implement version control
- [ ] Build approval workflows

**Week 10: Performance & Scale**
- [ ] Optimize query performance
- [ ] Add caching layer
- [ ] Implement pagination
- [ ] Create materialized views

---

## Next Steps

1. **Run Database Migration**
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

2. **Install Additional Dependencies**
```bash
npm install axios cron node-schedule
```

3. **Configure Environment Variables**
```env
# Add to .env
ENCRYPTION_KEY=<your-32-byte-hex-key>
ENABLE_SCHEDULED_SYNCS=true
MAX_SYNC_CONCURRENCY=5
```

4. **Start Implementation** - Begin with Phase 1, Week 1

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-28  
**Status:** Ready for Implementation

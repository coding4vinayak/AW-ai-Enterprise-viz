
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface InsightType {
  type: 'trend' | 'anomaly' | 'forecast' | 'summary' | 'correlation';
  data: any;
}

export interface AnomalyResult {
  anomalies: Array<{
    timestamp: string;
    value: number;
    expectedRange: { min: number; max: number };
    severity: 'low' | 'medium' | 'high';
  }>;
  confidence: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  generateInsight(data: string, type: InsightType): Promise<string>;
  detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult>;
}

export abstract class BaseAIProvider implements AIProvider {
  protected customerId: string;
  protected apiKey: string;
  protected model: string;
  protected settings: Record<string, any>;

  constructor(config: {
    customerId: string;
    apiKey: string;
    model: string;
    settings?: Record<string, any>;
  }) {
    this.customerId = config.customerId;
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.settings = config.settings || {};
  }

  abstract chat(messages: Message[], options?: ChatOptions): Promise<string>;
  abstract generateInsight(data: string, type: InsightType): Promise<string>;
  abstract detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult>;

  protected async trackUsage(metricType: string, value: number, metadata?: Record<string, any>): Promise<void> {
    // Placeholder for usage tracking - will be implemented in Phase 5
    console.log(`Usage tracked: ${metricType} = ${value} for customer ${this.customerId}`);
  }
}

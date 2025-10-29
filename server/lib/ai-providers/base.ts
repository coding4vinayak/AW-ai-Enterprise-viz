
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface TimeSeriesData {
  timestamp: Date;
  value: number;
  [key: string]: any;
}

export interface AnomalyResult {
  anomalies: Array<{
    timestamp: Date;
    value: number;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }>;
  summary: string;
}

export type InsightType = 'trend' | 'correlation' | 'anomaly' | 'summary' | 'forecast';

export interface AIProvider {
  chat(messages: Message[], options?: ChatOptions): Promise<string>;
  generateInsight(data: string, type: InsightType): Promise<string>;
  detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult>;
}

export abstract class BaseAIProvider implements AIProvider {
  protected apiKey: string;
  protected model: string;
  protected baseUrl?: string;

  constructor(apiKey: string, model: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  abstract chat(messages: Message[], options?: ChatOptions): Promise<string>;
  abstract generateInsight(data: string, type: InsightType): Promise<string>;
  abstract detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult>;
}

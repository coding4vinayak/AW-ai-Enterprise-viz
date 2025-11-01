
import OpenAI from 'openai';
import { BaseAIProvider, Message, ChatOptions, InsightType, AnomalyResult, TimeSeriesData } from './base';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: {
    customerId: string;
    apiKey: string;
    model: string;
    settings?: Record<string, any>;
  }) {
    super(config);
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.settings.baseUrl || undefined,
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.model || 'gpt-4',
      messages,
      temperature: options?.temperature ?? this.settings.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? this.settings.maxTokens ?? 1000,
    });

    // Track token usage
    if (response.usage) {
      await this.trackUsage('ai_tokens', response.usage.total_tokens, {
        provider: 'openai',
        model: response.model,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
      });
    }

    return response.choices[0]?.message?.content || '';
  }

  async generateInsight(data: string, insightType: InsightType): Promise<string> {
    const systemPrompt = this.getInsightPrompt(insightType.type);
    
    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze this data and provide insights:\n\n${data}` },
    ]);

    return response;
  }

  async detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult> {
    const dataStr = JSON.stringify(data, null, 2);
    
    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a data analyst expert. Analyze the time series data and detect anomalies. Return a JSON object with anomalies array and confidence score.',
      },
      {
        role: 'user',
        content: `Detect anomalies in this time series data:\n\n${dataStr}\n\nReturn JSON format: { "anomalies": [{ "timestamp": "...", "value": ..., "expectedRange": { "min": ..., "max": ... }, "severity": "low|medium|high" }], "confidence": 0.95 }`,
      },
    ]);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse anomaly detection response:', error);
      return { anomalies: [], confidence: 0 };
    }
  }

  private getInsightPrompt(type: string): string {
    const prompts: Record<string, string> = {
      trend: 'Analyze the data for trends and patterns. Identify upward or downward movements, seasonality, and cyclical patterns.',
      anomaly: 'Identify anomalies, outliers, and unusual patterns in the data. Explain what makes them anomalous.',
      forecast: 'Based on historical patterns, provide forecasts and predictions for future values.',
      summary: 'Provide a concise summary of the key findings and insights from the data.',
      correlation: 'Identify correlations and relationships between different variables in the data.',
    };
    return prompts[type] || prompts.summary;
  }
}

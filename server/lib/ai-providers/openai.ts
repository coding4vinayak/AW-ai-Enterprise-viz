
import OpenAI from 'openai';
import { BaseAIProvider, Message, ChatOptions, InsightType, TimeSeriesData, AnomalyResult } from './base';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string, model: string = 'gpt-4o-mini', baseUrl?: string) {
    super(apiKey, model, baseUrl);
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });
  }

  async chat(messages: Message[], options?: ChatOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model || this.model,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateInsight(data: string, type: InsightType): Promise<string> {
    const prompts: Record<InsightType, string> = {
      trend: `Analyze the following data and identify key trends:\n\n${data}\n\nProvide a concise summary of the main trends.`,
      correlation: `Analyze the following data and identify correlations between variables:\n\n${data}\n\nExplain the relationships you find.`,
      anomaly: `Analyze the following data and identify any anomalies or outliers:\n\n${data}\n\nExplain what makes them unusual.`,
      summary: `Provide a comprehensive summary of the following data:\n\n${data}\n\nHighlight key metrics and patterns.`,
      forecast: `Based on the following historical data, provide a forecast:\n\n${data}\n\nExplain your reasoning.`,
    };

    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a data analytics expert. Provide clear, actionable insights.',
      },
      {
        role: 'user',
        content: prompts[type],
      },
    ];

    return this.chat(messages);
  }

  async detectAnomalies(data: TimeSeriesData[]): Promise<AnomalyResult> {
    const dataStr = JSON.stringify(data, null, 2);
    
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a data analyst specializing in anomaly detection. Analyze time series data and identify anomalies. Respond in JSON format.',
      },
      {
        role: 'user',
        content: `Analyze this time series data for anomalies:\n\n${dataStr}\n\nRespond with JSON: { "anomalies": [{ "timestamp": "ISO date", "value": number, "severity": "low|medium|high", "explanation": "string" }], "summary": "string" }`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.3 });
    
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        anomalies: [],
        summary: response,
      };
    }
  }
}

import { getAIProvider } from './ai-providers/factory';
import { generateInsight as generateInsightOld, chatWithAI as chatWithAIOld, detectAnomalies as detectAnomaliesOld } from './openai';

/**
 * AI Service - Main entry point for all AI operations in the application
 */
export class AIService {
  /**
   * Generate insights from data context
   */
  static async generateInsight(customerId: string, dataContext: string, question?: string) {
    return generateInsightOld(customerId, dataContext, question);
  }

  /**
   * Chat with AI assistant
   */
  static async chatWithAI(
    customerId: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    dataContext?: string
  ) {
    return chatWithAIOld(customerId, messages, dataContext);
  }

  /**
   * Detect anomalies in data using AI
   */
  static async detectAnomalies(customerId: string, data: Array<{ date: string; value: number }>) {
    return detectAnomaliesOld(customerId, data);
  }

  /**
   * Check if AI is configured for a customer
   */
  static async isConfigured(customerId: string) {
    const provider = await getAIProvider(customerId);
    return !!provider;
  }

  /**
   * Test AI provider connection
   */
  static async testConnection(customerId: string) {
    const provider = await getAIProvider(customerId);
    if (!provider) {
      return { success: false, message: 'No AI provider configured' };
    }

    try {
      await provider.chat([
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Test connection' }
      ], { maxTokens: 10 });

      // If we get here, the connection was successful
      return { success: true, message: 'Connection successful' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Connection test failed' 
      };
    }
  }
}
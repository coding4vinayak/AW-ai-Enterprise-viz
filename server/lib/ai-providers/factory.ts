
import { storage } from '../storage';
import { AIProvider } from './base';
import { OpenAIProvider } from './openai';

export async function getAIProvider(customerId: string): Promise<AIProvider> {
  const config = await storage.getDefaultLlmConfig(customerId);
  
  if (!config) {
    throw new Error('No AI provider configured for this customer');
  }

  const provider = await storage.getLlmProvider(config.providerId);
  
  if (!provider || !provider.isActive) {
    throw new Error('AI provider is not available');
  }

  const settings = (config.settings as any) || {};
  
  switch (provider.type) {
    case 'openai':
      return new OpenAIProvider(
        config.apiKey,
        config.model || provider.defaultModel || 'gpt-4o-mini',
        provider.baseUrl
      );
    
    // Add more providers as implemented
    default:
      throw new Error(`Unsupported AI provider: ${provider.type}`);
  }
}

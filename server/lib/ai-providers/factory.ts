
import { storage } from '../../storage';
import { AIProvider } from './base';
import { OpenAIProvider } from './openai';
import { OpenAICompatibleProvider } from './openai-compatible';
import { decryptApiKey } from '../encryption';

export async function getAIProvider(customerId: string): Promise<AIProvider | null> {
  try {
    const config = await storage.getDefaultLlmConfig(customerId);
    
    if (!config) {
      console.log(`No AI config found for customer ${customerId}`);
      return null;
    }

    const provider = await storage.getLlmProvider(config.providerId);
    
    if (!provider || !provider.isActive) {
      console.log(`Provider not found or inactive for customer ${customerId}`);
      return null;
    }

    // Decrypt API key
    const apiKey = decryptApiKey(config.apiKey);

    switch (provider.type) {
      case 'openai':
        return new OpenAIProvider({
          customerId,
          apiKey,
          model: config.model || provider.defaultModel,
          settings: config.settings || {},
        });
      
      case 'openai-compatible':
        return new OpenAICompatibleProvider({
          customerId,
          apiKey,
          model: config.model || provider.defaultModel,
          settings: config.settings || {},
        });
      
      // Future providers can be added here
      // case 'anthropic':
      //   return new AnthropicProvider({ ... });
      
      default:
        console.error(`Unknown provider type: ${provider.type}`);
        return null;
    }
  } catch (error) {
    console.error('Failed to get AI provider:', error);
    return null;
  }
}

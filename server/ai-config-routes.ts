
import { Router } from 'express';
import { storage } from './storage';
import { authenticateUser } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { encryptApiKey, decryptApiKey } from './lib/encryption';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';

const router = Router();

// Get all available LLM providers
router.get('/llm-providers', authenticateUser, async (req, res) => {
  try {
    const providers = await storage.getLlmProviders();
    res.json(providers);
  } catch (error) {
    console.error('Failed to fetch LLM providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get customer's AI configuration
router.get('/ai-config', authenticateUser, async (req, res) => {
  const customerId = req.user!.customerId;
  try {
    const { customerId } = req.params;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const config = await storage.getDefaultLlmConfig(customerId);
    
    if (!config) {
      return res.status(404).json({ error: 'No AI configuration found' });
    }

    // Mask API key for security (show only last 4 chars)
    const maskedConfig = {
      ...config,
      apiKey: config.apiKey ? '***' + config.apiKey.slice(-4) : '',
    };

    res.json(maskedConfig);
  } catch (error) {
    console.error('Failed to fetch AI config:', error);
    res.status(500).json({ error: 'Failed to fetch AI configuration' });
  }
});

// Create or update customer's AI configuration
router.post('/ai-config', authenticateUser, requireRole(['customer_admin', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { providerId, apiKey, model, settings, isDefault, baseUrl } = req.body;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!providerId || !apiKey) {
      return res.status(400).json({ error: 'Provider ID and API key are required' });
    }

    // Encrypt API key
    const encryptedApiKey = encryptApiKey(apiKey);

    // Check if config already exists
    const existingConfig = await storage.getDefaultLlmConfig(customerId);

    let config;
    if (existingConfig) {
      // Update existing
      config = await storage.updateCustomerLlmConfig(existingConfig.id, {
        providerId,
        apiKey: encryptedApiKey,
        model,
        settings: {
          ...settings,
          baseUrl: baseUrl || settings?.baseUrl,
        },
        isDefault: isDefault ?? true,
      });
    } else {
      // Create new
      config = await storage.createCustomerLlmConfig({
        id: randomUUID(),
        customerId,
        providerId,
        apiKey: encryptedApiKey,
        model,
        settings: {
          ...settings,
          baseUrl: baseUrl || settings?.baseUrl,
        },
        isDefault: isDefault ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Failed to save AI config:', error);
    res.status(500).json({ error: 'Failed to save AI configuration' });
  }
});

// Test AI configuration
router.post('/ai-config/test', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { providerId, apiKey, model, baseUrl } = req.body;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const provider = await storage.getLlmProvider(providerId);
    
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    // Test connection based on provider type
    if (provider.type === 'openai') {
      const client = new OpenAI({ 
        apiKey,
        baseURL: baseUrl || undefined,
      });
      await client.models.list();
      res.json({ success: true, message: 'Connection successful' });
    } else {
      res.status(400).json({ error: 'Provider type not supported for testing yet' });
    }
  } catch (error: any) {
    console.error('AI config test failed:', error);
    res.status(500).json({ error: error.message || 'Connection test failed' });
  }
});

export default router;


import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { randomUUID } from 'crypto';

export async function trackAPICall(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      if (req.user?.customerId && req.path.startsWith('/api/')) {
        await storage.createUsageMetric({
          id: randomUUID(),
          customerId: req.user.customerId,
          userId: req.user.id,
          metricType: 'api_call',
          value: 1,
          metadata: {
            endpoint: req.path,
            method: req.method,
            duration: Date.now() - start,
            statusCode: res.statusCode,
          },
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to track API call:', error);
    }
  });
  
  next();
}

export async function trackAITokens(customerId: string, userId: string, tokens: number, metadata: any) {
  try {
    await storage.createUsageMetric({
      id: randomUUID(),
      customerId,
      userId,
      metricType: 'ai_tokens',
      value: tokens,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to track AI tokens:', error);
  }
}

export async function trackStorage(customerId: string, userId: string, bytes: number, metadata: any) {
  try {
    await storage.createUsageMetric({
      id: randomUUID(),
      customerId,
      userId,
      metricType: 'storage',
      value: bytes,
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to track storage:', error);
  }
}

export async function checkQuota(customerId: string, quotaType: string): Promise<boolean> {
  try {
    const quota = await storage.getCustomerQuota(customerId, quotaType);
    if (!quota) return true; // No quota means unlimited
    
    return quota.used < quota.limit;
  } catch (error) {
    console.error('Failed to check quota:', error);
    return true; // Allow on error
  }
}

export async function incrementQuota(customerId: string, quotaType: string, amount: number = 1) {
  try {
    await storage.incrementQuotaUsage(customerId, quotaType, amount);
  } catch (error) {
    console.error('Failed to increment quota:', error);
  }
}

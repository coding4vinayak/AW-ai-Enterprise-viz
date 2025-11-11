
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { randomUUID } from 'crypto';
import { logAPICall } from './logging';

export async function trackAPICall(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      // Track usage in database
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
      
      // Log the API call with structured logging
      if (req.user && req.path.startsWith('/api/')) {
        logAPICall(
          req.user.id || 'unknown',
          req.user.customerId || 'unknown',
          req.path,
          req.method,
          res.statusCode,
          Date.now() - start
        );
      }
    } catch (error) {
      console.error('Failed to track API call:', error);
    }
  });
  
  next();
}

// New function to track API calls with detailed parameters
export async function trackAPICallDetailed(params: {
  userId: string | null;
  customerId: string | null;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  response?: any;
}) {
  try {
    // Track usage in database if we have customer info
    if (params.customerId) {
      await storage.createUsageMetric({
        id: randomUUID(),
        customerId: params.customerId,
        userId: params.userId || undefined,
        metricType: 'api_call',
        value: 1,
        metadata: {
          endpoint: params.endpoint,
          method: params.method,
          duration: params.duration,
          statusCode: params.status,
        },
        timestamp: new Date(),
      });
    }
    
    // Log the API call with structured logging
    logAPICall(
      params.userId || 'unknown',
      params.customerId || 'unknown',
      params.endpoint,
      params.method,
      params.status,
      params.duration
    );
  } catch (error) {
    console.error('Failed to track API call:', error);
  }
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

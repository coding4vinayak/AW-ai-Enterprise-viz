import pino, { Logger } from 'pino';
import { Request, Response, NextFunction } from 'express';

// Create a global logger instance
export const logger: Logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:dd-mm-yyyy HH:MM:ss.l',
      ignore: 'pid,hostname',
    }
  } : undefined,
  mixin() {
    // Add common fields to all log entries
    return { service: 'ai-viz-platform' };
  }
});

// Custom type for log levels
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Log middleware for HTTP requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Only log API requests
    if (req.path.startsWith('/api')) {
      logger.info({
        type: 'http-request',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        userId: (req as any).user?.id || null,
        customerId: (req as any).user?.customerId || null,
      }, 'API request completed');
    }
  });
  
  next();
};

// Security event logger
export const securityLogger = {
  failedLogin: (ip: string, identifier: string) => {
    logger.warn({
      type: 'security-event',
      event: 'failed-login',
      ip,
      identifier,
      timestamp: new Date().toISOString()
    }, 'Failed login attempt');
  },

  successfulLogin: (userId: string, ip: string, customerId: string) => {
    logger.info({
      type: 'security-event',
      event: 'successful-login',
      userId,
      customerId,
      ip,
      timestamp: new Date().toISOString()
    }, 'Successful login');
  },

  suspiciousActivity: (userId: string, customerId: string, action: string, details: any) => {
    logger.warn({
      type: 'security-event',
      event: 'suspicious-activity',
      userId,
      customerId,
      action,
      details,
      timestamp: new Date().toISOString()
    }, 'Suspicious activity detected');
  },

  dataAccess: (userId: string, customerId: string, resourceType: string, resourceId: string) => {
    logger.info({
      type: 'security-event',
      event: 'data-access',
      userId,
      customerId,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString()
    }, 'Data access event');
  }
};

// Error logger
export const logError = (error: Error, context?: string, additionalInfo?: Record<string, any>) => {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    context,
    ...additionalInfo
  }, 'Error occurred');
};

// API call logger
export const logAPICall = (userId: string, customerId: string, endpoint: string, method: string, status: number, duration: number) => {
  logger.info({
    type: 'api-call',
    userId,
    customerId,
    endpoint,
    method,
    status,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  }, 'API call recorded');
};

// Data processing logger
export const logDataProcessing = (customerId: string, datasetId: string, operation: string, status: 'success' | 'error', details?: any) => {
  logger.info({
    type: 'data-processing',
    customerId,
    datasetId,
    operation,
    status,
    details,
    timestamp: new Date().toISOString()
  }, `Data processing ${status}`);
};

// Health check logger
export const logHealthCheck = (service: string, status: 'up' | 'down', details?: any) => {
  logger.info({
    type: 'health-check',
    service,
    status,
    details,
    timestamp: new Date().toISOString()
  }, `Health check for ${service}: ${status}`);
};
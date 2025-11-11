import { Router } from 'express';
import { isDatabaseHealthy } from './db';
import { logger } from './middleware/logging';
import { sql } from 'drizzle-orm';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const dbHealthy = await isDatabaseHealthy();
    
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: dbHealthy,
      },
      version: process.env.npm_package_version || 'unknown',
    };

    // Log health check
    logger.info({
      type: 'health-check',
      endpoint: '/health',
      status: 'ok',
      dbHealthy,
      timestamp: new Date().toISOString()
    }, 'Health check performed');

    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error({
      type: 'health-check',
      endpoint: '/health',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, 'Health check failed');

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const dbReady = await isDatabaseHealthy();
    
    if (dbReady) {
      res.status(200).json({ 
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: true,
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: false,
        }
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Liveness check endpoint
router.get('/live', (req, res) => {
  // Simple liveness check - just return 200 if process is running
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

export default router;
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import authRoutes from "./auth-routes";
import dashboardTemplatesRoutes from "./dashboard-templates-routes";
import dataSourceRoutes from './data-source-routes';
import dataProcessingRoutes from './data-processing-routes';
import dashboardSharingRoutes from './dashboard-sharing-routes';
import emailReportsRoutes from './email-reports-routes';
import webhookRoutes from './webhook-routes';
import fileUploadRoutes from './file-upload-routes';
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import { authenticateUser, sessionSecurity } from "./middleware/auth";
import { trackAPICall, trackAPICallDetailed } from "./middleware/usage-tracker";
import chartBuilderRoutes from './chart-builder-routes';
import { logger, requestLogger } from "./middleware/logging";

const app = express();
const PgSession = connectPgSimple(session);

// Rate limiting configuration (increased limits for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all requests
app.use(limiter);

// Add security headers
app.use((req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Cross-site scripting protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

import cookieParser from 'cookie-parser';

// ... (existing imports)

// ... (existing code)

app.use(cookieParser());

// Session configuration with enhanced security
app.use(
  session({
    store: new PgSession({
      pool: pool as any,
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours (reduced from 30 days for security)
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'lax', // Helps with CSRF protection
      path: '/', // Apply to entire site
    },
  })
);

// Enhanced session security checks
import csrf from '@dr.pogodin/csurf';

// ... (existing imports)

// ... (existing code)

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.use(csrfProtection);

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: '50mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Usage tracking middleware (should be before routes)
app.use(trackAPICall);

// Use structured logging middleware
app.use(requestLogger);

// Enhanced API call tracking with detailed logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Use the new detailed tracking function
      trackAPICallDetailed({
        userId: (req as any).user?.id || null,
        customerId: (req as any).user?.customerId || null,
        endpoint: path,
        method: req.method,
        status: res.statusCode,
        duration,
        response: capturedJsonResponse
      });
    }
  });

  next();
});

(async () => {
  // Test database connection with retries
  let dbConnected = false;
  for (let i = 0; i < 3; i++) {
    try {
      await db.execute(sql`SELECT 1`);
      log('Database connection verified', 'express');
      dbConnected = true;
      break;
    } catch (dbError) {
      log(`Database connection attempt ${i + 1} failed: ${dbError}`, 'express');
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  if (!dbConnected) {
    log('Database connection failed after 3 attempts, skipping seed', 'express');
  } else {
    // Seed database on first run (non-blocking)
    seedDatabase()
      .then(() => {
        log('Database seeding completed successfully', 'express');
      })
      .catch((error) => {
        log(`Failed to seed database: ${error.message}`, 'express');
        log('You can manually seed by calling POST /api/admin/seed-database as super_admin', 'express');
        log('Continuing with server startup...', 'express');
      });
  }

  // More restrictive rate limiting for auth endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth
  message: 'Too many auth attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Register auth routes with more restrictive rate limiting
app.use('/api/auth', authLimiter, authRoutes);

  // Register admin routes
  const adminRoutesModule = (await import('./admin-routes')).default;
  app.use('/api/admin', authenticateUser, adminRoutesModule);

  // Register AI config routes
  const aiConfigRoutesModule = (await import('./ai-config-routes')).default;
  app.use('/api', aiConfigRoutesModule);

  // Register usage routes
  const usageRoutesModule = (await import('./usage-routes')).default;
  app.use('/api', usageRoutesModule);

  // Register dashboard templates routes
  app.use('/api', dashboardTemplatesRoutes);

  // Register data source routes
  app.use('/api', dataSourceRoutes);

  // Register data processing routes
  const dataProcessingRoutes = (await import('./data-processing-routes')).default;
  app.use('/api', dataProcessingRoutes);

  // Register chart builder routes
  const chartBuilderRoutes = (await import('./chart-builder-routes')).default;
  app.use('/api', chartBuilderRoutes);

  // Register analytics routes
  const analyticsRoutes = (await import('./analytics-routes')).default;
  app.use('/api', analyticsRoutes);

  const aiInsightsRoutes = (await import('./ai-insights-routes')).default;
  app.use('/api', aiInsightsRoutes);

  // Register new routes for dashboard sharing, email reports, and webhooks
  app.use('/api', dashboardSharingRoutes);
  app.use('/api', emailReportsRoutes);
  app.use('/api', webhookRoutes);

  // Register dashboard export routes
  const dashboardExportRoutes = (await import('./dashboard-export-routes')).default;
  app.use('/api', dashboardExportRoutes);

  // Register file upload routes
  app.use('/api/files', authenticateUser, fileUploadRoutes);

  // Register health check routes (public, no authentication required)
  const healthRoutes = (await import('./health-routes')).default;
  app.use('/health', healthRoutes);

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    log(`Error: ${message} at ${_req.method} ${_req.path}`); // Added logging for errors
    res.status(status).json({ message });
    // Removed 'throw err;' to prevent double error handling or uncaught exceptions
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '127.0.0.1', () => {
    log(`serving on http://127.0.0.1:${port}`);
  });
})();
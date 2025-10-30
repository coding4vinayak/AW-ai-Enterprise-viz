import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import authRoutes from "./auth-routes";
import aiConfigRoutes from "./ai-config-routes";
import usageRoutes from "./usage-routes";
import adminRoutes from "./admin-routes";
import dashboardTemplatesRoutes from "./dashboard-templates-routes";
import dataSourceRoutes from "./data-source-routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { db, pool } from "./db";
import { authenticateUser } from "./middleware/auth";
import { trackAPICall } from "./middleware/usage-tracker";

const app = express();
const PgSession = connectPgSimple(session);

// Session configuration
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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed database with initial data
  try {
    await seedDatabase();
  } catch (error) {
    log("Failed to seed database:", String(error));
  }

  // Register auth routes
  app.use('/api/auth', authRoutes);

  // Register admin routes
  const adminRoutes = (await import('./admin-routes')).default;
  app.use('/api/admin', authenticateUser, adminRoutes);

  // Register AI config routes
  const aiConfigRoutes = (await import('./ai-config-routes')).default;
  app.use('/api', aiConfigRoutes);

  // Register usage routes
  const usageRoutes = (await import('./usage-routes')).default;
  app.use('/api', usageRoutes);

  // Register dashboard templates routes
  const dashboardTemplatesRoutes = (await import('./dashboard-templates-routes')).default;
  app.use('/api', dashboardTemplatesRoutes);

  // Register data source routes
  app.use('/api', dataSourceRoutes);

  // Register data processing routes
  const dataProcessingRoutes = (await import('./data-processing-routes')).default;
  app.use('/api', dataProcessingRoutes);

  // Register chart builder routes
  const chartBuilderRoutes = (await import('./chart-builder-routes')).default;
  app.use('/api', chartBuilderRoutes);

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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
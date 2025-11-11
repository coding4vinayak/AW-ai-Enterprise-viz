// Enhanced database connection setup following security best practices
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as sqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Database configuration interface
interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeoutMs?: number;
  commandTimeoutMs?: number;
  keepAlive?: boolean;
}

function getDatabaseConfig(): DatabaseConfig {
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
    
    if (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE) {
      databaseUrl = `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
      console.log('[DB] Constructed DATABASE_URL from PG* environment variables');
    } else {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
  }
  
  // Determine configuration based on database type
  const isSQLite = databaseUrl.startsWith('file:');
  
  if (isSQLite) {
    return {
      url: databaseUrl,
      maxConnections: 1, // SQLite is single-connection
      connectionTimeoutMs: 30000,
      commandTimeoutMs: 60000,
      keepAlive: false
    };
  } else {
    // PostgreSQL/Neon configuration
    return {
      url: databaseUrl,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      commandTimeoutMs: parseInt(process.env.DB_COMMAND_TIMEOUT || '60000'),
      keepAlive: true
    };
  }
}

// Initialize based on database type
const dbConfig = getDatabaseConfig();
const isSQLite = dbConfig.url.startsWith('file:');

let _pool: Pool | null = null;
let _sqlite: Database.Database | null = null;
let _db: any | null = null;

if (isSQLite) {
  // Initialize SQLite with security configurations
  const dbPath = dbConfig.url.replace('file:', '');
  const sqliteInstance = new Database(dbPath, {
    // Security options
    readonly: false,
    fileMustExist: true, // Ensure the file exists before opening
  });
  
  // Configure SQLite for security
  sqliteInstance.exec('PRAGMA foreign_keys = ON;'); // Enforce foreign key constraints
  sqliteInstance.exec('PRAGMA journal_mode = WAL;'); // Use WAL mode for better concurrency
  sqliteInstance.exec('PRAGMA synchronous = NORMAL;'); // Balance safety and performance
  
  _db = sqliteDrizzle(sqliteInstance, { schema });
  _sqlite = sqliteInstance;
} else {
  // Initialize PostgreSQL/Neon with enhanced security and connection pooling
  _pool = new Pool({ 
    connectionString: dbConfig.url,
    max: dbConfig.maxConnections,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMs,
    commandTimeoutMillis: dbConfig.commandTimeoutMs,
    keepAlive: dbConfig.keepAlive,
    // Additional security measures
    ssl: {
      rejectUnauthorized: false, // In production with proper SSL, this should be true
    }
  });

  // Add error handling for the pool
  _pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  _db = drizzle(_pool, { schema });
}

// Export the database instance
export const db = _db;

// Export both, but only one will be initialized based on the database type
export const pool = _pool; // This will be null for SQLite

// Graceful shutdown function
export const closeDbConnection = async () => {
  if (_pool) {
    await _pool.end();
  }
  if (_sqlite) {
    _sqlite.close();
  }
};

// Health check function
export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await db.execute(db.sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
// Database connection setup following javascript_database blueprint
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as sqliteDrizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

function getDatabaseUrl(): string {
  let databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env;
    
    if (PGHOST && PGPORT && PGUSER && PGPASSWORD && PGDATABASE) {
      databaseUrl = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
      console.log('[DB] Constructed DATABASE_URL from PG* environment variables');
    } else {
      // Log what we have for debugging
      console.log('[DB] Available env vars:', {
        DATABASE_URL: !!process.env.DATABASE_URL,
        PGHOST: !!PGHOST,
        PGPORT: !!PGPORT,
        PGUSER: !!PGUSER,
        PGPASSWORD: !!PGPASSWORD,
        PGDATABASE: !!PGDATABASE
      });
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
  }
  
  return databaseUrl;
}

// Determine if we're using SQLite based on the URL
const isSQLite = getDatabaseUrl().startsWith('file:');

// Lazy initialization - only create pool when first accessed
let _pool: Pool | null = null;
let _sqlite: Database.Database | null = null;
let _db: any | null = null;

// Initialize based on database type
if (isSQLite) {
  // Initialize SQLite
  const dbPath = getDatabaseUrl().replace('file:', '');
  const sqliteInstance = new Database(dbPath);
  _db = sqliteDrizzle(sqliteInstance, { schema });
  // Set _sqlite to the instance so we can potentially export it if needed
  _sqlite = sqliteInstance;
} else {
  // Initialize PostgreSQL/Neon
  const poolInstance = new Pool({ connectionString: getDatabaseUrl() });
  _db = drizzle({ client: poolInstance, schema });
  // Set _pool to the instance so we can export it
  _pool = poolInstance;
}

// Export the database instance
export const db = _db;

// Export both, but only one will be initialized based on the database type
export const pool = _pool; // This will be null for SQLite

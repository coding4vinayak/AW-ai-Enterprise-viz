// Database connection setup following javascript_database blueprint
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
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

// Lazy initialization - only create pool when first accessed
let _pool: Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    if (!_pool) {
      _pool = new Pool({ connectionString: getDatabaseUrl() });
    }
    return (_pool as any)[prop];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      if (!_pool) {
        _pool = new Pool({ connectionString: getDatabaseUrl() });
      }
      _db = drizzle({ client: _pool, schema });
    }
    return (_db as any)[prop];
  }
});

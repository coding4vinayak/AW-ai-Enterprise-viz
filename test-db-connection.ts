import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
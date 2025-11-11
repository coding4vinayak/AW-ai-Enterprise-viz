import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function checkTables() {
  try {
    console.log('Checking for existing tables...');
    const result = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    console.log('Tables in database:', result);
    
    // Also try to check for a specific table
    console.log('Checking for users table...');
    const usersTable = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') as exists`);
    console.log('Users table exists:', usersTable);
  } catch (error) {
    console.error('Error querying tables:', error);
  }
}

checkTables();
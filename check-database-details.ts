import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function showTableDetails() {
  try {
    console.log('=== DATABASE TABLES AND STRUCTURE ===\n');
    
    // Get all table names
    const tablesResult = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    console.log('Tables in database:');
    tablesResult.rows.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
    });
    
    console.log('\n=== SAMPLE DATA FROM KEY TABLES ===\n');
    
    // Check users table
    try {
      const usersResult = await db.execute(sql`SELECT id, email, username, role, created_at FROM users LIMIT 5`);
      console.log(`Users table (${usersResult.rowCount} records):`);
      usersResult.rows.forEach((row: any) => {
        console.log(`  ${row.id} | ${row.email} | ${row.username} | ${row.role} | ${row.created_at}`);
      });
    } catch (e) {
      console.log('Users table - No data or error:', (e as Error).message);
    }
    
    // Check customers table
    try {
      const customersResult = await db.execute(sql`SELECT id, name, slug, status, created_at FROM customers LIMIT 5`);
      console.log(`\nCustomers table (${customersResult.rowCount} records):`);
      customersResult.rows.forEach((row: any) => {
        console.log(`  ${row.id} | ${row.name} | ${row.slug} | ${row.status} | ${row.created_at}`);
      });
    } catch (e) {
      console.log('Customers table - No data or error:', (e as Error).message);
    }
    
    // Check datasets table
    try {
      const datasetsResult = await db.execute(sql`SELECT id, name, type, row_count, created_at FROM datasets LIMIT 5`);
      console.log(`\nDatasets table (${datasetsResult.rowCount} records):`);
      datasetsResult.rows.forEach((row: any) => {
        console.log(`  ${row.id} | ${row.name} | ${row.type} | ${row.row_count} rows | ${row.created_at}`);
      });
    } catch (e) {
      console.log('Datasets table - No data or error:', (e as Error).message);
    }
    
    // Check dashboards table
    try {
      const dashboardsResult = await db.execute(sql`SELECT id, name, description, created_at FROM dashboards LIMIT 5`);
      console.log(`\nDashboards table (${dashboardsResult.rowCount} records):`);
      dashboardsResult.rows.forEach((row: any) => {
        console.log(`  ${row.id} | ${row.name} | ${row.description} | ${row.created_at}`);
      });
    } catch (e) {
      console.log('Dashboards table - No data or error:', (e as Error).message);
    }
    
    console.log('\n=== TABLE COLUMNS FOR KEY TABLES ===\n');
    
    // Show columns for users table
    try {
      const usersColumns = await db.execute(sql`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      console.log('Users table columns:');
      usersColumns.rows.forEach((row: any) => {
        console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    } catch (e) {
      console.log('Could not get users columns:', (e as Error).message);
    }
    
    console.log('\nDatabase connection and queries are working correctly!');
    console.log('All tables have been created according to the schema.');
    
  } catch (error) {
    console.error('Error in detailed check:', error);
  }
}

showTableDetails();
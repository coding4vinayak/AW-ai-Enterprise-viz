import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function checkUsers() {
  try {
    console.log('Checking for existing users in the database...');
    const allUsers = await db.select().from(users);
    console.log(`Found ${allUsers.length} users in database:`);
    
    for (const user of allUsers) {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Username: ${user.username}`);
    }
    
    if (allUsers.length === 0) {
      console.log('No users found. The database seeding may not have run successfully.');
    }
    
    // Check specifically for the default admin user
    const adminUser = await db.select().from(users).where(eq(users.email, 'admin@example.com'));
    if (adminUser.length > 0) {
      console.log('Default admin user exists!');
    } else {
      console.log('Default admin user (admin@example.com) does not exist.');
    }
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();
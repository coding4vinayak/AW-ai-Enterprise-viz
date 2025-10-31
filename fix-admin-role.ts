
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function fixAdminRole() {
  console.log('Checking admin user...');
  
  // Find admin user by email
  const adminUser = await db.query.users.findFirst({
    where: eq(users.email, 'admin@example.com')
  });

  if (!adminUser) {
    console.log('Admin user not found!');
    return;
  }

  console.log('Current admin user:', {
    id: adminUser.id,
    email: adminUser.email,
    username: adminUser.username,
    role: adminUser.role,
    status: adminUser.status
  });

  if (adminUser.role !== 'super_admin') {
    console.log('Updating admin role to super_admin...');
    await db.update(users)
      .set({ role: 'super_admin', status: 'active' })
      .where(eq(users.id, adminUser.id));
    console.log('Admin role updated successfully!');
  } else {
    console.log('Admin already has super_admin role');
  }

  // Also check your registered user
  const allUsers = await db.select().from(users);
  console.log('\nAll users in database:');
  allUsers.forEach(u => {
    console.log(`- ${u.username} (${u.email}): ${u.role} [${u.status}]`);
  });
}

fixAdminRole()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  });

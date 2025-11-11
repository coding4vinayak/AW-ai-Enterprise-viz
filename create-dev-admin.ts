import { storage } from './server/storage';
import bcrypt from 'bcryptjs';

async function createDevAdmin() {
  try {
    console.log('Creating/Updating development admin user...');
    
    // Hash the password
    const password = 'admin123'; // Use a simple password for development
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if the default admin user already exists
    let adminUser = await storage.getUserByEmail('admin@example.com');
    
    if (adminUser) {
      console.log('Admin user already exists, updating password...');
      // Update the existing admin user with the default password
      await storage.updateUser(adminUser.id, {
        password: hashedPassword
      });
      console.log('Admin user password updated successfully!');
    } else {
      // Create a new admin user
      console.log('Creating new admin user...');
      const defaultCustomer = await storage.getCustomerBySlug('default');
      
      let customerId = defaultCustomer?.id;
      
      // If no default customer exists, create one
      if (!customerId) {
        console.log('Creating default customer...');
        const newCustomer = await storage.createCustomer({
          name: "Default Organization",
          slug: "default",
          status: "active",
          branding: null,
          settings: null,
        });
        customerId = newCustomer.id;
      }
      
      // Create the admin user
      await storage.createUser({
        customerId: customerId,
        email: "admin@example.com",
        username: "admin",
        password: hashedPassword,
        role: "super_admin",
        firstName: "Admin",
        lastName: "User",
        status: "active",
      });
      
      console.log('Admin user created successfully!');
    }
    
    console.log('Development admin user setup complete!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating development admin user:', error);
  }
}

createDevAdmin();
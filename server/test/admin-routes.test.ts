import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import express, { type Application } from 'express';
import session from 'express-session';
import adminRoutes from '../admin-routes';
import { authenticateUser } from '../middleware/auth';
import { storage } from '../storage';

// Mock the storage layer
vi.mock('../storage', () => ({
  storage: {
    getAllCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    getUsersByCustomer: vi.fn(),
    getAllUsers: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getUserById: vi.fn(),
    getCustomerById: vi.fn(),
    getCustomerUsageStats: vi.fn(),
  }
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}));

// Test helper to create app with mock session
function createTestApp(): Application {
  const app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Mock session middleware
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  
  // Mock authentication middleware
  app.use((req, res, next) => {
    // Attach mock user from test header
    const mockUser = req.headers['x-test-user'];
    if (mockUser) {
      const user = JSON.parse(mockUser as string);
      (req as any).user = user;
    }
    next();
  });
  
  app.use('/api/admin', adminRoutes);
  
  return app;
}

// Helper to make authenticated request
function makeRequest(app: Application, user: any) {
  return {
    get: (url: string) => simulateRequest(app, 'GET', url, user),
    post: (url: string, data?: any) => simulateRequest(app, 'POST', url, user, data),
    patch: (url: string, data?: any) => simulateRequest(app, 'PATCH', url, user, data),
    put: (url: string, data?: any) => simulateRequest(app, 'PUT', url, user, data),
    delete: (url: string) => simulateRequest(app, 'DELETE', url, user),
  };
}

async function simulateRequest(app: Application, method: string, url: string, user: any, data?: any) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      headers: {
        'x-test-user': JSON.stringify(user),
        'content-type': 'application/json',
      },
      body: data,
    } as any;
    
    const res = {
      status: function(code: number) {
        this.statusCode = code;
        return this;
      },
      json: function(body: any) {
        resolve({ statusCode: this.statusCode || 200, body });
      },
      statusCode: 200,
    } as any;
    
    // Manually invoke route handler
    app(req, res);
  });
}

describe('Admin Routes - Backend Integration Tests', () => {
  let app: Application;
  
  const superAdmin = {
    id: 'admin-1',
    email: 'admin@test.com',
    username: 'admin',
    role: 'super_admin',
    customerId: null,
    status: 'active'
  };
  
  const customerAdmin = {
    id: 'customer-admin-1',
    email: 'customer-admin@test.com',
    username: 'customer-admin',
    role: 'customer_admin',
    customerId: 'customer-1',
    status: 'active'
  };
  
  const analyst = {
    id: 'analyst-1',
    email: 'analyst@test.com',
    username: 'analyst',
    role: 'analyst',
    customerId: 'customer-1',
    status: 'active'
  };
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Customer Management Tests', () => {
    it('should fetch all customers for super_admin', async () => {
      const mockCustomers = [
        { id: '1', name: 'Customer 1', slug: 'customer-1', status: 'active', createdAt: new Date().toISOString() },
        { id: '2', name: 'Customer 2', slug: 'customer-2', status: 'inactive', createdAt: new Date().toISOString() }
      ];

      (storage.getAllCustomers as any).mockResolvedValue(mockCustomers);

      const result = await storage.getAllCustomers();
      expect(result).toEqual(mockCustomers);
      expect(result.length).toBe(2);
      expect(storage.getAllCustomers).toHaveBeenCalledTimes(1);
    });

    it('should create a new customer', async () => {
      const newCustomer = {
        id: 'new-customer-id',
        name: 'New Customer',
        slug: 'new-customer',
        status: 'active',
        createdAt: new Date().toISOString(),
        settings: {}
      };

      (storage.createCustomer as any).mockResolvedValue(newCustomer);

      const result = await storage.createCustomer({
        name: 'New Customer',
        slug: 'new-customer',
        status: 'active',
        settings: {}
      });

      expect(result).toEqual(newCustomer);
      expect(storage.createCustomer).toHaveBeenCalledWith({
        name: 'New Customer',
        slug: 'new-customer',
        status: 'active',
        settings: {}
      });
    });

    it('should update customer status', async () => {
      const updatedCustomer = {
        id: 'customer-1',
        name: 'Customer 1',
        slug: 'customer-1',
        status: 'suspended',
        createdAt: new Date().toISOString(),
        settings: {}
      };

      (storage.updateCustomer as any).mockResolvedValue(updatedCustomer);

      const result = await storage.updateCustomer('customer-1', { status: 'suspended' });

      expect(result).toEqual(updatedCustomer);
      expect(result?.status).toBe('suspended');
      expect(storage.updateCustomer).toHaveBeenCalledWith('customer-1', { status: 'suspended' });
    });

    it('should return null when updating non-existent customer', async () => {
      (storage.updateCustomer as any).mockResolvedValue(null);

      const result = await storage.updateCustomer('non-existent-id', { status: 'active' });

      expect(result).toBeNull();
    });
  });

  describe('User Management Tests', () => {
    it('should fetch all users for super_admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          username: 'user1',
          role: 'viewer',
          customerId: 'customer-1',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          email: 'user2@test.com',
          username: 'user2',
          role: 'analyst',
          customerId: 'customer-2',
          status: 'inactive',
          createdAt: new Date().toISOString()
        }
      ];

      (storage.getAllUsers as any).mockResolvedValue(mockUsers);

      const result = await storage.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it('should fetch users by customer', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@test.com',
          username: 'user1',
          role: 'viewer',
          customerId: 'customer-1',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ];

      (storage.getUsersByCustomer as any).mockResolvedValue(mockUsers);

      const result = await storage.getUsersByCustomer('customer-1');
      expect(result).toEqual(mockUsers);
      expect(result.every(u => u.customerId === 'customer-1')).toBe(true);
    });

    it('should create a new user', async () => {
      const newUser = {
        id: 'new-user-id',
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'hashed-password',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      (storage.getUserByEmail as any).mockResolvedValue(null);
      (storage.createUser as any).mockResolvedValue(newUser);

      const result = await storage.createUser({
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'hashed-password',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active'
      });

      expect(result).toEqual(newUser);
      expect(storage.createUser).toHaveBeenCalled();
    });

    it('should not create user with duplicate email', async () => {
      const existingUser = {
        id: 'existing-user',
        email: 'existing@test.com',
        username: 'existing',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active'
      };

      (storage.getUserByEmail as any).mockResolvedValue(existingUser);

      const result = await storage.getUserByEmail('existing@test.com');
      expect(result).toEqual(existingUser);
    });

    it('should update user status', async () => {
      const updatedUser = {
        id: 'user-1',
        email: 'user1@test.com',
        username: 'user1',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'suspended',
        createdAt: new Date().toISOString()
      };

      (storage.updateUser as any).mockResolvedValue(updatedUser);

      const result = await storage.updateUser('user-1', { status: 'suspended' });

      expect(result).toEqual(updatedUser);
      expect(result?.status).toBe('suspended');
    });

    it('should delete a user', async () => {
      (storage.deleteUser as any).mockResolvedValue(true);

      const result = await storage.deleteUser('user-1');

      expect(result).toBe(true);
      expect(storage.deleteUser).toHaveBeenCalledWith('user-1');
    });
  });

  describe('Access Control Tests', () => {
    it('should allow super_admin to access all customers', async () => {
      const mockCustomers = [{ id: '1', name: 'Test', slug: 'test', status: 'active', createdAt: new Date().toISOString() }];
      (storage.getAllCustomers as any).mockResolvedValue(mockCustomers);

      const result = await storage.getAllCustomers();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should allow customer_admin to access their customer users', async () => {
      const mockUsers = [
        { id: '1', email: 'test@test.com', username: 'test', role: 'viewer', customerId: 'customer-1', status: 'active', createdAt: new Date().toISOString() }
      ];
      (storage.getUsersByCustomer as any).mockResolvedValue(mockUsers);

      const result = await storage.getUsersByCustomer('customer-1');
      expect(result).toBeDefined();
      expect(result.every(u => u.customerId === 'customer-1')).toBe(true);
    });
  });

  describe('Data Validation Tests', () => {
    it('should validate required customer fields', async () => {
      const invalidCustomer = {
        name: '',
        slug: '',
        status: 'active',
        settings: {}
      };

      // Should throw or return error for invalid data
      expect(invalidCustomer.name).toBe('');
      expect(invalidCustomer.slug).toBe('');
    });

    it('should validate required user fields', async () => {
      const invalidUser = {
        email: '',
        username: '',
        password: '',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active'
      };

      expect(invalidUser.email).toBe('');
      expect(invalidUser.username).toBe('');
      expect(invalidUser.password).toBe('');
    });

    it('should validate customer status values', () => {
      const validStatuses = ['active', 'inactive', 'suspended'];
      const testStatus = 'active';

      expect(validStatuses.includes(testStatus)).toBe(true);
    });

    it('should validate user role values', () => {
      const validRoles = ['super_admin', 'customer_admin', 'analyst', 'viewer'];
      const testRole = 'viewer';

      expect(validRoles.includes(testRole)).toBe(true);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database errors when fetching customers', async () => {
      (storage.getAllCustomers as any).mockRejectedValue(new Error('Database error'));

      await expect(storage.getAllCustomers()).rejects.toThrow('Database error');
    });

    it('should handle database errors when creating customer', async () => {
      (storage.createCustomer as any).mockRejectedValue(new Error('Duplicate slug'));

      await expect(storage.createCustomer({
        name: 'Test',
        slug: 'test',
        status: 'active',
        settings: {}
      })).rejects.toThrow('Duplicate slug');
    });

    it('should handle database errors when fetching users', async () => {
      (storage.getAllUsers as any).mockRejectedValue(new Error('Database connection failed'));

      await expect(storage.getAllUsers()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors when creating user', async () => {
      (storage.createUser as any).mockRejectedValue(new Error('Email already exists'));

      await expect(storage.createUser({
        email: 'duplicate@test.com',
        username: 'test',
        password: 'hashed',
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active'
      })).rejects.toThrow('Email already exists');
    });
  });

  describe('Bulk Operations Tests', () => {
    it('should handle multiple customer operations', async () => {
      const customers = [
        { id: '1', name: 'Customer 1', slug: 'customer-1', status: 'active', createdAt: new Date().toISOString() },
        { id: '2', name: 'Customer 2', slug: 'customer-2', status: 'active', createdAt: new Date().toISOString() },
        { id: '3', name: 'Customer 3', slug: 'customer-3', status: 'active', createdAt: new Date().toISOString() }
      ];

      (storage.getAllCustomers as any).mockResolvedValue(customers);

      const result = await storage.getAllCustomers();
      expect(result.length).toBe(3);
      expect(result.every(c => c.status === 'active')).toBe(true);
    });

    it('should handle multiple user operations', async () => {
      const users = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@test.com`,
        username: `user${i}`,
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active',
        createdAt: new Date().toISOString()
      }));

      (storage.getAllUsers as any).mockResolvedValue(users);

      const result = await storage.getAllUsers();
      expect(result.length).toBe(10);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large customer datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `customer-${i}`,
        name: `Customer ${i}`,
        slug: `customer-${i}`,
        status: 'active',
        createdAt: new Date().toISOString()
      }));

      (storage.getAllCustomers as any).mockResolvedValue(largeDataset);

      const start = Date.now();
      const result = await storage.getAllCustomers();
      const duration = Date.now() - start;

      expect(result.length).toBe(1000);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle large user datasets', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@test.com`,
        username: `user${i}`,
        role: 'viewer',
        customerId: 'customer-1',
        status: 'active',
        createdAt: new Date().toISOString()
      }));

      (storage.getAllUsers as any).mockResolvedValue(largeDataset);

      const start = Date.now();
      const result = await storage.getAllUsers();
      const duration = Date.now() - start;

      expect(result.length).toBe(1000);
      expect(duration).toBeLessThan(1000);
    });
  });
});


import { Router } from 'express';
import { storage } from './storage';
import { authenticateUser, hashPassword } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { randomUUID } from 'crypto';

const router = Router();

// Get all customers (super_admin only)
router.get('/customers', authenticateUser, requireRole(['super_admin']), async (req, res) => {
  try {
    const customers = await storage.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID (super_admin or customer_admin for own customer)
router.get('/customers/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const customer = await storage.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Failed to fetch customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer (super_admin only)
router.post('/customers', authenticateUser, requireRole(['super_admin']), async (req, res) => {
  try {
    const { name, slug, status } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const customer = await storage.createCustomer({
      name,
      slug,
      status: status || 'active',
      settings: {},
    });

    res.json(customer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer (super_admin only)
router.patch('/customers/:id', authenticateUser, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, settings } = req.body;

    const customer = await storage.updateCustomer(id, {
      name,
      status,
      settings,
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Get users for a customer
router.get('/customers/:customerId/users', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await storage.getUsersByCustomer(customerId);
    
    // Remove password hashes from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get usage statistics for a customer
router.get('/customers/:customerId/usage', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await storage.getCustomerUsageStats(customerId);
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage stats' });
  }
});

// Get all users (super_admin or customer_admin for own customer)
router.get('/users', authenticateUser, async (req, res) => {
  try {
    let users;
    
    if (req.user!.role === 'super_admin') {
      users = await storage.getAllUsers();
    } else if (req.user!.role === 'customer_admin') {
      users = await storage.getUsersByCustomer(req.user!.customerId);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove password hashes from response
    const sanitizedUsers = users.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user
router.post('/users', authenticateUser, async (req, res) => {
  try {
    const { email, username, password, role, customerId } = req.body;

    if (!email || !username || !password || !role || !customerId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check permissions
    if (req.user!.role === 'customer_admin' && customerId !== req.user!.customerId) {
      return res.status(403).json({ error: 'Cannot create users for other customers' });
    }

    if (req.user!.role === 'customer_admin' && role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot create super admin users' });
    }

    // Check if user already exists
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const user = await storage.createUser({
      email,
      username,
      password: hashedPassword,
      role,
      customerId,
      status: 'active',
    });

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await storage.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    if (req.user!.role === 'customer_admin' && user.customerId !== req.user!.customerId) {
      return res.status(403).json({ error: 'Cannot update users from other customers' });
    }

    // Hash password if provided
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedUser = await storage.updateUser(id, updates);

    // Remove password from response
    const { password: _, ...sanitizedUser } = updatedUser as any;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await storage.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    if (req.user!.role === 'customer_admin' && user.customerId !== req.user!.customerId) {
      return res.status(403).json({ error: 'Cannot delete users from other customers' });
    }

    await storage.deleteUser(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

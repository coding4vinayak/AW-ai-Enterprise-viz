
import { Router } from 'express';
import { storage } from './storage';
import { authenticateUser } from './middleware/auth';
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
      id: randomUUID(),
      name,
      slug,
      status: status || 'active',
      settings: {},
      createdAt: new Date(),
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

export default router;

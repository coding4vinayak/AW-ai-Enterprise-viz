
import { Router } from 'express';
import { storage } from './storage';
import { authenticateUser } from './middleware/auth';
import { requireRole } from './middleware/rbac';

const router = Router();

// Get usage statistics for a customer
router.get('/usage/stats', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const period = (req.query.period as 'day' | 'week' | 'month') || 'week';

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const stats = await storage.getUsageStats(customerId, period);
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch usage statistics' });
  }
});

// Get quota information for a customer
router.get('/usage/quotas', authenticateUser, requireRole(['customer_admin', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;

    // Check permissions
    if (req.user!.role !== 'super_admin' && req.user!.customerId !== customerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const quotas = await storage.getCustomerQuotas(customerId);
    res.json(quotas);
  } catch (error) {
    console.error('Failed to fetch quotas:', error);
    res.status(500).json({ error: 'Failed to fetch quotas' });
  }
});

export default router;

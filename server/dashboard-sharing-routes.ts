
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = Router();

// Create share link
router.post('/api/dashboards/:id/share', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { expiresIn, isPublic, password, allowedEmails, permissions } = req.body;
    
    const dashboard = await storage.getDashboard(req.params.id, customerId);
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    
    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    
    const share = await storage.createDashboardShare({
      dashboardId: req.params.id,
      shareToken,
      expiresAt,
      isPublic,
      password: hashedPassword,
      allowedEmails,
      permissions: permissions || { canEdit: false, canExport: true },
      createdBy: req.user!.id,
    });
    
    res.json({
      shareUrl: `${req.protocol}://${req.get('host')}/shared/${shareToken}`,
      share,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get dashboard by share token
router.get('/api/shared/:token', async (req, res) => {
  try {
    const share = await storage.getDashboardShareByToken(req.params.token);
    
    if (!share) {
      return res.status(404).json({ error: 'Share not found' });
    }
    
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ error: 'Share link expired' });
    }
    
    const dashboard = await storage.getDashboardById(share.dashboardId);
    res.json({ dashboard, share, requiresPassword: !!share.password });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Verify password for shared dashboard
router.post('/api/shared/:token/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const share = await storage.getDashboardShareByToken(req.params.token);
    
    if (!share || !share.password) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    const isValid = await bcrypt.compare(password, share.password);
    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Revoke share link
router.delete('/api/dashboards/:id/share/:shareId', authenticateUser, async (req, res) => {
  try {
    await storage.deleteDashboardShare(req.params.shareId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

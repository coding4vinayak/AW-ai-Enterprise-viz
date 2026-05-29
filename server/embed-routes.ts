import { Router } from 'express';
import { db } from './db';
import { dashboardShares, charts, dashboards } from '@shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Get embeddable chart by share token
router.get('/embed/chart/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    if (!UUID_PATTERN.test(shareToken)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const shares = await db
      .select()
      .from(dashboardShares)
      .where(eq(dashboardShares.shareToken, shareToken));

    if (shares.length === 0) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const share = shares[0];

    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    const dashboardCharts = await db
      .select()
      .from(charts)
      .where(eq(charts.dashboardId, share.dashboardId));

    if (dashboardCharts.length === 0) {
      return res.status(404).json({ error: 'No charts found for this dashboard' });
    }

    res.json({
      chart: dashboardCharts[0],
      permissions: share.permissions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get embeddable dashboard by share token
router.get('/embed/dashboard/:shareToken', async (req, res) => {
  try {
    const { shareToken } = req.params;

    if (!UUID_PATTERN.test(shareToken)) {
      return res.status(400).json({ error: 'Invalid token format' });
    }

    const shares = await db
      .select()
      .from(dashboardShares)
      .where(eq(dashboardShares.shareToken, shareToken));

    if (shares.length === 0) {
      return res.status(404).json({ error: 'Share not found' });
    }

    const share = shares[0];

    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    const [dashboard] = await db
      .select()
      .from(dashboards)
      .where(eq(dashboards.id, share.dashboardId));

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const dashboardCharts = await db
      .select()
      .from(charts)
      .where(eq(charts.dashboardId, share.dashboardId));

    res.json({
      dashboard,
      charts: dashboardCharts,
      permissions: share.permissions,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

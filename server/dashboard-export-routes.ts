
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';

const router = Router();

// Export dashboard as JSON
router.get('/api/dashboards/:id/export/json', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dashboard = await storage.getDashboard(req.params.id, customerId);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const charts = await storage.getChartsByDashboard(dashboard.id);
    
    const exportData = {
      dashboard: {
        name: dashboard.name,
        description: dashboard.description,
        layout: dashboard.layout,
      },
      charts: charts.map(chart => ({
        id: chart.id,
        name: chart.name,
        type: chart.type,
        config: chart.config,
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${dashboard.name.replace(/[^a-z0-9]/gi, '_')}_export.json"`);
    res.json(exportData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export dashboard data as CSV
router.get('/api/dashboards/:id/export/csv', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dashboard = await storage.getDashboard(req.params.id, customerId);
    
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const charts = await storage.getChartsByDashboard(dashboard.id);
    
    // Combine all chart data
    let csvContent = 'Chart Name,Chart Type,Data Point,Value\n';
    
    for (const chart of charts) {
      const config = chart.config as any;
      if (config.data && Array.isArray(config.data)) {
        config.data.forEach((point: any) => {
          const keys = Object.keys(point);
          keys.forEach(key => {
            csvContent += `"${chart.name}","${chart.type}","${key}","${point[key]}"\n`;
          });
        });
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${dashboard.name.replace(/[^a-z0-9]/gi, '_')}_data.csv"`);
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

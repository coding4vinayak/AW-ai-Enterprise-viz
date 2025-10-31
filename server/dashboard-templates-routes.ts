
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { storage } from './storage';

const router = Router();

// Create dashboard from template
router.post('/api/dashboard-templates/create-from-template', authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { templateType, name, datasetIds, config } = req.body;

    // Create dashboard based on template
    const dashboard = await storage.createDashboard({
      name: name || `${templateType} Dashboard`,
      description: `Auto-generated ${templateType} dashboard`,
      layout: generateTemplateLayout(templateType),
      isPreset: false,
    }, customerId);

    // Create charts based on template
    const charts = await createTemplateCharts(dashboard.id, templateType, datasetIds, config, customerId);

    res.json({ dashboard, charts });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get available templates
router.get('/api/dashboard-templates', authenticateUser, async (req, res) => {
  const templates = [
    {
      id: 'sales-overview',
      name: 'Sales Overview',
      description: 'Track revenue, orders, and customer metrics',
      requiredFields: ['date', 'revenue', 'quantity'],
      charts: ['revenue-trend', 'top-products', 'regional-sales']
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics',
      description: 'Monitor customer behavior and retention',
      requiredFields: ['date', 'customer_id', 'value'],
      charts: ['customer-growth', 'retention-rate', 'lifetime-value']
    },
    {
      id: 'inventory-tracking',
      name: 'Inventory Tracking',
      description: 'Monitor stock levels and turnover',
      requiredFields: ['product', 'stock_count', 'category'],
      charts: ['stock-levels', 'low-stock-alerts', 'turnover-rate']
    },
    {
      id: 'financial-kpi',
      name: 'Financial KPIs',
      description: 'Key financial metrics and trends',
      requiredFields: ['date', 'revenue', 'expenses', 'profit'],
      charts: ['profit-trend', 'expense-breakdown', 'margin-analysis']
    }
  ];

  res.json(templates);
});

function generateTemplateLayout(templateType: string) {
  const layouts: Record<string, any> = {
    'sales-overview': {
      grid: [
        { i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 },
        { i: 'kpi-2', x: 3, y: 0, w: 3, h: 2 },
        { i: 'kpi-3', x: 6, y: 0, w: 3, h: 2 },
        { i: 'kpi-4', x: 9, y: 0, w: 3, h: 2 },
        { i: 'chart-1', x: 0, y: 2, w: 8, h: 4 },
        { i: 'chart-2', x: 8, y: 2, w: 4, h: 4 },
      ]
    },
    'customer-analytics': {
      grid: [
        { i: 'chart-1', x: 0, y: 0, w: 6, h: 4 },
        { i: 'chart-2', x: 6, y: 0, w: 6, h: 4 },
        { i: 'chart-3', x: 0, y: 4, w: 12, h: 4 },
      ]
    },
    'inventory-tracking': {
      grid: [
        { i: 'chart-1', x: 0, y: 0, w: 4, h: 4 },
        { i: 'chart-2', x: 4, y: 0, w: 4, h: 4 },
        { i: 'chart-3', x: 8, y: 0, w: 4, h: 4 },
      ]
    },
    'financial-kpi': {
      grid: [
        { i: 'kpi-1', x: 0, y: 0, w: 4, h: 2 },
        { i: 'kpi-2', x: 4, y: 0, w: 4, h: 2 },
        { i: 'kpi-3', x: 8, y: 0, w: 4, h: 2 },
        { i: 'chart-1', x: 0, y: 2, w: 12, h: 4 },
      ]
    }
  };

  return layouts[templateType] || layouts['sales-overview'];
}

async function createTemplateCharts(
  dashboardId: string,
  templateType: string,
  datasetIds: string[],
  config: any,
  customerId: string
) {
  const chartConfigs: Record<string, any[]> = {
    'sales-overview': [
      {
        type: 'line',
        title: 'Revenue Trend',
        config: { metric: config.revenueField || 'revenue', xAxis: config.dateField || 'date', aggregation: 'sum' }
      },
      {
        type: 'bar',
        title: 'Top Products',
        config: { metric: config.revenueField || 'revenue', xAxis: config.productField || 'product', aggregation: 'sum' }
      },
      {
        type: 'pie',
        title: 'Sales by Region',
        config: { metric: config.revenueField || 'revenue', xAxis: config.regionField || 'region', aggregation: 'sum' }
      }
    ],
    'customer-analytics': [
      {
        type: 'area',
        title: 'Customer Growth',
        config: { metric: 'customer_count', xAxis: config.dateField || 'date', aggregation: 'count' }
      },
      {
        type: 'line',
        title: 'Customer Lifetime Value',
        config: { metric: config.valueField || 'value', xAxis: config.dateField || 'date', aggregation: 'avg' }
      }
    ],
    'inventory-tracking': [
      {
        type: 'bar',
        title: 'Stock Levels by Category',
        config: { metric: config.stockField || 'stock_count', xAxis: config.categoryField || 'category', aggregation: 'sum' }
      }
    ],
    'financial-kpi': [
      {
        type: 'line',
        title: 'Profit & Loss Trend',
        config: { metric: config.profitField || 'profit', xAxis: config.dateField || 'date', aggregation: 'sum' }
      }
    ]
  };

  const charts = chartConfigs[templateType] || chartConfigs['sales-overview'];
  const datasetId = datasetIds[0]; // Use first dataset

  const createdCharts = [];
  for (const chartConfig of charts) {
    const chart = await storage.createChart({
      dashboardId,
      datasetId,
      type: chartConfig.type,
      title: chartConfig.title,
      config: chartConfig.config,
      customerId
    }, customerId);
    createdCharts.push(chart);
  }

  return createdCharts;
}

export default router;

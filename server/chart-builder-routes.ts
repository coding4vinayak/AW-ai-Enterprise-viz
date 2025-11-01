
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import { AggregationEngine } from './lib/data-processing/aggregation-engine';
import { CalculatedFieldsEngine } from './lib/data-processing/calculated-fields';
import type { AdvancedChartConfig } from '../shared/types';

const router = Router();

// Create advanced chart
router.post('/api/charts/advanced', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { title, type, config, dashboardId } = req.body;
    
    const chart = await storage.createChart({
      title,
      type,
      config,
      dashboardId: dashboardId || 'default',
      customerId
    });
    
    res.json(chart);
  } catch (error: any) {
    console.error('Chart creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Process data for chart visualization
router.post('/api/charts/process-data', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const config: AdvancedChartConfig = req.body;
    
    const dataset = await storage.getDataset(config.datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    let data = dataset.uploadedData as any[];
    
    // Apply filters
    if (config.filters && config.filters.length > 0) {
      data = AggregationEngine.filter(data, config.filters);
    }
    
    // Apply calculated fields
    if (config.calculatedFields && config.calculatedFields.length > 0) {
      data = CalculatedFieldsEngine.applyCalculatedFields(data, config.calculatedFields);
    }
    
    // Apply aggregation
    if (config.aggregation) {
      data = AggregationEngine.aggregate(data, config.aggregation);
    }
    
    res.json({ data, count: Array.isArray(data) ? data.length : 1 });
  } catch (error: any) {
    console.error('Chart data processing error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Save advanced chart configuration
router.post('/api/charts/advanced', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { dashboardId, title, type, config } = req.body;
    
    const chart = await storage.createChart({
      dashboardId,
      datasetId: config.datasetId,
      type,
      title,
      config
    }, customerId);
    
    res.json(chart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get chart with processed data
router.get('/api/charts/:id/data', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const chart = await storage.getChart(req.params.id, customerId);
    
    if (!chart) {
      return res.status(404).json({ error: 'Chart not found' });
    }
    
    const config = chart.config as AdvancedChartConfig;
    const dataset = await storage.getDataset(config.datasetId, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    let data = dataset.uploadedData as any[];
    
    // Process data according to config
    if (config.filters) {
      data = AggregationEngine.filter(data, config.filters);
    }
    if (config.calculatedFields) {
      data = CalculatedFieldsEngine.applyCalculatedFields(data, config.calculatedFields);
    }
    if (config.aggregation) {
      data = AggregationEngine.aggregate(data, config.aggregation);
    }
    
    res.json({ chart, data });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

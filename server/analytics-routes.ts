
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import { TrendAnalyzer } from './lib/analytics/trend-analysis';
import { AnomalyDetector } from './lib/analytics/anomaly-detection';

const router = Router();

// Trend analysis endpoint
router.post('/api/analytics/trend', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { datasetId, xField, yField } = req.body;
    
    const dataset = await storage.getDataset(datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const data = dataset.uploadedData as any[];
    const analysis = TrendAnalyzer.analyzeTrend(data, xField, yField);
    
    res.json(analysis);
  } catch (error: any) {
    console.error('Trend analysis error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Anomaly detection endpoint
router.post('/api/analytics/anomalies', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { datasetId, field, sensitivity = 2 } = req.body;
    
    const dataset = await storage.getDataset(datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const data = dataset.uploadedData as any[];
    const anomalies = AnomalyDetector.detectAnomalies(data, field, sensitivity);
    
    res.json({ anomalies, count: anomalies.length });
  } catch (error: any) {
    console.error('Anomaly detection error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Seasonality detection
router.post('/api/analytics/seasonality', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { datasetId, field } = req.body;
    
    const dataset = await storage.getDataset(datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const data = dataset.uploadedData as any[];
    const seasonality = AnomalyDetector.detectSeasonality(data, field);
    
    res.json(seasonality);
  } catch (error: any) {
    console.error('Seasonality detection error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;

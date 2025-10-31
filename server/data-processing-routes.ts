
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import { AggregationEngine, type AggregationConfig, type FilterConfig } from './lib/data-processing/aggregation-engine';
import { CalculatedFieldsEngine, type CalculatedField } from './lib/data-processing/calculated-fields';

const router = Router();

// Apply aggregation to dataset
router.post('/api/datasets/:id/aggregate', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataset = await storage.getDataset(req.params.id, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const config: AggregationConfig = req.body;
    const data = dataset.uploadedData as any[];
    const result = AggregationEngine.aggregate(data, config);
    
    res.json({ result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Apply filters to dataset
router.post('/api/datasets/:id/filter', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataset = await storage.getDataset(req.params.id, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const filters: FilterConfig[] = req.body.filters;
    const data = dataset.uploadedData as any[];
    const filteredData = AggregationEngine.filter(data, filters);
    
    res.json({ data: filteredData, count: filteredData.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Apply calculated fields to dataset
router.post('/api/datasets/:id/calculated-fields', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataset = await storage.getDataset(req.params.id, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const fields: CalculatedField[] = req.body.fields;
    const data = dataset.uploadedData as any[];
    const processedData = CalculatedFieldsEngine.applyCalculatedFields(data, fields);
    
    res.json({ data: processedData });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Validate calculated field formula
router.post('/api/datasets/:id/validate-formula', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataset = await storage.getDataset(req.params.id, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const { formula } = req.body;
    const data = dataset.uploadedData as any[];
    const sampleRow = data[0] || {};
    
    const validation = CalculatedFieldsEngine.validateFormula(formula, sampleRow);
    res.json(validation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get processed data with aggregation, filtering, and calculated fields
router.post('/api/datasets/:id/process', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataset = await storage.getDataset(req.params.id, customerId);
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    let data = dataset.uploadedData as any[];
    
    // Apply filters if provided
    if (req.body.filters && req.body.filters.length > 0) {
      data = AggregationEngine.filter(data, req.body.filters);
    }
    
    // Apply calculated fields if provided
    if (req.body.calculatedFields && req.body.calculatedFields.length > 0) {
      data = CalculatedFieldsEngine.applyCalculatedFields(data, req.body.calculatedFields);
    }
    
    // Apply aggregation if provided
    let result;
    if (req.body.aggregation) {
      result = AggregationEngine.aggregate(data, req.body.aggregation);
    } else {
      result = data;
    }
    
    res.json({ data: result, count: Array.isArray(result) ? result.length : 1 });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

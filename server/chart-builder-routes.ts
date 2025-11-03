
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

// Process chart data endpoint
router.post('/process-data', async (req, res) => {
  try {
    const { datasetId, xAxis, yAxis } = req.body;
    
    if (!datasetId || !xAxis?.field || !yAxis?.field) {
      return res.status(400).json({ 
        error: 'Missing required fields: datasetId, xAxis, yAxis' 
      });
    }
    
    const dataset = await storage.getDataset(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    const data = dataset.uploadedData as any[];
    
    res.json({ 
      data,
      summary: {
        totalRows: data.length,
        xField: xAxis.field,
        yField: yAxis.field
      }
    });
  } catch (error) {
    console.error('Chart data processing error:', error);
    res.status(500).json({ error: 'Failed to process chart data' });
  }
});

// AI Chart Suggestion Endpoint
router.post('/api/ai/chart-suggest', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { datasetId, datasetName, datasetColumns, userPrompt } = req.body;

    if (!datasetId || !userPrompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: datasetId and userPrompt' 
      });
    }

    const dataset = await storage.getDataset(datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Import the AI service to generate chart suggestions
    const { AIService } = await import('./lib/ai-service');
    
    // Generate sample data context
    const sampleData = (dataset.uploadedData as any[]).slice(0, 20);
    const dataContext = JSON.stringify({
      datasetName,
      columns: datasetColumns,
      sampleData,
      userPrompt
    });

    // Generate chart configuration suggestion
    const suggestion = await AIService.generateInsight(
      customerId,
      dataContext,
      `Based on the user request "${userPrompt}", suggest a chart configuration. Return a JSON object with: { "type": chart type, "xAxis": { "field": field name }, "yAxis": { "field": field name }, "title": chart title, "description": explanation of why this chart is appropriate }`
    );

    // Parse the JSON response from AI
    try {
      // Try to extract JSON from the AI response
      const jsonStart = suggestion.indexOf('{');
      const jsonEnd = suggestion.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = suggestion.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonString);
        
        // Create a chart configuration from the suggestion
        const chartConfig = {
          datasetId,
          type: parsed.type || 'line',
          xAxis: parsed.xAxis || { field: datasetColumns[0] },
          yAxis: parsed.yAxis || { field: datasetColumns[1] },
          title: parsed.title || 'AI Suggested Chart',
          description: parsed.description,
          legend: { show: true, position: 'top' },
          tooltip: { show: true },
          showDataLabels: false,
          stacked: false,
          smooth: true,
          colorScheme: 'default',
          series: [{ field: parsed.yAxis?.field || datasetColumns[1], type: parsed.type || 'line' }]
        };
        
        res.json({ config: chartConfig, message: parsed.description });
      } else {
        res.json({ 
          config: null, 
          message: "Could not parse chart suggestion from AI response. Please try rephrasing your request." 
        });
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      res.json({ 
        config: null, 
        message: "Could not parse chart suggestion from AI response. Please try rephrasing your request." 
      });
    }
  } catch (error: any) {
    console.error('AI chart suggestion error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate chart suggestion' });
  }
});

// AI Chart Explanation Endpoint
router.post('/api/ai/chart-explain', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { datasetId, datasetName, datasetColumns, chartConfig } = req.body;

    if (!datasetId || !chartConfig) {
      return res.status(400).json({ 
        error: 'Missing required fields: datasetId and chartConfig' 
      });
    }

    const dataset = await storage.getDataset(datasetId, customerId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Import the AI service to explain the chart
    const { AIService } = await import('./lib/ai-service');

    // Generate data context for explanation
    const sampleData = (dataset.uploadedData as any[]).slice(0, 10);
    const dataContext = JSON.stringify({
      datasetName,
      columns: datasetColumns,
      sampleData,
      chartConfig
    });

    // Get explanation of the chart
    const explanation = await AIService.generateInsight(
      customerId,
      dataContext,
      `Explain the chart configuration provided and what it shows about the data. Focus on the chart type, axes, trends, and insights.`
    );

    res.json({ explanation });
  } catch (error: any) {
    console.error('AI chart explanation error:', error);
    res.status(500).json({ error: error.message || 'Failed to explain chart' });
  }
});

export default router;

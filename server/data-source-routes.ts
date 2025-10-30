
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { requireRole } from './middleware/rbac';
import { storage } from './storage';
import { RestApiConnector } from './lib/data-connectors/rest-api';

const router = Router();

// Create data source
router.post('/api/data-sources', authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    
    const dataSource = await storage.createDataSource({
      ...req.body,
      customerId,
    });
    
    res.json(dataSource);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all data sources
router.get('/api/data-sources', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const sources = await storage.getDataSources(customerId);
    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test connection
router.post('/api/data-sources/test-connection', authenticateUser, async (req, res) => {
  try {
    const { type, connectionConfig } = req.body;
    
    let connector;
    if (type === 'rest_api') {
      connector = new RestApiConnector(connectionConfig, req.user!.customerId);
    } else if (type === 'graphql') {
      const { GraphQLConnector } = await import('./lib/data-connectors/graphql');
      connector = new GraphQLConnector(connectionConfig, req.user!.customerId);
    } else if (type === 'database') {
      const { DatabaseConnector } = await import('./lib/data-connectors/database');
      connector = new DatabaseConnector(connectionConfig, req.user!.customerId);
    } else {
      throw new Error('Unsupported connector type');
    }
    
    const isValid = await connector.validateConnection();
    res.json({ valid: isValid });
  } catch (error: any) {
    res.status(400).json({ valid: false, error: error.message });
  }
});

// Trigger manual sync
router.post('/api/data-sources/:id/sync', authenticateUser, requireRole(['customer_admin', 'analyst', 'super_admin']), async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const dataSource = await storage.getDataSource(req.params.id, customerId);
    
    if (!dataSource) {
      return res.status(404).json({ error: 'Data source not found' });
    }
    
    const syncJob = await storage.createSyncJob(dataSource.id);
    
    performDataSync(dataSource, syncJob.id).catch(console.error);
    
    res.json({ jobId: syncJob.id, status: 'started' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

async function performDataSync(dataSource: any, syncJobId: string) {
  try {
    await storage.updateSyncJob(syncJobId, {
      status: 'running',
      startedAt: new Date(),
    });
    
    let connector;
    if (dataSource.type === 'rest_api') {
      connector = new RestApiConnector(dataSource.connectionConfig, dataSource.customerId);
    } else if (dataSource.type === 'graphql') {
      const { GraphQLConnector } = await import('./lib/data-connectors/graphql');
      connector = new GraphQLConnector(dataSource.connectionConfig, dataSource.customerId);
    } else if (dataSource.type === 'database') {
      const { DatabaseConnector } = await import('./lib/data-connectors/database');
      connector = new DatabaseConnector(dataSource.connectionConfig, dataSource.customerId);
    } else {
      throw new Error('Unsupported connector type');
    }
    
    const result = await connector.fetchData();
    
    const dataset = await storage.createDataset({
      name: `${dataSource.name} - ${new Date().toISOString()}`,
      type: 'api',
      uploadedData: result.data,
      schemaInfo: detectSchema(result.data),
      rowCount: result.data.length,
    }, dataSource.customerId);
    
    await storage.updateSyncJob(syncJobId, {
      status: 'completed',
      completedAt: new Date(),
      recordsProcessed: result.data.length,
      recordsInserted: result.data.length,
    });
    
    await storage.updateDataSource(dataSource.id, {
      lastSyncAt: new Date(),
      lastSyncStatus: 'success',
    });
    
  } catch (error: any) {
    await storage.updateSyncJob(syncJobId, {
      status: 'failed',
      completedAt: new Date(),
      errorMessage: error.message,
    });
  }
}

function detectSchema(data: any[]) {
  if (data.length === 0) return { columns: [] };
  
  const sample = data[0];
  const columns = Object.keys(sample).map(key => ({
    name: key,
    type: typeof sample[key],
  }));
  
  return { columns };
}

export default router;

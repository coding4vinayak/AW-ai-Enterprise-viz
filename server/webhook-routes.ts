
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import crypto from 'crypto';

const router = Router();

// Create webhook endpoint
router.post('/api/webhooks', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { name, datasetId, secret } = req.body;
    
    const webhookId = crypto.randomBytes(16).toString('hex');
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
    
    const webhook = await storage.createWebhook({
      id: webhookId,
      customerId,
      datasetId,
      name,
      secret: webhookSecret,
      isActive: true,
    });
    
    res.json({
      ...webhook,
      url: `${req.protocol}://${req.get('host')}/api/webhooks/receive/${webhookId}`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Receive webhook data
router.post('/api/webhooks/receive/:id', async (req, res) => {
  try {
    const webhook = await storage.getWebhook(req.params.id);
    
    if (!webhook || !webhook.isActive) {
      return res.status(404).json({ error: 'Webhook not found or inactive' });
    }
    
    // Verify signature if present
    const signature = req.headers['x-webhook-signature'] as string;
    if (webhook.secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(req.body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    // Append data to dataset
    const dataset = await storage.getDataset(webhook.datasetId, webhook.customerId);
    if (dataset) {
      const currentData = dataset.uploadedData as any[] || [];
      const newData = Array.isArray(req.body) ? req.body : [req.body];
      
      await storage.updateDataset(dataset.id, {
        uploadedData: [...currentData, ...newData],
        rowCount: currentData.length + newData.length,
      }, webhook.customerId);
    }
    
    await storage.logWebhookEvent({
      webhookId: webhook.id,
      payload: req.body,
      headers: req.headers,
      receivedAt: new Date(),
    });
    
    res.json({ success: true, recordsReceived: Array.isArray(req.body) ? req.body.length : 1 });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

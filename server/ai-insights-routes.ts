
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { getAIProvider } from './lib/ai-providers/factory';
import { generateInsight } from './lib/openai';

const router = Router();

router.post('/api/ai/generate-chart-insight', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { chartType, chartData } = req.body;

    const provider = await getAIProvider(customerId);
    if (!provider) {
      return res.status(400).json({ error: 'AI provider not configured' });
    }

    const dataContext = `Chart Type: ${chartType}\nChart Data:\n${JSON.stringify(chartData, null, 2)}`;

    const insight = await generateInsight(customerId, dataContext);

    res.json({ insight });
  } catch (error) {
    console.error('Generate chart insight error:', error);
    res.status(500).json({ error: 'Failed to generate chart insight' });
  }
});

export default router;

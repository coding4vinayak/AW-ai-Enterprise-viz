
import { Router } from 'express';
import { authenticateUser } from './middleware/auth';
import { storage } from './storage';
import nodemailer from 'nodemailer';
import cron from 'node-cron';

const router = Router();

// Configure email transporter (use environment variables)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Create email report schedule
router.post('/api/email-reports', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const { dashboardId, name, recipients, schedule, format } = req.body;
    
    // Validate cron expression
    if (!cron.validate(schedule)) {
      return res.status(400).json({ error: 'Invalid cron schedule' });
    }
    
    const report = await storage.createEmailReport({
      customerId,
      dashboardId,
      name,
      recipients,
      schedule,
      format,
      createdBy: req.user!.id,
      nextRunAt: getNextRunTime(schedule),
    });
    
    // Schedule the cron job
    scheduleCronJob(report);
    
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all email reports
router.get('/api/email-reports', authenticateUser, async (req, res) => {
  try {
    const customerId = req.user!.customerId;
    const reports = await storage.getEmailReports(customerId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send test email
router.post('/api/email-reports/:id/test', authenticateUser, async (req, res) => {
  try {
    const report = await storage.getEmailReport(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    await sendDashboardReport(report);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
function getNextRunTime(cronSchedule: string): Date {
  const cronParts = cronSchedule.split(' ');
  // Simple implementation - in production use a proper cron parser
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function scheduleCronJob(report: any) {
  cron.schedule(report.schedule, async () => {
    await sendDashboardReport(report);
  });
}

async function sendDashboardReport(report: any) {
  const dashboard = await storage.getDashboardById(report.dashboardId);
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: report.recipients.join(','),
    subject: `Dashboard Report: ${report.name}`,
    html: `<h2>${dashboard.name}</h2><p>Please find your scheduled dashboard report attached.</p>`,
    attachments: [{
      filename: `${report.name}.${report.format}`,
      content: 'Dashboard export placeholder', // Use export-utils to generate actual file
    }],
  };
  
  await transporter.sendMail(mailOptions);
  await storage.updateEmailReport(report.id, { lastSentAt: new Date() });
}

export default router;

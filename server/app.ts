import express from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { storedLeads, seedInitialAdminData, generateLeadId, type LeadRecord } from './adminService.ts';
import { adminRouter } from './adminRoutes.ts';

dotenv.config();

const TARGET_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL || 'shiftify.leads@gmail.com';

// Helper to send email notification to shiftify.leads@gmail.com via SMTP if configured
export async function sendDirectEmailNotification(lead: LeadRecord): Promise<{ sent: boolean; error?: string }> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const fromAddress = process.env.SMTP_FROM || `"Shiftify Leads Desk" <${TARGET_NOTIFICATION_EMAIL}>`;

  if (!smtpUser || !smtpPass) {
    console.log(`[Lead Email Desk] Lead ${lead.leadId} ready for email to ${TARGET_NOTIFICATION_EMAIL}. Forwarding through Google Apps Script.`);
    return { sent: false, error: 'SMTP credentials not configured in environment (handled by Google Apps Script)' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #ea580c; margin: 0; font-size: 22px; font-weight: 800;">🚚 Shiftify Packers & Movers</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">New Relocation Lead Received</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px;">
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Lead ID</td><td style="padding: 12px; border: 1px solid #e2e8f0; color: #ea580c; font-weight: bold;">${lead.leadId}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Customer Name</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.name}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Phone Number</td><td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="tel:${lead.phone}" style="color: #2563eb; font-weight: bold; text-decoration: none;">${lead.phone}</a> &nbsp;|&nbsp; <a href="https://wa.me/91${lead.phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">Chat on WhatsApp</a></td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Type</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.movingType}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Pickup Location</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.fromLocation}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Drop Location</td><td style="padding: 12px; border: 1px solid #e2e8f0;">${lead.toLocation}</td></tr>
          <tr style="background-color: #f8fafc;"><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Moving Date</td><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">${lead.movingDate}</td></tr>
          <tr><td style="padding: 12px; border: 1px solid #e2e8f0; font-weight: bold;">Received At</td><td style="padding: 12px; border: 1px solid #e2e8f0; color: #64748b;">${lead.createdAt}</td></tr>
        </table>
        <div style="text-align: center; margin-top: 24px;">
          <a href="tel:${lead.phone}" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px;">Call Customer</a>
          <a href="https://wa.me/91${lead.phone}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">WhatsApp Customer</a>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: TARGET_NOTIFICATION_EMAIL,
      subject: `🚚 New Moving Lead [${lead.leadId}]: ${lead.name} (${lead.movingType})`,
      html: mailHtml,
    });

    console.log(`[Lead Email Desk] Successfully sent email for lead ${lead.leadId} to ${TARGET_NOTIFICATION_EMAIL}`);
    return { sent: true };
  } catch (err: any) {
    console.error(`[Lead Email Desk] Failed to send email via SMTP:`, err);
    return { sent: false, error: err.message };
  }
}

// Seed initial admin data
seedInitialAdminData();

export const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS helper headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Create an API router that handles all API requests
const apiRouter = express.Router();

// Mount Admin API routes on the router
apiRouter.use('/admin', adminRouter);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Shiftify Packers & Movers API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    googleAppsScriptConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_URL),
  });
});

// API Route: Submit Lead
apiRouter.post('/leads', async (req, res) => {
  try {
    const {
      name,
      phone,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
    } = req.body;

    // Backend field validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name is required and must be at least 2 characters',
      });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required',
      });
    }

    if (!fromLocation || fromLocation.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'From location is required',
      });
    }

    if (!toLocation || toLocation.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'To location is required',
      });
    }

    if (!movingDate) {
      return res.status(400).json({
        success: false,
        error: 'Moving date is required',
      });
    }

    const { email } = req.body;
    const cleanEmail = email && typeof email === 'string' && email.trim().length > 0 ? email.trim() : undefined;

    // Do NOT trust client for leadId, createdAt, status
    const leadId = generateLeadId();
    const createdAt = new Date().toISOString();
    const source = 'Website';
    const status = 'NEW';

    const leadObject: LeadRecord = {
      leadId,
      createdAt,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate,
      movingType: movingType || 'House Shifting',
      source,
      status,
    };

    // Store in memory for instant query & tracking
    storedLeads.set(leadId, leadObject);

    // Attempt direct email notification if SMTP is configured
    const emailResult = await sendDirectEmailNotification(leadObject);

    // If Google Apps Script URL is configured, forward lead to Google Sheet
    const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    let sheetForwarded = false;
    let sheetError: string | null = null;

    if (googleScriptUrl && googleScriptUrl.trim().startsWith('http')) {
      try {
        const response = await fetch(googleScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...leadObject,
            targetEmail: TARGET_NOTIFICATION_EMAIL,
          }),
        });
        if (response.ok) {
          sheetForwarded = true;
        } else {
          sheetError = `Google Sheet HTTP status: ${response.status}`;
        }
      } catch (err: any) {
        console.error('Error forwarding to Google Apps Script:', err);
        sheetError = err.message || 'Failed to connect to Google Apps Script';
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      lead: leadObject,
      leadId: leadObject.leadId,
      notificationEmail: TARGET_NOTIFICATION_EMAIL,
      emailNotificationSent: emailResult.sent,
      sheetForwarded,
      sheetError: sheetError || undefined,
    });
  } catch (error: any) {
    console.error('Lead submission server error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing moving quote enquiry. Please try again.',
    });
  }
});

// API Route: Track Lead Enquiry Status
apiRouter.get('/leads/track/:id', (req, res) => {
  const queryId = (req.params.id || '').toUpperCase().trim();
  const lead = storedLeads.get(queryId);

  if (lead) {
    return res.json({
      success: true,
      lead,
    });
  }

  return res.status(404).json({
    success: false,
    error: `Enquiry ${queryId} not found in current session. Please verify your ID or contact support.`,
  });
});

// API Route: List Recent Leads
apiRouter.get('/leads/recent', (req, res) => {
  const list = Array.from(storedLeads.values()).reverse().slice(0, 20);
  return res.json({
    success: true,
    count: list.length,
    googleAppsScriptConfigured: Boolean(process.env.GOOGLE_APPS_SCRIPT_URL),
    notificationEmail: TARGET_NOTIFICATION_EMAIL,
    leads: list,
  });
});

// Mount the apiRouter at '/api', '/api/index', and '/'
// This ensures that whether Vercel rewrites to '/api/leads', '/api/index/leads', or strips to '/leads', all succeed!
app.use('/api', apiRouter);
app.use('/api/index', apiRouter);
app.use('/', apiRouter);

// Helper to determine the application's base URL
export const getBaseUrl = (req: express.Request) => {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  return `${proto}://${req.headers.host}`;
};

// Dynamic robots.txt
const handleRobotsTxt = (req: express.Request, res: express.Response) => {
  const baseUrl = getBaseUrl(req);
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robotsTxt);
};

app.get('/robots.txt', handleRobotsTxt);
app.get('/api/robots.txt', handleRobotsTxt);

// Dynamic sitemap.xml
const handleSitemapXml = (req: express.Request, res: express.Response) => {
  const baseUrl = getBaseUrl(req);
  const now = new Date().toISOString().split('T')[0];

  const pages = [
    '',
    '/services/house-shifting',
    '/services/office-shifting',
    '/services/vehicle-transport',
    '/services/warehouse-storage',
    '/services/local-shifting',
    '/services/intercity-shifting',
    '/services/corporate-relocation',
    '/locations',
    '/routes',
    '/about',
    '/contact',
    '/quote',
    '/track',
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : page.startsWith('/services/') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(sitemapXml);
};

app.get('/sitemap.xml', handleSitemapXml);
app.get('/api/sitemap.xml', handleSitemapXml);

export default app;

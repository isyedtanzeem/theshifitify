import { Router } from 'express';
import {
  storedLeads,
  storedFollowups,
  storedQuotations,
  storedInvoices,
  generateQuotationNumber,
  generateInvoiceNumber,
  calculateFinancialTotals,
  calculateInvoiceFinancialTotals,
  createAdminToken,
  requireAdminAuth,
  forwardToGoogleAppsScript,
  getTodayDateString,
  generateLeadId,
  type LeadRecord,
  type FollowupRecord,
  type LeadStatus,
  type QuotationRecord,
  type QuotationStatus,
  type InvoiceRecord,
  type InvoiceStatus,
  type PaymentStatus,
} from './adminService.ts';

export const adminRouter = Router();

const VALID_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUOTATION_SENT',
  'FOLLOW_UP',
  'CONFIRMED',
  'SCHEDULED',
  'COMPLETED',
  'LOST',
  'CANCELLED',
];

const VALID_QUOTATION_STATUSES: QuotationStatus[] = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
];

const VALID_INVOICE_STATUSES: InvoiceStatus[] = [
  'DRAFT',
  'ISSUED',
  'PARTIALLY_PAID',
  'PAID',
  'CANCELLED',
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
];

const VALID_MOVING_TYPES = [
  'House Shifting',
  'Office Shifting',
  'Vehicle Transport',
  'Warehouse / Storage',
  'Local Shifting',
  'Intercity Shifting',
  'Corporate Relocation',
  'Other',
];

const VALID_LEAD_SOURCES = [
  'Website',
  'Phone',
  'WhatsApp',
  'Walk-in',
  'Referral',
  'Facebook',
  'Instagram',
  'Google',
  'Other',
];

// ----------------------------------------------------
// 1. ADMIN LOGIN & AUTH CHECK
// ----------------------------------------------------
adminRouter.post('/login', (req, res) => {
  try {
    const { username, email, identifier, password } = req.body || {};
    const inputIdentifier = (identifier || username || email || '').trim().toLowerCase();
    const inputPassword = (password || '').trim();

    const expectedEmail = (process.env.ADMIN_EMAIL || 'admin@shiftify.in').toLowerCase();
    const expectedUsername = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || 'shiftify2026!';

    if (!inputIdentifier || !inputPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please enter both username/email and password',
      });
    }

    const matchesUser = inputIdentifier === expectedEmail || inputIdentifier === expectedUsername;
    const matchesPass = inputPassword === expectedPassword;

    if (!matchesUser || !matchesPass) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin credentials. Please verify username and password.',
      });
    }

    const token = createAdminToken(expectedEmail);

    return res.json({
      success: true,
      token,
      user: {
        email: expectedEmail,
        name: 'Shiftify Operations Admin',
        role: 'Administrator',
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Authentication failed due to an unexpected error.',
    });
  }
});

adminRouter.get('/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      email: (req as any).adminEmail || process.env.ADMIN_EMAIL || 'admin@shiftify.in',
      name: 'Shiftify Operations Admin',
      role: 'Administrator',
    },
  });
});

// ----------------------------------------------------
// 2. DASHBOARD STATS
// ----------------------------------------------------
adminRouter.get('/stats', requireAdminAuth, (req, res) => {
  try {
    const allLeads = Array.from(storedLeads.values());
    const allFollowups = Array.from(storedFollowups.values());
    const today = getTodayDateString();
    const currentMonth = today.slice(0, 7); // YYYY-MM

    // Status counts
    const statusCounts: Record<LeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      QUOTATION_SENT: 0,
      FOLLOW_UP: 0,
      CONFIRMED: 0,
      SCHEDULED: 0,
      COMPLETED: 0,
      LOST: 0,
      CANCELLED: 0,
    };

    let leadsToday = 0;
    let leadsThisMonth = 0;

    allLeads.forEach((lead) => {
      if (statusCounts[lead.status] !== undefined) {
        statusCounts[lead.status]++;
      }
      const leadDate = (lead.createdAt || '').slice(0, 10);
      if (leadDate === today) {
        leadsToday++;
      }
      if (leadDate.startsWith(currentMonth)) {
        leadsThisMonth++;
      }
    });

    // Recent leads (top 5 newest)
    const recentLeads = [...allLeads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Today's pending followups
    const todayFollowups = allFollowups
      .filter((f) => f.status === 'PENDING' && f.followupDate <= today)
      .sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));

    // Quotations & Invoices metrics
    const totalQuotations = storedQuotations.size;
    const totalInvoices = storedInvoices.size;
    let totalRevenue = 0;
    storedInvoices.forEach((inv) => {
      if (inv.status !== 'CANCELLED') {
        totalRevenue += inv.amountPaid || 0;
      }
    });

    res.json({
      success: true,
      stats: {
        totalLeads: allLeads.length,
        statusCounts,
        leadsToday,
        leadsThisMonth,
        recentLeads,
        todayFollowups,
        totalQuotations,
        totalInvoices,
        totalRevenue,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to calculate dashboard statistics' });
  }
});

// ----------------------------------------------------
// 3. LEADS LIST WITH ADVANCED FILTERING & SORTING
// ----------------------------------------------------
adminRouter.get('/leads', requireAdminAuth, (req, res) => {
  try {
    const { search, status, movingType, source, leadSource, movingDate, dateFilter, sort } = req.query as {
      search?: string;
      status?: string;
      movingType?: string;
      source?: string;
      leadSource?: string;
      movingDate?: string;
      dateFilter?: string;
      sort?: string;
    };

    let leads = Array.from(storedLeads.values());
    const today = getTodayDateString();
    const now = new Date();

    // 1. Multi-field search (Lead ID, Name, Phone, From location, To location, Email)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      leads = leads.filter(
        (l) =>
          l.leadId.toLowerCase().includes(q) ||
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.fromLocation.toLowerCase().includes(q) ||
          l.toLocation.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }

    // 2. Status filter
    if (status && status !== 'ALL' && VALID_STATUSES.includes(status as LeadStatus)) {
      leads = leads.filter((l) => l.status === status);
    }

    // 3. Moving type filter
    if (movingType && movingType !== 'ALL') {
      leads = leads.filter((l) => l.movingType.toLowerCase() === movingType.toLowerCase());
    }

    // 4. Lead source filter
    const activeSource = source || leadSource;
    if (activeSource && activeSource !== 'ALL') {
      leads = leads.filter((l) => l.source.toLowerCase() === activeSource.toLowerCase());
    }

    // 5. Moving date filter
    if (movingDate && movingDate.trim()) {
      leads = leads.filter((l) => (l.movingDate || '').startsWith(movingDate.trim()));
    }

    // 6. Created Date filter
    if (dateFilter && dateFilter !== 'all') {
      leads = leads.filter((l) => {
        const leadDate = (l.createdAt || '').slice(0, 10);
        if (dateFilter === 'today') {
          return leadDate === today;
        }
        if (dateFilter === 'this_week') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return leadDate >= sevenDaysAgo;
        }
        if (dateFilter === 'this_month') {
          return leadDate.startsWith(today.slice(0, 7));
        }
        return true;
      });
    }

    // 7. Sorting
    leads.sort((a, b) => {
      if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sort === 'moving_date' || sort === 'moving_date_asc') {
        return (a.movingDate || '').localeCompare(b.movingDate || '');
      }
      if (sort === 'moving_date_desc') {
        return (b.movingDate || '').localeCompare(a.movingDate || '');
      }
      // default newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve leads' });
  }
});

// ----------------------------------------------------
// 3b. MANUAL LEAD CREATION (AUTHENTICATED ADMIN ONLY)
// ----------------------------------------------------
adminRouter.post('/leads', requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      source,
      notes,
    } = req.body || {};

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Customer Name is required (minimum 2 characters).',
      });
    }

    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required.',
      });
    }

    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.',
        });
      }
      cleanEmail = trimmedEmail;
    }

    if (!fromLocation || typeof fromLocation !== 'string' || fromLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'From Location (pickup address) is required.',
      });
    }

    if (!toLocation || typeof toLocation !== 'string' || toLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'To Location (drop address) is required.',
      });
    }

    if (!movingDate || typeof movingDate !== 'string' || movingDate.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Moving Date is required.',
      });
    }

    const cleanMovingType = VALID_MOVING_TYPES.includes(movingType) ? movingType : 'House Shifting';
    const cleanSource = VALID_LEAD_SOURCES.includes(source) ? source : 'Phone';

    // 2. Server-Side Values Generation - DO NOT TRUST CLIENT
    const leadId = generateLeadId();
    const createdAt = new Date().toISOString();
    const status: LeadStatus = 'NEW';

    const newLead: LeadRecord = {
      leadId,
      createdAt,
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate: movingDate.trim(),
      movingType: cleanMovingType,
      source: cleanSource,
      status,
      notes: notes && typeof notes === 'string' && notes.trim() ? notes.trim() : undefined,
    };

    // 3. Save to In-Memory DB
    storedLeads.set(leadId, newLead);

    // 4. Save to Google Sheets
    forwardToGoogleAppsScript({
      action: 'createLead',
      ...newLead,
    });

    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: newLead,
    });
  } catch (err: any) {
    console.error('Failed to create manual lead:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create lead due to internal server error.',
    });
  }
});

// ----------------------------------------------------
// 3c. EDIT EXISTING LEAD (AUTHENTICATED ADMIN ONLY)
// ----------------------------------------------------
adminRouter.put('/leads/:leadId', requireAdminAuth, async (req, res) => {
  try {
    const queryId = (req.params.leadId || '').toUpperCase().trim();
    const existing = storedLeads.get(queryId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Lead ${queryId} was not found.`,
      });
    }

    const {
      name,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      source,
      notes,
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Customer Name must be at least 2 characters.',
      });
    }

    const cleanPhone = (phone || '').toString().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'A valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 is required.',
      });
    }

    let cleanEmail: string | undefined = undefined;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address.',
        });
      }
      cleanEmail = trimmedEmail;
    }

    if (!fromLocation || typeof fromLocation !== 'string' || fromLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'From Location is required.',
      });
    }

    if (!toLocation || typeof toLocation !== 'string' || toLocation.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'To Location is required.',
      });
    }

    if (!movingDate || typeof movingDate !== 'string' || movingDate.trim().length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Moving Date is required.',
      });
    }

    const cleanMovingType = VALID_MOVING_TYPES.includes(movingType) ? movingType : existing.movingType;
    const cleanSource = VALID_LEAD_SOURCES.includes(source) ? source : existing.source;

    // DO NOT allow editing of Lead ID or Created At - preserve strictly from existing
    existing.name = name.trim();
    existing.phone = cleanPhone;
    existing.email = cleanEmail;
    existing.fromLocation = fromLocation.trim();
    existing.toLocation = toLocation.trim();
    existing.movingDate = movingDate.trim();
    existing.movingType = cleanMovingType;
    existing.source = cleanSource;
    if (notes !== undefined) {
      existing.notes = typeof notes === 'string' && notes.trim() ? notes.trim() : undefined;
    }

    storedLeads.set(queryId, existing);

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'updateLead',
      ...existing,
    });

    return res.json({
      success: true,
      message: 'Lead updated successfully',
      lead: existing,
    });
  } catch (err: any) {
    console.error('Failed to update lead:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update lead due to internal server error',
    });
  }
});

// ----------------------------------------------------
// 4. SINGLE LEAD DETAILS
// ----------------------------------------------------
adminRouter.get('/leads/:leadId', requireAdminAuth, (req, res) => {
  const queryId = (req.params.leadId || '').toUpperCase().trim();
  const lead = storedLeads.get(queryId);

  if (!lead) {
    return res.status(404).json({
      success: false,
      error: `Lead ${queryId} was not found in the database.`,
    });
  }

  // Fetch follow-ups associated with this lead
  const leadFollowups = Array.from(storedFollowups.values())
    .filter((f) => f.leadId.toUpperCase() === queryId)
    .sort((a, b) => (b.followupDate + b.followupTime).localeCompare(a.followupDate + a.followupTime));

  res.json({
    success: true,
    lead,
    followups: leadFollowups,
  });
});

// ----------------------------------------------------
// 5. UPDATE LEAD STATUS
// ----------------------------------------------------
adminRouter.patch('/leads/:leadId/status', requireAdminAuth, async (req, res) => {
  try {
    const queryId = (req.params.leadId || '').toUpperCase().trim();
    const { status, notes } = req.body || {};

    if (!status || !VALID_STATUSES.includes(status as LeadStatus)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const lead = storedLeads.get(queryId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: `Lead ${queryId} was not found.`,
      });
    }

    lead.status = status as LeadStatus;
    if (notes) {
      lead.notes = (lead.notes ? lead.notes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${notes}`;
    }
    storedLeads.set(queryId, lead);

    // Forward to Google Sheet async
    forwardToGoogleAppsScript({
      action: 'updateLeadStatus',
      leadId: queryId,
      status,
    });

    res.json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update lead status' });
  }
});

// ----------------------------------------------------
// 6. FOLLOW-UPS MANAGEMENT
// ----------------------------------------------------
adminRouter.get('/followups', requireAdminAuth, (req, res) => {
  try {
    const all = Array.from(storedFollowups.values());
    const today = getTodayDateString();

    const todayFollowups = all
      .filter((f) => f.status === 'PENDING' && f.followupDate <= today)
      .sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));

    const upcomingFollowups = all
      .filter((f) => f.status === 'PENDING' && f.followupDate > today)
      .sort((a, b) => (a.followupDate + a.followupTime).localeCompare(b.followupDate + b.followupTime));

    const completedFollowups = all
      .filter((f) => f.status === 'COMPLETED')
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

    res.json({
      success: true,
      today: todayFollowups,
      upcoming: upcomingFollowups,
      completed: completedFollowups,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve followups' });
  }
});

// ----------------------------------------------------
// 7. CREATE FOLLOW-UP
// ----------------------------------------------------
adminRouter.post('/followups', requireAdminAuth, async (req, res) => {
  try {
    const { leadId, followupDate, followupTime, notes } = req.body || {};

    if (!leadId || !followupDate || !followupTime) {
      return res.status(400).json({
        success: false,
        error: 'Lead ID, follow-up date, and follow-up time are required.',
      });
    }

    const lead = storedLeads.get(leadId.toUpperCase().trim());
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: `Associated lead ${leadId} not found.`,
      });
    }

    const now = new Date();
    const dateStr = now.getFullYear().toString().slice(-2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    const followupId = `FLP${dateStr}${Math.floor(100 + Math.random() * 900)}`;

    const newFollowup: FollowupRecord = {
      followupId,
      leadId: lead.leadId,
      createdAt: now.toISOString(),
      customerName: lead.name,
      phone: lead.phone,
      followupDate,
      followupTime,
      status: 'PENDING',
      notes: notes || 'Scheduled follow-up call.',
    };

    storedFollowups.set(followupId, newFollowup);

    // Update lead next followup field
    lead.nextFollowup = `${followupDate} ${followupTime}`;
    storedLeads.set(lead.leadId, lead);

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'createFollowup',
      ...newFollowup,
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      followup: newFollowup,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to schedule follow-up' });
  }
});

// ----------------------------------------------------
// 8. COMPLETE FOLLOW-UP
// ----------------------------------------------------
adminRouter.patch('/followups/:id/complete', requireAdminAuth, async (req, res) => {
  try {
    const followupId = req.params.id;
    const followup = storedFollowups.get(followupId);

    if (!followup) {
      return res.status(404).json({
        success: false,
        error: `Follow-up ${followupId} not found.`,
      });
    }

    followup.status = 'COMPLETED';
    followup.completedAt = new Date().toISOString();
    storedFollowups.set(followupId, followup);

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'completeFollowup',
      followupId,
      completedAt: followup.completedAt,
    });

    res.json({
      success: true,
      message: 'Follow-up marked as completed',
      followup,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to complete follow-up' });
  }
});

// ----------------------------------------------------
// 7. QUOTATIONS API
// ----------------------------------------------------

// List Quotations with filters
adminRouter.get('/quotations', requireAdminAuth, (req, res) => {
  try {
    const { search, status, sort, leadId } = req.query;
    let list = Array.from(storedQuotations.values());

    // Filter by lead ID
    if (leadId && typeof leadId === 'string') {
      list = list.filter((q) => q.leadId === leadId);
    }

    // Filter by status
    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((q) => q.status === status);
    }

    // Filter by search (quotation ID, customer name, phone, locations)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.quotationId.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.phone.includes(q) ||
          item.fromLocation.toLowerCase().includes(q) ||
          item.toLocation.toLowerCase().includes(q) ||
          (item.leadId && item.leadId.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Default: newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: list.length,
      quotations: list,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch quotations' });
  }
});

// Get Single Quotation by ID
adminRouter.get('/quotations/:id', requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const quotation = storedQuotations.get(quotationId);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} was not found.`,
      });
    }

    res.json({
      success: true,
      quotation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch quotation details' });
  }
});

// Create Quotation (Server-side calculation & validation mandatory)
adminRouter.post('/quotations', requireAdminAuth, (req, res) => {
  try {
    const body = req.body || {};
    const {
      leadId,
      quotationDate,
      validUntil,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      status,
      notes,
      terms,
    } = body;

    // Required Field Validations
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit phone number is required.' });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: 'From location is required.' });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: 'To location is required.' });
    }
    if (!movingDate || !String(movingDate).trim()) {
      return res.status(400).json({ success: false, error: 'Moving date is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one charge item is required in the quotation.' });
    }

    // Recalculate all amounts server-side (never trust browser totals)
    const financialTotals = calculateFinancialTotals(items, discount, gstPercentage);

    // Generate unique Quotation Number (e.g. Q-2026-0001)
    const quotationId = generateQuotationNumber();
    const createdAt = new Date().toISOString();
    const qDate = quotationDate || getTodayDateString();
    // Default 7 days validity if not provided
    const vUntil = validUntil || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const finalStatus: QuotationStatus = VALID_QUOTATION_STATUSES.includes(status) ? status : 'DRAFT';

    const quotationRecord: QuotationRecord = {
      quotationId,
      leadId: leadId ? String(leadId).trim() : undefined,
      createdAt,
      quotationDate: qDate,
      validUntil: vUntil,
      customerName: String(customerName).trim(),
      phone: cleanPhone,
      email: email && String(email).trim().length > 0 ? String(email).trim() : undefined,
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      movingDate: String(movingDate).trim(),
      movingType: String(movingType || 'House Shifting').trim(),
      items: financialTotals.items,
      subtotal: financialTotals.subtotal,
      discount: financialTotals.discount,
      taxableAmount: financialTotals.taxableAmount,
      gstPercentage: financialTotals.gstPercentage,
      gstAmount: financialTotals.gstAmount,
      grandTotal: financialTotals.grandTotal,
      status: finalStatus,
      notes: notes && String(notes).trim().length > 0 ? String(notes).trim() : undefined,
      terms: terms && String(terms).trim().length > 0 ? String(terms).trim() : undefined,
    };

    storedQuotations.set(quotationId, quotationRecord);

    // Link Quotation ID in the associated lead if leadId is valid
    if (quotationRecord.leadId && storedLeads.has(quotationRecord.leadId)) {
      const lead = storedLeads.get(quotationRecord.leadId)!;
      lead.quotationId = quotationId;
      if (finalStatus === 'SENT' && lead.status === 'NEW') {
        lead.status = 'QUOTATION_SENT';
      }
      storedLeads.set(quotationRecord.leadId, lead);
    }

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'createQuotation',
      ...quotationRecord,
      items: JSON.stringify(quotationRecord.items),
    });

    res.status(201).json({
      success: true,
      message: `Quotation ${quotationId} generated successfully.`,
      quotation: quotationRecord,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create quotation: ' + err.message });
  }
});

// Update Quotation Details (Recalculates server-side)
adminRouter.put('/quotations/:id', requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const existing = storedQuotations.get(quotationId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} does not exist.`,
      });
    }

    const body = req.body || {};
    const {
      quotationDate,
      validUntil,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      status,
      notes,
      terms,
    } = body;

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit phone number is required.' });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: 'From location is required.' });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: 'To location is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one charge item is required.' });
    }

    // Recalculate financial totals
    const financialTotals = calculateFinancialTotals(items, discount, gstPercentage);
    const finalStatus: QuotationStatus = VALID_QUOTATION_STATUSES.includes(status) ? status : existing.status;

    existing.quotationDate = quotationDate || existing.quotationDate;
    existing.validUntil = validUntil || existing.validUntil;
    existing.customerName = String(customerName).trim();
    existing.phone = cleanPhone;
    existing.email = email && String(email).trim().length > 0 ? String(email).trim() : undefined;
    existing.fromLocation = String(fromLocation).trim();
    existing.toLocation = String(toLocation).trim();
    existing.movingDate = String(movingDate || existing.movingDate).trim();
    existing.movingType = String(movingType || existing.movingType).trim();
    existing.items = financialTotals.items;
    existing.subtotal = financialTotals.subtotal;
    existing.discount = financialTotals.discount;
    existing.taxableAmount = financialTotals.taxableAmount;
    existing.gstPercentage = financialTotals.gstPercentage;
    existing.gstAmount = financialTotals.gstAmount;
    existing.grandTotal = financialTotals.grandTotal;
    existing.status = finalStatus;
    existing.notes = notes && String(notes).trim().length > 0 ? String(notes).trim() : undefined;
    existing.terms = terms && String(terms).trim().length > 0 ? String(terms).trim() : undefined;

    storedQuotations.set(quotationId, existing);

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'updateQuotation',
      ...existing,
      items: JSON.stringify(existing.items),
    });

    res.json({
      success: true,
      message: `Quotation ${quotationId} updated successfully.`,
      quotation: existing,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update quotation: ' + err.message });
  }
});

// Update Quotation Status
adminRouter.patch('/quotations/:id/status', requireAdminAuth, (req, res) => {
  try {
    const quotationId = req.params.id;
    const { status } = req.body || {};

    if (!VALID_QUOTATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid quotation status. Allowed: ${VALID_QUOTATION_STATUSES.join(', ')}`,
      });
    }

    const quotation = storedQuotations.get(quotationId);
    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: `Quotation ${quotationId} not found.`,
      });
    }

    quotation.status = status;
    storedQuotations.set(quotationId, quotation);

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'updateQuotationStatus',
      quotationId,
      status,
    });

    res.json({
      success: true,
      message: `Quotation status updated to ${status}`,
      quotation,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update quotation status' });
  }
});

// ----------------------------------------------------
// 8. INVOICES API
// ----------------------------------------------------

// List Invoices with filters
adminRouter.get('/invoices', requireAdminAuth, (req, res) => {
  try {
    const { search, status, paymentStatus, sort, leadId, quotationId } = req.query;
    let list = Array.from(storedInvoices.values());

    if (leadId && typeof leadId === 'string') {
      list = list.filter((inv) => inv.leadId === leadId);
    }

    if (quotationId && typeof quotationId === 'string') {
      list = list.filter((inv) => inv.quotationId === quotationId);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((inv) => inv.status === status);
    }

    if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'ALL') {
      list = list.filter((inv) => inv.paymentStatus === paymentStatus);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.invoiceId.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.phone.includes(q) ||
          item.fromLocation.toLowerCase().includes(q) ||
          item.toLocation.toLowerCase().includes(q) ||
          (item.quotationId && item.quotationId.toLowerCase().includes(q)) ||
          (item.leadId && item.leadId.toLowerCase().includes(q))
      );
    }

    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json({
      success: true,
      count: list.length,
      invoices: list,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
});

// Get Single Invoice by ID
adminRouter.get('/invoices/:id', requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = storedInvoices.get(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} was not found.`,
      });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch invoice details' });
  }
});

// Create Invoice (From Quotation, Lead, or Direct)
adminRouter.post('/invoices', requireAdminAuth, (req, res) => {
  try {
    const body = req.body || {};
    const {
      quotationId,
      leadId,
      invoiceDate,
      dueDate,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      amountPaid,
      paymentDate,
      paymentMethod,
      paymentNotes,
      status,
      notes,
      terms,
    } = body;

    // Required Field Validations
    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit phone number is required.' });
    }
    if (!fromLocation || !String(fromLocation).trim()) {
      return res.status(400).json({ success: false, error: 'From location is required.' });
    }
    if (!toLocation || !String(toLocation).trim()) {
      return res.status(400).json({ success: false, error: 'To location is required.' });
    }
    if (!movingDate || !String(movingDate).trim()) {
      return res.status(400).json({ success: false, error: 'Moving date is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one charge item is required in the invoice.' });
    }

    // Recalculate finances and payment balance server-side
    const financialTotals = calculateInvoiceFinancialTotals(items, discount, gstPercentage, amountPaid);

    const invoiceId = generateInvoiceNumber();
    const createdAt = new Date().toISOString();
    const invDate = invoiceDate || getTodayDateString();
    const finalStatus: InvoiceStatus = VALID_INVOICE_STATUSES.includes(status) ? status : 'DRAFT';

    const invoiceRecord: InvoiceRecord = {
      invoiceId,
      quotationId: quotationId ? String(quotationId).trim() : undefined,
      leadId: leadId ? String(leadId).trim() : undefined,
      createdAt,
      invoiceDate: invDate,
      dueDate: dueDate || undefined,
      customerName: String(customerName).trim(),
      phone: cleanPhone,
      email: email && String(email).trim().length > 0 ? String(email).trim() : undefined,
      fromLocation: String(fromLocation).trim(),
      toLocation: String(toLocation).trim(),
      movingDate: String(movingDate).trim(),
      movingType: String(movingType || 'House Shifting').trim(),
      items: financialTotals.items,
      subtotal: financialTotals.subtotal,
      discount: financialTotals.discount,
      taxableAmount: financialTotals.taxableAmount,
      gstPercentage: financialTotals.gstPercentage,
      gstAmount: financialTotals.gstAmount,
      grandTotal: financialTotals.grandTotal,
      amountPaid: financialTotals.amountPaid,
      balanceDue: financialTotals.balanceDue,
      paymentStatus: financialTotals.paymentStatus,
      paymentDate: financialTotals.amountPaid > 0 ? (paymentDate || invDate) : undefined,
      paymentMethod: financialTotals.amountPaid > 0 ? (paymentMethod || 'Bank Transfer') : undefined,
      paymentNotes: paymentNotes && String(paymentNotes).trim().length > 0 ? String(paymentNotes).trim() : undefined,
      status: finalStatus,
      notes: notes && String(notes).trim().length > 0 ? String(notes).trim() : undefined,
      terms: terms && String(terms).trim().length > 0 ? String(terms).trim() : undefined,
    };

    storedInvoices.set(invoiceId, invoiceRecord);

    // Link Invoice ID in Quotation if quotationId exists
    if (invoiceRecord.quotationId && storedQuotations.has(invoiceRecord.quotationId)) {
      const q = storedQuotations.get(invoiceRecord.quotationId)!;
      q.invoiceId = invoiceId;
      storedQuotations.set(invoiceRecord.quotationId, q);
    }

    // Link Invoice ID in Lead if leadId exists
    if (invoiceRecord.leadId && storedLeads.has(invoiceRecord.leadId)) {
      const lead = storedLeads.get(invoiceRecord.leadId)!;
      lead.invoiceId = invoiceId;
      storedLeads.set(invoiceRecord.leadId, lead);
    }

    // Forward to Google Sheet
    forwardToGoogleAppsScript({
      action: 'createInvoice',
      ...invoiceRecord,
      items: JSON.stringify(invoiceRecord.items),
    });

    res.status(201).json({
      success: true,
      message: `Invoice ${invoiceId} created successfully.`,
      invoice: invoiceRecord,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create invoice: ' + err.message });
  }
});

// Update Invoice Details
adminRouter.put('/invoices/:id', requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const existing = storedInvoices.get(invoiceId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} does not exist.`,
      });
    }

    const body = req.body || {};
    const {
      invoiceDate,
      dueDate,
      customerName,
      phone,
      email,
      fromLocation,
      toLocation,
      movingDate,
      movingType,
      items,
      discount,
      gstPercentage,
      amountPaid,
      paymentDate,
      paymentMethod,
      paymentNotes,
      status,
      notes,
      terms,
    } = body;

    if (!customerName || !String(customerName).trim()) {
      return res.status(400).json({ success: false, error: 'Customer name is required.' });
    }
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'A valid 10-digit phone number is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one charge item is required.' });
    }

    const financialTotals = calculateInvoiceFinancialTotals(
      items,
      discount,
      gstPercentage,
      amountPaid !== undefined ? amountPaid : existing.amountPaid
    );

    const finalStatus: InvoiceStatus = VALID_INVOICE_STATUSES.includes(status) ? status : existing.status;

    existing.invoiceDate = invoiceDate || existing.invoiceDate;
    existing.dueDate = dueDate || existing.dueDate;
    existing.customerName = String(customerName).trim();
    existing.phone = cleanPhone;
    existing.email = email && String(email).trim().length > 0 ? String(email).trim() : undefined;
    existing.fromLocation = String(fromLocation || existing.fromLocation).trim();
    existing.toLocation = String(toLocation || existing.toLocation).trim();
    existing.movingDate = String(movingDate || existing.movingDate).trim();
    existing.movingType = String(movingType || existing.movingType).trim();
    existing.items = financialTotals.items;
    existing.subtotal = financialTotals.subtotal;
    existing.discount = financialTotals.discount;
    existing.taxableAmount = financialTotals.taxableAmount;
    existing.gstPercentage = financialTotals.gstPercentage;
    existing.gstAmount = financialTotals.gstAmount;
    existing.grandTotal = financialTotals.grandTotal;
    existing.amountPaid = financialTotals.amountPaid;
    existing.balanceDue = financialTotals.balanceDue;
    existing.paymentStatus = financialTotals.paymentStatus;
    if (paymentDate) existing.paymentDate = paymentDate;
    if (paymentMethod) existing.paymentMethod = paymentMethod;
    if (paymentNotes !== undefined) existing.paymentNotes = paymentNotes;
    existing.status = finalStatus;
    existing.notes = notes && String(notes).trim().length > 0 ? String(notes).trim() : undefined;
    existing.terms = terms && String(terms).trim().length > 0 ? String(terms).trim() : undefined;

    storedInvoices.set(invoiceId, existing);

    forwardToGoogleAppsScript({
      action: 'updateInvoice',
      ...existing,
      items: JSON.stringify(existing.items),
    });

    res.json({
      success: true,
      message: `Invoice ${invoiceId} updated successfully.`,
      invoice: existing,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update invoice: ' + err.message });
  }
});

// Record or Update Payment for Invoice
adminRouter.patch('/invoices/:id/payment', requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = storedInvoices.get(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} not found.`,
      });
    }

    const { amountPaid, paymentDate, paymentMethod, paymentNotes } = req.body || {};

    const newAmountPaid = Math.max(0, Math.round((Number(amountPaid) || 0) * 100) / 100);
    const balanceDue = Math.max(0, Math.round((invoice.grandTotal - newAmountPaid) * 100) / 100);

    let paymentStatus: PaymentStatus = 'UNPAID';
    if (newAmountPaid >= invoice.grandTotal && invoice.grandTotal > 0) {
      paymentStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      paymentStatus = 'PARTIALLY_PAID';
    }

    invoice.amountPaid = newAmountPaid;
    invoice.balanceDue = balanceDue;
    invoice.paymentStatus = paymentStatus;
    invoice.paymentDate = paymentDate || getTodayDateString();
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentNotes !== undefined) invoice.paymentNotes = paymentNotes;

    // If paid in full, also set invoice status to PAID if currently ISSUED
    if (paymentStatus === 'PAID' && invoice.status === 'ISSUED') {
      invoice.status = 'PAID';
    }

    storedInvoices.set(invoiceId, invoice);

    forwardToGoogleAppsScript({
      action: 'updateInvoicePayment',
      invoiceId,
      amountPaid: invoice.amountPaid,
      balanceDue: invoice.balanceDue,
      paymentStatus: invoice.paymentStatus,
      paymentDate: invoice.paymentDate,
      paymentMethod: invoice.paymentMethod,
      paymentNotes: invoice.paymentNotes,
    });

    res.json({
      success: true,
      message: 'Payment information updated successfully.',
      invoice,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to record invoice payment' });
  }
});

// Update Invoice Status
adminRouter.patch('/invoices/:id/status', requireAdminAuth, (req, res) => {
  try {
    const invoiceId = req.params.id;
    const { status } = req.body || {};

    if (!VALID_INVOICE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid invoice status. Allowed: ${VALID_INVOICE_STATUSES.join(', ')}`,
      });
    }

    const invoice = storedInvoices.get(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: `Invoice ${invoiceId} not found.`,
      });
    }

    invoice.status = status;
    storedInvoices.set(invoiceId, invoice);

    forwardToGoogleAppsScript({
      action: 'updateInvoiceStatus',
      invoiceId,
      status,
    });

    res.json({
      success: true,
      message: `Invoice status updated to ${status}`,
      invoice,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update invoice status' });
  }
});

// ----------------------------------------------------
// 9. GOOGLE SHEETS LIVE RE-SYNC (Optional Admin Action)
// ----------------------------------------------------
adminRouter.post('/sync', requireAdminAuth, async (req, res) => {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl || !scriptUrl.startsWith('http')) {
    return res.json({
      success: true,
      source: 'local_memory',
      message: 'Google Apps Script URL is not configured. Using high-speed local memory storage.',
      leadsCount: storedLeads.size,
      followupsCount: storedFollowups.size,
    });
  }

  try {
    const response = await fetch(`${scriptUrl}?action=getAll`);
    if (!response.ok) {
      return res.status(502).json({
        success: false,
        error: `Google Apps Script returned status ${response.status}`,
      });
    }

    const data: any = await response.json();
    if (data && Array.isArray(data.leads)) {
      data.leads.forEach((l: any) => {
        if (l.leadId) {
          storedLeads.set(l.leadId, {
            leadId: l.leadId,
            createdAt: l.createdAt || new Date().toISOString(),
            name: l.name || '',
            phone: l.phone || '',
            fromLocation: l.fromLocation || '',
            toLocation: l.toLocation || '',
            movingDate: l.movingDate || '',
            movingType: l.movingType || 'House Shifting',
            source: l.source || 'website',
            status: (VALID_STATUSES.includes(l.status) ? l.status : 'NEW') as LeadStatus,
            nextFollowup: l.nextFollowup || '',
          });
        }
      });
    }

    if (data && Array.isArray(data.followups)) {
      data.followups.forEach((f: any) => {
        if (f.followupId) {
          storedFollowups.set(f.followupId, {
            followupId: f.followupId,
            leadId: f.leadId || '',
            createdAt: f.createdAt || new Date().toISOString(),
            customerName: f.customerName || '',
            phone: f.phone || '',
            followupDate: f.followupDate || '',
            followupTime: f.followupTime || '',
            status: f.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
            notes: f.notes || '',
            completedAt: f.completedAt,
          });
        }
      });
    }

    if (data && Array.isArray(data.quotations)) {
      data.quotations.forEach((q: any) => {
        if (q.quotationId) {
          storedQuotations.set(q.quotationId, {
            quotationId: q.quotationId,
            leadId: q.leadId || undefined,
            invoiceId: q.invoiceId || undefined,
            createdAt: q.createdAt || new Date().toISOString(),
            quotationDate: q.quotationDate || '',
            validUntil: q.validUntil || '',
            customerName: q.customerName || '',
            phone: q.phone || '',
            email: q.email || undefined,
            fromLocation: q.fromLocation || '',
            toLocation: q.toLocation || '',
            movingDate: q.movingDate || '',
            movingType: q.movingType || 'House Shifting',
            items: Array.isArray(q.items)
              ? q.items
              : typeof q.items === 'string' && q.items.trim().startsWith('[')
              ? (() => {
                  try {
                    return JSON.parse(q.items);
                  } catch (e) {
                    return [];
                  }
                })()
              : [],
            subtotal: Number(q.subtotal) || 0,
            discount: Number(q.discount) || 0,
            taxableAmount: Number(q.taxableAmount) || Math.max(0, (Number(q.subtotal) || 0) - (Number(q.discount) || 0)),
            gstPercentage: Number(q.gstPercentage) || 0,
            gstAmount: Number(q.gstAmount) || 0,
            grandTotal: Number(q.grandTotal) || 0,
            status: VALID_QUOTATION_STATUSES.includes(q.status) ? q.status : 'DRAFT',
            notes: q.notes || undefined,
            terms: q.terms || undefined,
          });
        }
      });
    }

    if (data && Array.isArray(data.invoices)) {
      data.invoices.forEach((inv: any) => {
        if (inv.invoiceId) {
          storedInvoices.set(inv.invoiceId, {
            invoiceId: inv.invoiceId,
            quotationId: inv.quotationId || undefined,
            leadId: inv.leadId || undefined,
            createdAt: inv.createdAt || new Date().toISOString(),
            invoiceDate: inv.invoiceDate || '',
            dueDate: inv.dueDate || undefined,
            customerName: inv.customerName || '',
            phone: inv.phone || '',
            email: inv.email || undefined,
            fromLocation: inv.fromLocation || '',
            toLocation: inv.toLocation || '',
            movingDate: inv.movingDate || '',
            movingType: inv.movingType || 'House Shifting',
            items: Array.isArray(inv.items)
              ? inv.items
              : typeof inv.items === 'string' && inv.items.trim().startsWith('[')
              ? (() => {
                  try {
                    return JSON.parse(inv.items);
                  } catch (e) {
                    return [];
                  }
                })()
              : [],
            subtotal: Number(inv.subtotal) || 0,
            discount: Number(inv.discount) || 0,
            taxableAmount: Number(inv.taxableAmount) || Math.max(0, (Number(inv.subtotal) || 0) - (Number(inv.discount) || 0)),
            gstPercentage: Number(inv.gstPercentage) || 0,
            gstAmount: Number(inv.gstAmount) || 0,
            grandTotal: Number(inv.grandTotal) || 0,
            amountPaid: Number(inv.amountPaid) || 0,
            balanceDue: Number(inv.balanceDue) || 0,
            paymentStatus: VALID_PAYMENT_STATUSES.includes(inv.paymentStatus) ? inv.paymentStatus : 'UNPAID',
            paymentDate: inv.paymentDate || undefined,
            paymentMethod: inv.paymentMethod || undefined,
            paymentNotes: inv.paymentNotes || undefined,
            status: VALID_INVOICE_STATUSES.includes(inv.status) ? inv.status : 'DRAFT',
            notes: inv.notes || undefined,
            terms: inv.terms || undefined,
          });
        }
      });
    }

    return res.json({
      success: true,
      source: 'google_sheets',
      message: 'Successfully synchronized data with Google Sheet',
      leadsCount: storedLeads.size,
      followupsCount: storedFollowups.size,
      quotationsCount: storedQuotations.size,
      invoicesCount: storedInvoices.size,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to sync with Google Sheet: ' + err.message,
    });
  }
});

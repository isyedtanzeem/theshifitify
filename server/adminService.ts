import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUOTATION_SENT'
  | 'FOLLOW_UP'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'LOST'
  | 'CANCELLED';

export interface LeadRecord {
  leadId: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: string;
  source: string;
  status: LeadStatus;
  nextFollowup?: string;
  notes?: string;
  quotationId?: string;
  invoiceId?: string;
}

export interface FollowupRecord {
  followupId: string;
  leadId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  followupDate: string;
  followupTime: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  completedAt?: string;
}

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  total?: number;
}

export interface QuotationRecord {
  quotationId: string; // e.g. "Q-2026-0001"
  leadId?: string;
  invoiceId?: string;
  createdAt: string;
  quotationDate: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  customerName: string;
  phone: string;
  email?: string;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gstPercentage: number;
  gstAmount: number;
  grandTotal: number;
  status: QuotationStatus;
  notes?: string;
  terms?: string;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'UPI' | 'Card' | 'Other';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  total?: number;
}

export interface InvoiceRecord {
  invoiceId: string; // e.g. "INV-2026-0001"
  quotationId?: string;
  leadId?: string;
  createdAt: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate?: string;
  customerName: string;
  phone: string;
  email?: string;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  gstPercentage: number;
  gstAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  paymentNotes?: string;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
}

// In-memory data structures
export const storedLeads: Map<string, LeadRecord> = new Map();
export const storedFollowups: Map<string, FollowupRecord> = new Map();
export const storedQuotations: Map<string, QuotationRecord> = new Map();
export const storedInvoices: Map<string, InvoiceRecord> = new Map();

// Helper to generate unique quotation number server-side: Q-YYYY-XXXX (e.g. Q-2026-0001)
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const prefix = `Q-${year}-`;
  let maxSeq = 0;

  for (const qId of storedQuotations.keys()) {
    if (qId.startsWith(prefix)) {
      const seqStr = qId.replace(prefix, '');
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(4, '0');
  const candidate = `${prefix}${padded}`;

  // Extra safety check against duplicates
  if (storedQuotations.has(candidate)) {
    return `${prefix}${String(maxSeq + 2).padStart(4, '0')}`;
  }
  return candidate;
}

// Helper to generate unique invoice number server-side: INV-YYYY-XXXX (e.g. INV-2026-0001)
export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  let maxSeq = 0;

  for (const invId of storedInvoices.keys()) {
    if (invId.startsWith(prefix)) {
      const seqStr = invId.replace(prefix, '');
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(4, '0');
  const candidate = `${prefix}${padded}`;

  if (storedInvoices.has(candidate)) {
    return `${prefix}${String(maxSeq + 2).padStart(4, '0')}`;
  }
  return candidate;
}

// Server-side Financial Calculations Engine (Never trust client calculations)
export function calculateFinancialTotals(
  rawItems: any[],
  rawDiscount: any,
  rawGstPercentage: any
) {
  const items: QuotationItem[] = (Array.isArray(rawItems) ? rawItems : []).map((item, idx) => {
    const desc = String(item.description || `Charge Item ${idx + 1}`).trim();
    const qty = Math.max(1, Math.round(Number(item.quantity) || 1));
    const unitPrice = Math.max(0, Math.round((Number(item.unitPrice) || 0) * 100) / 100);
    const amount = Math.round(qty * unitPrice * 100) / 100;
    return {
      id: item.id || `item_${idx + 1}_${Date.now()}`,
      description: desc || 'Packing & Moving Service',
      quantity: qty,
      unitPrice,
      amount,
      total: amount,
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.amount, 0);
  const discountInput = Math.max(0, Math.round((Number(rawDiscount) || 0) * 100) / 100);
  // Discount cannot exceed subtotal
  const discount = Math.min(discountInput, subtotal);
  const taxableAmount = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  const gstPercentage = Math.max(0, Math.min(100, Math.round((Number(rawGstPercentage) ?? 18) * 100) / 100));
  const gstAmount = Math.round(taxableAmount * (gstPercentage / 100) * 100) / 100;
  const grandTotal = Math.round((taxableAmount + gstAmount) * 100) / 100;

  return {
    items,
    subtotal,
    discount,
    taxableAmount,
    gstPercentage,
    gstAmount,
    grandTotal,
  };
}

export function calculateInvoiceFinancialTotals(
  rawItems: any[],
  rawDiscount: any,
  rawGstPercentage: any,
  rawAmountPaid: any
) {
  const baseTotals = calculateFinancialTotals(rawItems, rawDiscount, rawGstPercentage);
  const amountPaid = Math.max(0, Math.round((Number(rawAmountPaid) || 0) * 100) / 100);
  const balanceDue = Math.max(0, Math.round((baseTotals.grandTotal - amountPaid) * 100) / 100);

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (amountPaid >= baseTotals.grandTotal && baseTotals.grandTotal > 0) {
    paymentStatus = 'PAID';
  } else if (amountPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  return {
    ...baseTotals,
    amountPaid,
    balanceDue,
    paymentStatus,
  };
}

// Helper to generate unique human-readable Lead ID (e.g. SFY2609021234)
export function generateLeadId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `SFY${year}${month}${day}${randomSuffix}`;
}

// Helper to get today's date formatted as YYYY-MM-DD in IST
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Seed initial realistic Bangalore relocation data so dashboard is immediately populated
export function seedInitialAdminData() {
  if (storedLeads.size > 0) return;

  const today = getTodayDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0];
  const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0];
  const fiveDaysAgo = new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString().split('T')[0];

  const sampleLeads: LeadRecord[] = [
    {
      leadId: 'SFY2609011024',
      createdAt: `${today}T09:30:00.000Z`,
      name: 'Aditya Narayanan',
      phone: '9845123456',
      email: 'aditya.n@gmail.com',
      fromLocation: 'HSR Layout Sector 2, Bangalore',
      toLocation: 'Whitefield Prestige Palms, Bangalore',
      movingDate: '2026-09-12',
      movingType: 'House Shifting',
      source: 'Website',
      status: 'NEW',
      nextFollowup: `${today} 04:00 PM`,
      notes: 'Customer requested 3BHK premium packing and double-layered bubble wrap for glass dining table.',
    },
    {
      leadId: 'SFY2609010915',
      createdAt: `${today}T08:15:00.000Z`,
      name: 'Priyanka Sen',
      phone: '9731234567',
      email: 'priyanka.sen@outlook.com',
      fromLocation: 'Indiranagar 100ft Road, Bangalore',
      toLocation: 'Bellandur Green Glen, Bangalore',
      movingDate: '2026-09-15',
      movingType: 'House Shifting',
      source: 'Google',
      status: 'CONTACTED',
      nextFollowup: `${today} 02:30 PM`,
      notes: 'Quotation shared for 2BHK relocation. Follow up regarding elevator booking at society.',
    },
    {
      leadId: 'SFY2608311542',
      createdAt: `${yesterday}T15:42:00.000Z`,
      name: 'Dr. Suresh Kulkarni',
      phone: '9880123987',
      fromLocation: 'Koramangala 4th Block, Bangalore',
      toLocation: 'Banjara Hills, Hyderabad',
      movingDate: '2026-09-20',
      movingType: 'Intercity Shifting',
      source: 'Direct Website',
      status: 'QUOTATION_SENT',
      nextFollowup: `${today} 05:30 PM`,
    },
    {
      leadId: 'SFY2608311120',
      createdAt: `${yesterday}T11:20:00.000Z`,
      name: 'Vikram Joshi (InnoTech Labs)',
      phone: '9611234890',
      fromLocation: 'Embassy Tech Village, Outer Ring Road',
      toLocation: 'Bagmane Tech Park, CV Raman Nagar',
      movingDate: '2026-09-25',
      movingType: 'Office Shifting',
      source: 'Corporate Relocation',
      status: 'FOLLOW_UP',
      nextFollowup: `${today} 11:30 AM`,
    },
    {
      leadId: 'SFY2608301410',
      createdAt: `${twoDaysAgo}T14:10:00.000Z`,
      name: 'Ananya Raghavan',
      phone: '9900123456',
      fromLocation: 'Jayanagar 4th T Block, Bangalore',
      toLocation: 'Sarjapur Road Rainbow Drive, Bangalore',
      movingDate: '2026-09-10',
      movingType: 'House Shifting',
      source: 'Website Header CTA',
      status: 'CONFIRMED',
      nextFollowup: '2026-09-09 10:00 AM',
    },
    {
      leadId: 'SFY2608291620',
      createdAt: `${threeDaysAgo}T16:20:00.000Z`,
      name: 'Rohan Mehta',
      phone: '9844567890',
      fromLocation: 'Malleshwaram 15th Cross, Bangalore',
      toLocation: 'Andheri West, Mumbai',
      movingDate: '2026-09-08',
      movingType: 'Vehicle Transport',
      source: 'Website Calculator',
      status: 'SCHEDULED',
      nextFollowup: '2026-09-07 11:00 AM',
    },
    {
      leadId: 'SFY2608271030',
      createdAt: `${fiveDaysAgo}T10:30:00.000Z`,
      name: 'Meera Deshmukh',
      phone: '9740123456',
      fromLocation: 'JP Nagar Phase 7, Bangalore',
      toLocation: 'Koramangala 6th Block, Bangalore',
      movingDate: '2026-09-01',
      movingType: 'Local Shifting',
      source: 'WhatsApp Referral',
      status: 'COMPLETED',
    },
    {
      leadId: 'SFY2608261200',
      createdAt: `${fiveDaysAgo}T12:00:00.000Z`,
      name: 'Karthik Raja',
      phone: '9620123789',
      fromLocation: 'Marathahalli Bridge, Bangalore',
      toLocation: 'Kalyan Nagar, Bangalore',
      movingDate: '2026-08-30',
      movingType: 'House Shifting',
      source: 'Website Lead Form',
      status: 'LOST',
      notes: 'Customer postponed relocation to next quarter',
    },
  ];

  sampleLeads.forEach((l) => storedLeads.set(l.leadId, l));

  // Sample followups
  const sampleFollowups: FollowupRecord[] = [
    {
      followupId: 'FLP260902001',
      leadId: 'SFY2609011024',
      createdAt: `${today}T09:35:00.000Z`,
      customerName: 'Aditya Narayanan',
      phone: '9845123456',
      followupDate: today,
      followupTime: '04:00 PM',
      status: 'PENDING',
      notes: 'Call to confirm 3BHK inventory and send shifting checklist.',
    },
    {
      followupId: 'FLP260902002',
      leadId: 'SFY2608311120',
      createdAt: `${today}T08:30:00.000Z`,
      customerName: 'Vikram Joshi (InnoTech Labs)',
      phone: '9611234890',
      followupDate: today,
      followupTime: '11:30 AM',
      status: 'PENDING',
      notes: 'Corporate site inspection discussion for server rack moving.',
    },
    {
      followupId: 'FLP260901003',
      leadId: 'SFY2608301410',
      createdAt: `${twoDaysAgo}T14:15:00.000Z`,
      customerName: 'Ananya Raghavan',
      phone: '9900123456',
      followupDate: yesterday,
      followupTime: '03:00 PM',
      status: 'COMPLETED',
      notes: 'Advance token confirmed via UPI. Move scheduled for Sept 10th.',
      completedAt: `${yesterday}T15:05:00.000Z`,
    },
  ];

  sampleFollowups.forEach((f) => storedFollowups.set(f.followupId, f));

  // Sample Quotation Q-2026-0001 (For Dr. Suresh Kulkarni)
  const q1Items: QuotationItem[] = [
    { id: 'item_1', description: '3BHK Complete Household Multi-layer Packing (Cartons, Bubble, Corrugated sheets)', quantity: 1, unitPrice: 12500, amount: 12500 },
    { id: 'item_2', description: 'Dedicated Closed Container Transit (Bangalore to Hyderabad 575km)', quantity: 1, unitPrice: 7500, amount: 7500 },
    { id: 'item_3', description: 'Loading & Unloading with Skilled Crew (Both Locations)', quantity: 1, unitPrice: 3000, amount: 3000 },
  ];
  const q1Totals = calculateFinancialTotals(q1Items, 1000, 18);
  const sampleQuotation1: QuotationRecord = {
    quotationId: 'Q-2026-0001',
    leadId: 'SFY2608311542',
    createdAt: `${yesterday}T16:00:00.000Z`,
    quotationDate: yesterday,
    validUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    customerName: 'Dr. Suresh Kulkarni',
    phone: '9448123456',
    email: 'dr.suresh@gmail.com',
    fromLocation: 'Basavanagudi, Bangalore',
    toLocation: 'Banjara Hills, Hyderabad',
    movingDate: '2026-09-15',
    movingType: 'House Shifting',
    items: q1Totals.items,
    subtotal: q1Totals.subtotal,
    discount: q1Totals.discount,
    taxableAmount: q1Totals.taxableAmount,
    gstPercentage: q1Totals.gstPercentage,
    gstAmount: q1Totals.gstAmount,
    grandTotal: q1Totals.grandTotal,
    status: 'SENT',
    notes: 'Fragile antique wooden furniture and glassware to be packed with extra bubble protection.',
    terms: '1. Quotation valid for 7 days from the date of issue.\n2. 50% advance on packing commencement, balance upon safe delivery.\n3. Octroi / State green tax if applicable charged at actual receipt.\n4. Flammable items, jewelry, and currency will not be transported.',
  };
  storedQuotations.set(sampleQuotation1.quotationId, sampleQuotation1);
  const lead1 = storedLeads.get('SFY2608311542');
  if (lead1) lead1.quotationId = sampleQuotation1.quotationId;

  // Sample Quotation Q-2026-0002 and Invoice INV-2026-0001 (For Ananya Raghavan)
  const q2Items: QuotationItem[] = [
    { id: 'item_1', description: '2BHK Apartment Shifting & Professional Furniture Dismantling', quantity: 1, unitPrice: 9500, amount: 9500 },
    { id: 'item_2', description: 'Local 14ft Container Transit (Jayanagar to Sarjapur Road)', quantity: 1, unitPrice: 4500, amount: 4500 },
    { id: 'item_3', description: 'Unpacking and Placement at New Residence', quantity: 1, unitPrice: 2000, amount: 2000 },
  ];
  const q2Totals = calculateFinancialTotals(q2Items, 500, 18);
  const sampleQuotation2: QuotationRecord = {
    quotationId: 'Q-2026-0002',
    leadId: 'SFY2608301410',
    invoiceId: 'INV-2026-0001',
    createdAt: `${twoDaysAgo}T15:00:00.000Z`,
    quotationDate: twoDaysAgo,
    validUntil: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    customerName: 'Ananya Raghavan',
    phone: '9900123456',
    email: 'ananya.raghavan@gmail.com',
    fromLocation: 'Jayanagar 4th T Block, Bangalore',
    toLocation: 'Sarjapur Road Rainbow Drive, Bangalore',
    movingDate: '2026-09-10',
    movingType: 'House Shifting',
    items: q2Totals.items,
    subtotal: q2Totals.subtotal,
    discount: q2Totals.discount,
    taxableAmount: q2Totals.taxableAmount,
    gstPercentage: q2Totals.gstPercentage,
    gstAmount: q2Totals.gstAmount,
    grandTotal: q2Totals.grandTotal,
    status: 'ACCEPTED',
    notes: 'Advance token received. Full house setup required on destination floor.',
    terms: '1. Quotation valid for 7 days.\n2. Balance payable on completion of shifting.',
  };
  storedQuotations.set(sampleQuotation2.quotationId, sampleQuotation2);

  const inv1Totals = calculateInvoiceFinancialTotals(q2Items, 500, 18, 10000);
  const sampleInvoice1: InvoiceRecord = {
    invoiceId: 'INV-2026-0001',
    quotationId: 'Q-2026-0002',
    leadId: 'SFY2608301410',
    createdAt: `${yesterday}T10:00:00.000Z`,
    invoiceDate: yesterday,
    dueDate: '2026-09-10',
    customerName: 'Ananya Raghavan',
    phone: '9900123456',
    email: 'ananya.raghavan@gmail.com',
    fromLocation: 'Jayanagar 4th T Block, Bangalore',
    toLocation: 'Sarjapur Road Rainbow Drive, Bangalore',
    movingDate: '2026-09-10',
    movingType: 'House Shifting',
    items: inv1Totals.items,
    subtotal: inv1Totals.subtotal,
    discount: inv1Totals.discount,
    taxableAmount: inv1Totals.taxableAmount,
    gstPercentage: inv1Totals.gstPercentage,
    gstAmount: inv1Totals.gstAmount,
    grandTotal: inv1Totals.grandTotal,
    amountPaid: inv1Totals.amountPaid,
    balanceDue: inv1Totals.balanceDue,
    paymentStatus: inv1Totals.paymentStatus,
    paymentDate: yesterday,
    paymentMethod: 'UPI',
    paymentNotes: 'UPI advance token confirmation received (Txn: UPI893478921).',
    status: 'ISSUED',
    notes: 'Partially paid advance token of ₹10,000. Balance ₹8,290 payable upon unloading.',
    terms: '1. All payments subject to realization.\n2. Balance amount due on final delivery and room placement.\n3. Goods transported under carrier risk terms.',
  };
  storedInvoices.set(sampleInvoice1.invoiceId, sampleInvoice1);

  const lead2 = storedLeads.get('SFY2608301410');
  if (lead2) {
    lead2.quotationId = sampleQuotation2.quotationId;
    lead2.invoiceId = sampleInvoice1.invoiceId;
  }
}

// ----------------------------------------------------
// TOKEN AUTHENTICATION SYSTEM
// ----------------------------------------------------
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'shiftify_secret_key_admin_auth_2026';

export function createAdminToken(email: string): string {
  const payload = JSON.stringify({
    email,
    role: 'admin',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminToken(token: string): { valid: boolean; email?: string } {
  try {
    if (!token || !token.includes('.')) return { valid: false };
    const [encodedPayload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(encodedPayload).digest('base64url');
    if (signature !== expectedSig) return { valid: false };
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) return { valid: false };
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-admin-token']) {
    token = String(req.headers['x-admin-token']).trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required. Please login.',
    });
  }

  const { valid, email } = verifyAdminToken(token);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired admin session. Please login again.',
    });
  }

  (req as any).adminEmail = email;
  next();
}

// ----------------------------------------------------
// GOOGLE APPS SCRIPT ASYNC SYNC HELPER
// ----------------------------------------------------
export async function forwardToGoogleAppsScript(payload: any): Promise<boolean> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!scriptUrl || !scriptUrl.startsWith('http')) return false;

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (err) {
    console.error('[Google Apps Script Sync Error]:', err);
    return false;
  }
}

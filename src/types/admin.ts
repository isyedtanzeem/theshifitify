/**
 * Shiftify Packers & Movers - Admin Dashboard & Lead Management Types
 */

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

export const ALL_LEAD_STATUSES: { value: LeadStatus; label: string; badgeClass: string; borderClass: string }[] = [
  { value: 'NEW', label: 'New Lead', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', borderClass: 'border-emerald-500' },
  { value: 'CONTACTED', label: 'Contacted', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', borderClass: 'border-blue-500' },
  { value: 'QUOTATION_SENT', label: 'Quotation Sent', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', borderClass: 'border-amber-500' },
  { value: 'FOLLOW_UP', label: 'Follow-up Required', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300', borderClass: 'border-purple-500' },
  { value: 'CONFIRMED', label: 'Confirmed', badgeClass: 'bg-teal-100 text-teal-800 border-teal-300', borderClass: 'border-teal-500' },
  { value: 'SCHEDULED', label: 'Scheduled', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300', borderClass: 'border-indigo-500' },
  { value: 'COMPLETED', label: 'Completed', badgeClass: 'bg-green-100 text-green-800 border-green-300', borderClass: 'border-green-500' },
  { value: 'LOST', label: 'Lost', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', borderClass: 'border-rose-500' },
  { value: 'CANCELLED', label: 'Cancelled', badgeClass: 'bg-slate-200 text-slate-700 border-slate-300', borderClass: 'border-slate-400' },
];

export type FollowupStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export const MOVING_TYPES = [
  'House Shifting',
  'Office Shifting',
  'Vehicle Transport',
  'Warehouse / Storage',
  'Local Shifting',
  'Intercity Shifting',
  'Corporate Relocation',
  'Other',
] as const;

export type MovingType = (typeof MOVING_TYPES)[number];

export const LEAD_SOURCES = [
  'Website',
  'Phone',
  'WhatsApp',
  'Walk-in',
  'Referral',
  'Facebook',
  'Instagram',
  'Google',
  'Other',
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface FollowupRecord {
  followupId: string;
  leadId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  followupDate: string; // YYYY-MM-DD
  followupTime: string; // e.g. "10:30 AM" or "15:00"
  status: FollowupStatus;
  notes: string;
  completedAt?: string;
}

export interface AdminLeadRecord {
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

// ----------------------------------------------------
// QUOTATIONS
// ----------------------------------------------------
export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export const ALL_QUOTATION_STATUSES: { value: QuotationStatus; label: string; badgeClass: string }[] = [
  { value: 'DRAFT', label: 'Draft', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  { value: 'SENT', label: 'Sent to Customer', badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-700' },
  { value: 'ACCEPTED', label: 'Accepted', badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  { value: 'REJECTED', label: 'Rejected', badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-700' },
  { value: 'EXPIRED', label: 'Expired', badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700' },
];

export interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  amount?: number;
}

export interface AdminQuotationRecord {
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

export type QuotationRecord = AdminQuotationRecord;

// ----------------------------------------------------
// INVOICES
// ----------------------------------------------------
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'UPI' | 'Card' | 'Other';

export const ALL_INVOICE_STATUSES: { value: InvoiceStatus; label: string; badgeClass: string }[] = [
  { value: 'DRAFT', label: 'Draft', badgeClass: 'bg-slate-800 text-slate-300 border-slate-700' },
  { value: 'ISSUED', label: 'Issued', badgeClass: 'bg-blue-900/60 text-blue-300 border-blue-700' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid', badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700' },
  { value: 'PAID', label: 'Paid in Full', badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
  { value: 'CANCELLED', label: 'Cancelled', badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-700' },
];

export const ALL_PAYMENT_STATUSES: { value: PaymentStatus; label: string; badgeClass: string }[] = [
  { value: 'UNPAID', label: 'Unpaid', badgeClass: 'bg-rose-900/60 text-rose-300 border-rose-700' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid', badgeClass: 'bg-amber-900/60 text-amber-300 border-amber-700' },
  { value: 'PAID', label: 'Paid', badgeClass: 'bg-emerald-900/60 text-emerald-300 border-emerald-700' },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'UPI',
  'Card',
  'Other',
];

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  amount?: number;
}

export interface AdminInvoiceRecord {
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

export type InvoiceRecord = AdminInvoiceRecord;

export interface AdminStats {
  totalLeads: number;
  statusCounts: Record<LeadStatus, number>;
  leadsToday: number;
  leadsThisMonth: number;
  recentLeads: AdminLeadRecord[];
  todayFollowups: FollowupRecord[];
  totalQuotations?: number;
  totalInvoices?: number;
  totalRevenue?: number;
}

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

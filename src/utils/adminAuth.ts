/**
 * Shiftify Admin Authentication and API Client
 */

import {
  AdminStats,
  AdminLeadRecord,
  FollowupRecord,
  LeadStatus,
  QuotationRecord,
  InvoiceRecord,
  QuotationStatus,
  InvoiceStatus,
  PaymentStatus,
} from '../types/admin';

const TOKEN_STORAGE_KEY = 'shiftify_admin_token';
const USER_STORAGE_KEY = 'shiftify_admin_user';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to store session in localStorage:', err);
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session:', err);
  }
}

export function isAdminAuthenticated(): boolean {
  return !!getAdminToken();
}

function getAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      data: {
        success: false,
        error: res.status === 404
          ? 'Admin API endpoint not found. Please verify deployment routing.'
          : `Server error (${res.status}): ${text.slice(0, 100)}`,
      },
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: { success: false, error: err.message || 'Network connection failed' },
    };
  }
}

// ----------------------------------------------------
// Admin API Calls
// ----------------------------------------------------

export async function loginAdmin(identifier: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: identifier,
        password,
      }),
    });

    if (!ok || !data.success) {
      return { success: false, error: data.error || 'Invalid credentials' };
    }

    setAdminSession(data.token, data.user);
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unable to connect to login server' };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  try {
    const { ok, data } = await safeFetchJson('/api/admin/me', {
      headers: getAuthHeaders(),
    });
    if (ok && data.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      return true;
    }
    clearAdminSession();
    return false;
  } catch {
    // If offline or network glitch, trust cached token if present
    return !!token;
  }
}

export async function fetchAdminStats(): Promise<{ success: boolean; stats?: AdminStats; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/stats', {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch statistics');
    return { success: true, stats: data.stats };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export interface LeadFilterParams {
  search?: string;
  status?: string;
  movingType?: string;
  source?: string;
  movingDate?: string;
  dateFilter?: string;
  sort?: string;
}

export async function fetchAdminLeads(params: LeadFilterParams = {}): Promise<{ success: boolean; leads: AdminLeadRecord[]; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.movingType && params.movingType !== 'ALL') query.set('movingType', params.movingType);
    if (params.source && params.source !== 'ALL') query.set('source', params.source);
    if (params.movingDate) query.set('movingDate', params.movingDate);
    if (params.dateFilter) query.set('dateFilter', params.dateFilter);
    if (params.sort) query.set('sort', params.sort);

    const { ok, data } = await safeFetchJson(`/api/admin/leads?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch leads');
    return { success: true, leads: data.leads || [] };
  } catch (err: any) {
    return { success: false, leads: [], error: err.message };
  }
}

export async function createManualLead(payload: {
  name: string;
  phone: string;
  email?: string;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: string;
  source: string;
  notes?: string;
}): Promise<{ success: boolean; lead?: AdminLeadRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/leads', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to create lead');
    return { success: true, lead: data.lead };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLeadDetails(
  leadId: string,
  payload: {
    name: string;
    phone: string;
    email?: string;
    fromLocation: string;
    toLocation: string;
    movingDate: string;
    movingType: string;
    source: string;
    notes?: string;
  }
): Promise<{ success: boolean; lead?: AdminLeadRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to update lead');
    return { success: true, lead: data.lead };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchLeadDetail(leadId: string): Promise<{ success: boolean; lead?: AdminLeadRecord; followups?: FollowupRecord[]; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/leads/${encodeURIComponent(leadId)}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Lead not found');
    return { success: true, lead: data.lead, followups: data.followups || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLeadStatus(leadId: string, status: LeadStatus, notes?: string): Promise<{ success: boolean; lead?: AdminLeadRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/leads/${encodeURIComponent(leadId)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    if (!ok) throw new Error(data.error || 'Failed to update status');
    return { success: true, lead: data.lead };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchFollowups(): Promise<{
  success: boolean;
  today: FollowupRecord[];
  upcoming: FollowupRecord[];
  completed: FollowupRecord[];
  error?: string;
}> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/followups', {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to load follow-ups');
    return {
      success: true,
      today: data.today || [],
      upcoming: data.upcoming || [],
      completed: data.completed || [],
    };
  } catch (err: any) {
    return {
      success: false,
      today: [],
      upcoming: [],
      completed: [],
      error: err.message,
    };
  }
}

export async function scheduleFollowup(payload: {
  leadId: string;
  followupDate: string;
  followupTime: string;
  notes?: string;
}): Promise<{ success: boolean; followup?: FollowupRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/followups', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to schedule follow-up');
    return { success: true, followup: data.followup };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function completeFollowup(followupId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/followups/${encodeURIComponent(followupId)}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to complete follow-up');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function syncGoogleSheets(): Promise<{ success: boolean; message?: string; leadsCount?: number; followupsCount?: number; quotationsCount?: number; invoicesCount?: number; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/sync', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to sync with Google Sheet');
    return {
      success: true,
      message: data.message,
      leadsCount: data.leadsCount,
      followupsCount: data.followupsCount,
      quotationsCount: data.quotationsCount,
      invoicesCount: data.invoicesCount,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ====================================================
// QUOTATIONS API CLIENT
// ====================================================

export interface QuotationFilterParams {
  search?: string;
  status?: string;
  sort?: string;
  leadId?: string;
}

export async function fetchAdminQuotations(
  params: QuotationFilterParams = {}
): Promise<{ success: boolean; quotations: QuotationRecord[]; count?: number; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    if (params.leadId) query.set('leadId', params.leadId);

    const { ok, data } = await safeFetchJson(`/api/admin/quotations?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch quotations');
    return { success: true, quotations: data.quotations || [], count: data.count };
  } catch (err: any) {
    return { success: false, quotations: [], error: err.message };
  }
}

export async function fetchQuotationById(
  id: string
): Promise<{ success: boolean; quotation?: QuotationRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/quotations/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch quotation details');
    return { success: true, quotation: data.quotation };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAdminQuotation(
  payload: any
): Promise<{ success: boolean; quotation?: QuotationRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/quotations', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to create quotation');
    return { success: true, quotation: data.quotation };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminQuotation(
  id: string,
  payload: any
): Promise<{ success: boolean; quotation?: QuotationRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/quotations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to update quotation');
    return { success: true, quotation: data.quotation };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<{ success: boolean; quotation?: QuotationRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/quotations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!ok) throw new Error(data.error || 'Failed to update quotation status');
    return { success: true, quotation: data.quotation };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ====================================================
// INVOICES API CLIENT
// ====================================================

export interface InvoiceFilterParams {
  search?: string;
  status?: string;
  paymentStatus?: string;
  sort?: string;
  leadId?: string;
  quotationId?: string;
}

export async function fetchAdminInvoices(
  params: InvoiceFilterParams = {}
): Promise<{ success: boolean; invoices: InvoiceRecord[]; count?: number; error?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.paymentStatus && params.paymentStatus !== 'ALL') query.set('paymentStatus', params.paymentStatus);
    if (params.sort) query.set('sort', params.sort);
    if (params.leadId) query.set('leadId', params.leadId);
    if (params.quotationId) query.set('quotationId', params.quotationId);

    const { ok, data } = await safeFetchJson(`/api/admin/invoices?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch invoices');
    return { success: true, invoices: data.invoices || [], count: data.count };
  } catch (err: any) {
    return { success: false, invoices: [], error: err.message };
  }
}

export async function fetchInvoiceById(
  id: string
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/invoices/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders(),
    });
    if (!ok) throw new Error(data.error || 'Failed to fetch invoice details');
    return { success: true, invoice: data.invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createAdminInvoice(
  payload: any
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson('/api/admin/invoices', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to create invoice');
    return { success: true, invoice: data.invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminInvoice(
  id: string,
  payload: any
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/invoices/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to update invoice');
    return { success: true, invoice: data.invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function recordInvoicePayment(
  id: string,
  payload: {
    amountPaid: number;
    paymentDate?: string;
    paymentMethod?: string;
    paymentNotes?: string;
  }
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/invoices/${encodeURIComponent(id)}/payment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!ok) throw new Error(data.error || 'Failed to record payment');
    return { success: true, invoice: data.invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<{ success: boolean; invoice?: InvoiceRecord; error?: string }> {
  try {
    const { ok, data } = await safeFetchJson(`/api/admin/invoices/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!ok) throw new Error(data.error || 'Failed to update invoice status');
    return { success: true, invoice: data.invoice };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

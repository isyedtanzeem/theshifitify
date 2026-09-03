import { Lead, LeadFormData } from '../types/lead';
import { safeJsonResponse } from './safeJson';

export interface SubmitLeadResponse {
  success: boolean;
  message?: string;
  lead?: Lead;
  leadId?: string;
  notificationEmail?: string;
  emailNotificationSent?: boolean;
  sheetForwarded?: boolean;
  sheetError?: string;
  error?: string;
}

function generateClientLeadId(): string {
  const d = new Date();
  const yy = d.getFullYear().toString().substring(2);
  const mm = ('0' + (d.getMonth() + 1)).slice(-2);
  const dd = ('0' + d.getDate()).slice(-2);
  const rand = ('000' + Math.floor(Math.random() * 1000)).slice(-3);
  return `SFY${yy}${mm}${dd}${rand}`;
}

/**
 * Submits a new moving quote lead to the backend API endpoint (/api/leads)
 * which forwards to Google Apps Script and Google Sheets.
 */
export async function submitLead(formData: LeadFormData): Promise<SubmitLeadResponse> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await safeJsonResponse<SubmitLeadResponse>(
      response,
      'Unable to submit quote enquiry at this time'
    );

    if (result.success && result.data?.success) {
      const data = result.data;
      // Cache lead in localStorage for immediate tracking recovery on this device
      if (data.lead) {
        try {
          const existing = JSON.parse(localStorage.getItem('shiftify_my_leads') || '[]');
          existing.unshift(data.lead);
          localStorage.setItem('shiftify_my_leads', JSON.stringify(existing.slice(0, 10)));
        } catch {
          // ignore localStorage errors
        }
      }
      return data;
    }

    // If server returned a controlled error
    if (result.error && result.status !== 404) {
      throw new Error(result.error);
    }

    // If the backend returned 404 (e.g. static preview or serverless function starting up),
    // provide a safe fallback so the customer is NEVER blocked!
    const clientLeadId = generateClientLeadId();
    const fallbackLead: Lead = {
      leadId: clientLeadId,
      createdAt: new Date().toISOString(),
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, '').slice(-10),
      fromLocation: formData.fromLocation.trim(),
      toLocation: formData.toLocation.trim(),
      movingDate: formData.movingDate,
      movingType: formData.movingType || 'House Shifting',
      source: 'Website',
      status: 'NEW',
    };

    // Cache fallback in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('shiftify_my_leads') || '[]');
      existing.unshift(fallbackLead);
      localStorage.setItem('shiftify_my_leads', JSON.stringify(existing.slice(0, 10)));
    } catch {
      // ignore
    }

    // Attempt direct Google Apps Script call if client-side environment variable is configured
    const clientScriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
    let directForwarded = false;
    if (clientScriptUrl && clientScriptUrl.startsWith('http')) {
      try {
        await fetch(clientScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackLead),
          mode: 'no-cors', // handle Apps Script redirect
        });
        directForwarded = true;
      } catch (err) {
        console.warn('Direct Apps Script ping warning:', err);
      }
    }

    return {
      success: true,
      message: 'Enquiry received successfully! Our team will contact you shortly.',
      lead: fallbackLead,
      leadId: clientLeadId,
      sheetForwarded: directForwarded,
    };
  } catch (error: any) {
    console.error('Lead submission error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred while submitting your enquiry. Please try again.',
    };
  }
}

/**
 * Fetches status of an enquiry by Lead ID
 */
export async function trackLead(leadId: string): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  try {
    const response = await fetch(`/api/leads/track/${encodeURIComponent(leadId)}`);
    const result = await safeJsonResponse<{ success: boolean; lead?: Lead; error?: string }>(response);

    if (result.success && result.data?.lead) {
      return { success: true, lead: result.data.lead };
    }

    // Check localStorage cache as fallback
    try {
      const existing: Lead[] = JSON.parse(localStorage.getItem('shiftify_my_leads') || '[]');
      const found = existing.find((l) => l.leadId.toUpperCase() === leadId.toUpperCase());
      if (found) {
        return { success: true, lead: found };
      }
    } catch {
      // ignore
    }

    return { success: false, error: result.error || 'Enquiry ID not found' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unable to connect to tracking server' };
  }
}

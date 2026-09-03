/// <reference types="vite/client" />
import { COMPANY_INFO } from '../data/companyData';
import { Lead } from '../types/lead';

/**
 * Builds a direct WhatsApp click-to-chat URL with a pre-filled message.
 */
export function getWhatsAppUrl(customMessage?: string, phoneNumber?: string): string {
  const number = phoneNumber || import.meta.env.VITE_WHATSAPP_NUMBER || COMPANY_INFO.whatsapp;
  // Clean phone to only digits
  const cleanNumber = number.replace(/\D/g, '');
  const message = customMessage || 'Hi Shiftify Packers & Movers, I am looking for a moving quotation.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a WhatsApp URL specifically for an enquiry submission.
 */
export function getEnquiryWhatsAppUrl(enquiryId: string, lead: Partial<Lead>): string {
  const lines = [
    `Hi Shiftify Packers & Movers!`,
    `I just submitted a moving quotation enquiry online.`,
    `📋 Enquiry ID: ${enquiryId}`,
    lead.name ? `👤 Name: ${lead.name}` : '',
    lead.movingType ? `📦 Service: ${lead.movingType}` : '',
    lead.fromLocation && lead.toLocation ? `📍 Route: ${lead.fromLocation} ➡️ ${lead.toLocation}` : '',
    lead.movingDate ? `🗓️ Moving Date: ${lead.movingDate}` : '',
    `Could you please share the estimate and available slots?`,
  ].filter(Boolean);

  return getWhatsAppUrl(lines.join('\n'));
}

/**
 * Builds telephone click-to-call URL
 */
export function getCallUrl(phoneNumber?: string): string {
  const number = phoneNumber || import.meta.env.VITE_CONTACT_PHONE || COMPANY_INFO.phone;
  const clean = number.replace(/[^\d+]/g, '');
  return `tel:${clean}`;
}

/**
 * Builds direct telephone link for calling a customer
 */
export function getCustomerCallUrl(phone: string): string {
  const clean = (phone || '').replace(/\D/g, '').slice(-10);
  return `tel:+91${clean}`;
}

/**
 * Builds direct WhatsApp URL from Admin to Customer with tailored lead info
 */
export function getCustomerWhatsAppUrl(lead: {
  name: string;
  phone: string;
  leadId: string;
  movingType?: string;
  fromLocation?: string;
  toLocation?: string;
  movingDate?: string;
}): string {
  const cleanPhone = (lead.phone || '').replace(/\D/g, '').slice(-10);
  const targetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  const lines = [
    `Hello ${lead.name || 'Customer'},`,
    `Greetings from Shiftify Packers & Movers!`,
    `This is regarding your moving enquiry [${lead.leadId}]:`,
    lead.movingType ? `📦 Service: ${lead.movingType}` : '',
    lead.fromLocation && lead.toLocation ? `📍 Route: ${lead.fromLocation} ➡️ ${lead.toLocation}` : '',
    lead.movingDate ? `🗓️ Moving Date: ${lead.movingDate}` : '',
    ``,
    `We would love to share your personalized relocation quote and verify slot availability. Could we connect over a quick call?`,
  ].filter((l) => l !== undefined);

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

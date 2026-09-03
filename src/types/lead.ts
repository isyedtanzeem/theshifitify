export type MovingType =
  | 'House Shifting'
  | 'Office Shifting'
  | 'Vehicle Transport'
  | 'Warehouse / Storage'
  | 'Local Shifting'
  | 'Intercity Shifting'
  | 'Corporate Relocation'
  | 'Other';

export interface Lead {
  leadId: string;
  createdAt: string;
  name: string;
  phone: string;
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: MovingType | string;
  source: string;
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
}

export interface LeadFormData {
  fromLocation: string;
  toLocation: string;
  movingDate: string;
  movingType: MovingType | string;
  name: string;
  phone: string;
}

export interface FormValidationErrors {
  fromLocation?: string;
  toLocation?: string;
  movingDate?: string;
  movingType?: string;
  name?: string;
  phone?: string;
  general?: string;
}

export const MOVING_TYPES: MovingType[] = [
  'House Shifting',
  'Office Shifting',
  'Vehicle Transport',
  'Warehouse / Storage',
  'Local Shifting',
  'Intercity Shifting',
  'Corporate Relocation',
  'Other',
];

/**
 * Validates an Indian mobile number.
 * Must be 10 digits and start with 6, 7, 8, or 9.
 */
export function validateIndianMobile(phone: string): { isValid: boolean; error?: string; cleanNumber?: string } {
  if (!phone) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // Remove whitespace, dashes, plus signs and leading 91 or 0 if user entered them
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  if (!/^\d{10}$/.test(cleaned)) {
    return { isValid: false, error: 'Enter a valid 10-digit mobile number' };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must start with 6, 7, 8, or 9' };
  }

  return { isValid: true, cleanNumber: cleaned };
}

/**
 * Validates customer name (min 2 characters, valid letters).
 */
export function validateCustomerName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name ? name.trim() : '';
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }
  return { isValid: true };
}

/**
 * Validates moving date (required and cannot be in the past).
 */
export function validateMovingDate(dateString: string): { isValid: boolean; error?: string } {
  if (!dateString) {
    return { isValid: false, error: 'Moving date is required' };
  }

  const selectedDate = new Date(dateString);
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Enter a valid date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const testDate = new Date(dateString);
  testDate.setHours(0, 0, 0, 0);

  if (testDate < today) {
    return { isValid: false, error: 'Moving date cannot be in the past' };
  }

  return { isValid: true };
}

/**
 * Validates Step 1: From Location & To Location
 */
export function validateStep1(data: Partial<LeadFormData>): FormValidationErrors {
  const errors: FormValidationErrors = {};

  if (!data.fromLocation || data.fromLocation.trim().length === 0) {
    errors.fromLocation = 'Pickup location is required';
  } else if (data.fromLocation.trim().length < 2) {
    errors.fromLocation = 'Please enter a valid pickup location';
  }

  if (!data.toLocation || data.toLocation.trim().length === 0) {
    errors.toLocation = 'Drop location is required';
  } else if (data.toLocation.trim().length < 2) {
    errors.toLocation = 'Please enter a valid drop location';
  }

  return errors;
}

/**
 * Validates Step 2: Moving Date & Moving Type
 */
export function validateStep2(data: Partial<LeadFormData>): FormValidationErrors {
  const errors: FormValidationErrors = {};

  const dateCheck = validateMovingDate(data.movingDate || '');
  if (!dateCheck.isValid) {
    errors.movingDate = dateCheck.error;
  }

  if (!data.movingType || data.movingType.trim().length === 0) {
    errors.movingType = 'Please select a moving type';
  }

  return errors;
}

/**
 * Validates Step 3: Name & Mobile
 */
export function validateStep3(data: Partial<LeadFormData>): FormValidationErrors {
  const errors: FormValidationErrors = {};

  const nameCheck = validateCustomerName(data.name || '');
  if (!nameCheck.isValid) {
    errors.name = nameCheck.error;
  }

  const phoneCheck = validateIndianMobile(data.phone || '');
  if (!phoneCheck.isValid) {
    errors.phone = phoneCheck.error;
  }

  return errors;
}

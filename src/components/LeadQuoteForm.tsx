import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Calendar,
  Truck,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Building,
  Home,
  Car,
  Warehouse,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  LeadFormData,
  MOVING_TYPES,
  MovingType,
  FormValidationErrors,
  validateStep1,
  validateStep2,
  validateStep3,
  validateIndianMobile,
} from '../types/lead';
import { submitLead, SubmitLeadResponse } from '../utils/leadService';
import { getEnquiryWhatsAppUrl, getCallUrl } from '../utils/whatsapp';
import { BANGALORE_LOCALITIES, COMPANY_INFO } from '../data/companyData';

interface LeadQuoteFormProps {
  initialMovingType?: string;
  onSuccess?: (leadId: string) => void;
  isCompact?: boolean;
  className?: string;
}

export const LeadQuoteForm: React.FC<LeadQuoteFormProps> = ({
  initialMovingType = 'House Shifting',
  onSuccess,
  isCompact = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<LeadFormData>({
    fromLocation: '',
    toLocation: '',
    movingDate: '',
    movingType: initialMovingType,
    name: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitResult, setSubmitResult] = useState<SubmitLeadResponse | null>(null);

  // Today's date in YYYY-MM-DD format for datepicker min constraint
  const todayString = new Date().toISOString().split('T')[0];

  // Quick bangalore location helpers for rapid mobile input
  const quickLocations = [
    'Basavanagudi',
    'HSR Layout',
    'Koramangala',
    'Whitefield',
    'Indiranagar',
    'Electronic City',
    'JP Nagar',
    'Bellandur',
    'Hebbal',
  ];

  const handleFieldChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for that field if present
    if (errors[field as keyof FormValidationErrors]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field as keyof FormValidationErrors];
        return updated;
      });
    }
  };

  const handleStep1Next = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stepErrors = validateStep1(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  const handleStep2Next = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stepErrors = validateStep2(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3);
  };

  const handleStep3Next = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stepErrors = validateStep3(formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(4);
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Validate entire form once more
    const e1 = validateStep1(formData);
    const e2 = validateStep2(formData);
    const e3 = validateStep3(formData);
    const allErrors = { ...e1, ...e2, ...e3 };

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Move to earliest error step
      if (Object.keys(e1).length > 0) setCurrentStep(1);
      else if (Object.keys(e2).length > 0) setCurrentStep(2);
      else if (Object.keys(e3).length > 0) setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await submitLead(formData);
      if (response.success && response.leadId) {
        setSubmitResult(response);
        setCurrentStep(5); // Success state
        if (onSuccess) onSuccess(response.leadId);
      } else {
        setErrors({ general: response.error || 'Failed to submit quote request. Please try again.' });
      }
    } catch (err: any) {
      setErrors({ general: err.message || 'Network error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fromLocation: '',
      toLocation: '',
      movingDate: '',
      movingType: initialMovingType,
      name: '',
      phone: '',
    });
    setErrors({});
    setSubmitResult(null);
    setCurrentStep(1);
  };

  // Helper for quick date buttons
  const setQuickDate = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    handleFieldChange('movingDate', d.toISOString().split('T')[0]);
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden text-slate-900 ${
        isCompact ? 'p-4 sm:p-6' : 'p-5 sm:p-8'
      } ${className}`}
    >
      {/* Step Indicator Header (Steps 1 to 4) */}
      {currentStep <= 4 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
            <span className="text-orange-600 font-extrabold">
              Step {currentStep} of 4
            </span>
            <span>
              {currentStep === 1 && 'Locations'}
              {currentStep === 2 && 'Schedule & Service'}
              {currentStep === 3 && 'Contact Info'}
              {currentStep === 4 && 'Confirmation'}
            </span>
          </div>

          {/* 4-Step Progress Bar */}
          <div className="grid grid-cols-4 gap-1.5 h-2 w-full bg-slate-100 rounded-full p-0.5">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Global Error Notice */}
      {errors.general && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Multi-Step Animated Form Views */}
      <AnimatePresence mode="wait">
        {/* STEP 1: FROM & TO LOCATIONS */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Where are you moving?
              </h2>
              <p className="text-xs text-slate-500">
                Enter your pickup and delivery areas in Bangalore or pan-India.
              </p>
            </div>

            {/* From Location */}
            <div>
              <label
                htmlFor="fromLocationInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                From Location (Pickup) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-orange-500 pointer-events-none" />
                <input
                  id="fromLocationInput"
                  type="text"
                  placeholder="e.g. HSR Layout, Bangalore"
                  value={formData.fromLocation}
                  onChange={(e) => handleFieldChange('fromLocation', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.fromLocation
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                />
              </div>
              {errors.fromLocation && (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.fromLocation}</span>
                </p>
              )}
            </div>

            {/* Quick Bangalore Suggestions for From Location */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-2">
                Quick Select:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {quickLocations.slice(0, 4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleFieldChange('fromLocation', `${loc}, Bangalore`)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200 text-slate-600 transition-colors"
                  >
                    + {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* To Location */}
            <div>
              <label
                htmlFor="toLocationInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                To Location (Drop / Destination) *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600 pointer-events-none" />
                <input
                  id="toLocationInput"
                  type="text"
                  placeholder="e.g. Whitefield, Bangalore or Mumbai"
                  value={formData.toLocation}
                  onChange={(e) => handleFieldChange('toLocation', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.toLocation
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                />
              </div>
              {errors.toLocation && (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.toLocation}</span>
                </p>
              )}
            </div>

            {/* Step 1 Next Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleStep1Next()}
                className="w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all hover:shadow-orange-600/40"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero spam guarantee • 100% data safe</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 2: DATE & MOVING TYPE */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                When & what are you moving?
              </h2>
              <p className="text-xs text-slate-500">
                Select your preferred shifting date and service category.
              </p>
            </div>

            {/* Moving Date */}
            <div>
              <label
                htmlFor="movingDateInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Preferred Moving Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-orange-500 pointer-events-none" />
                <input
                  id="movingDateInput"
                  type="date"
                  min={todayString}
                  value={formData.movingDate}
                  onChange={(e) => handleFieldChange('movingDate', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.movingDate
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                />
              </div>
              {errors.movingDate && (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.movingDate}</span>
                </p>
              )}

              {/* Quick Date Shortcuts */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 text-slate-600 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 text-slate-600 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(3)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 text-slate-600 transition-colors"
                >
                  In 3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 text-slate-600 transition-colors"
                >
                  Next Week
                </button>
              </div>
            </div>

            {/* Moving Type */}
            <div>
              <label
                htmlFor="movingTypeSelect"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Service / Moving Type *
              </label>
              <div className="relative">
                <Truck className="absolute left-3.5 top-3 w-4 h-4 text-orange-500 pointer-events-none" />
                <select
                  id="movingTypeSelect"
                  value={formData.movingType}
                  onChange={(e) => handleFieldChange('movingType', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all appearance-none ${
                    errors.movingType
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                >
                  {MOVING_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              {errors.movingType && (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.movingType}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => handleStep2Next()}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: NAME & INDIAN PHONE */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Your Contact Details
              </h2>
              <p className="text-xs text-slate-500">
                Where should we send your detailed moving quote breakdown?
              </p>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="nameInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-orange-500 pointer-events-none" />
                <input
                  id="nameInput"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    errors.name
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                      : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Indian Mobile Number */}
            <div>
              <label
                htmlFor="phoneInput"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Mobile Number (10 Digits) *
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-orange-500 pointer-events-none" />
                  <input
                    id="phoneInput"
                    type="tel"
                    maxLength={10}
                    placeholder="98452 01449"
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleFieldChange('phone', val);
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/30'
                        : 'border-slate-300 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                  />
                  {validateIndianMobile(formData.phone).isValid && (
                    <CheckCircle2 className="absolute right-3.5 top-3 w-4 h-4 text-emerald-600 pointer-events-none" />
                  )}
                </div>
              </div>
              {errors.phone ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.phone}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  We will call or WhatsApp your itemized estimate.
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => handleStep3Next()}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30 transition-all"
              >
                <span>Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                Review Your Details
              </h2>
              <p className="text-xs text-slate-500">
                Please verify your moving details before submitting for quotation.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>From:</span>
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                  {formData.fromLocation}
                </span>
              </div>

              <div className="flex items-start justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>To:</span>
                </span>
                <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                  {formData.toLocation}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Moving Date:</span>
                </span>
                <span className="font-semibold text-slate-900">
                  {formData.movingDate}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Moving Type:</span>
                </span>
                <span className="font-semibold text-orange-600">
                  {formData.movingType}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Your Name:</span>
                </span>
                <span className="font-semibold text-slate-900">{formData.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Mobile:</span>
                </span>
                <span className="font-semibold text-slate-900">+91 {formData.phone}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setCurrentStep(3)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalSubmit()}
                className="py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/40 transition-all hover:shadow-orange-600/60 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SUCCESS STATE (Matching mockup screen) */}
        {currentStep === 5 && submitResult && (
          <motion.div
            key="step5-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-4 space-y-5"
          >
            {/* Big Green Badge Checkmark */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                Thank You!
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                Your moving enquiry has been submitted successfully.
              </p>
            </div>

            {/* Highlighted Enquiry ID Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-xs mx-auto shadow-sm">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Enquiry ID
              </div>
              <div className="text-lg sm:text-xl font-mono font-extrabold text-orange-600 select-all mt-0.5">
                {submitResult.leadId}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Our Bangalore move coordinator will contact you shortly with the best quote.
              </p>
            </div>

            {/* Action Buttons: WhatsApp & Call */}
            <div className="space-y-2.5 max-w-xs mx-auto pt-1">
              <a
                href={getEnquiryWhatsAppUrl(submitResult.leadId || '', formData)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={getCallUrl()}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Call Move Coordinator</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Submit Another Enquiry</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

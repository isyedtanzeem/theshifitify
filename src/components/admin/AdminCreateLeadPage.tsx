import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Truck,
  Share2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Zap,
  RefreshCw,
  Lock,
  MessageSquare,
  Building,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MOVING_TYPES, LEAD_SOURCES, AdminLeadRecord } from '../../types/admin';
import { createManualLead } from '../../utils/adminAuth';

interface AdminCreateLeadPageProps {
  onNavigate: (path: string) => void;
}

export const AdminCreateLeadPage: React.FC<AdminCreateLeadPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [movingDate, setMovingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [movingType, setMovingType] = useState<string>('House Shifting');
  const [source, setSource] = useState<string>('Phone Call (Direct Desk Inbound)');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdLead, setCreatedLead] = useState<AdminLeadRecord | null>(null);

  // Quick tags from Stitch screenshot
  const quickTags = [
    { label: 'Elevator Available', icon: Building },
    { label: '3rd Floor (Stairs Only)', icon: Layers },
    { label: 'Delicate / Glassware', icon: Sparkles },
    { label: 'Morning Slot Only', icon: Calendar },
    { label: 'Transit Insurance', icon: Shield },
  ];

  const handleAppendTag = (tag: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag;
      if (trimmed.includes(tag)) return trimmed;
      return `${trimmed}, ${tag}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (email && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please provide a valid email address, or leave it blank.');
        return;
      }
    }

    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!fromLocation.trim()) {
      setError('From (pickup) location is required.');
      return;
    }

    if (!toLocation.trim()) {
      setError('To (drop) location is required.');
      return;
    }

    if (!movingDate) {
      setError('Moving date is required.');
      return;
    }

    setLoading(true);

    const res = await createManualLead({
      name: name.trim(),
      phone: cleanPhone,
      email: email && email.trim().length > 0 ? email.trim() : undefined,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate,
      movingType,
      source: source || 'Phone Call (Direct Desk Inbound)',
      notes: notes && notes.trim().length > 0 ? notes.trim() : undefined,
    });

    setLoading(false);

    if (res.success && res.lead) {
      setCreatedLead(res.lead);
    } else {
      setError(res.error || 'Failed to create lead. Please check the information and try again.');
    }
  };

  const handleReset = () => {
    setName('');
    setPhone('');
    setEmail('');
    setFromLocation('');
    setToLocation('');
    setMovingType('House Shifting');
    setSource('Phone Call (Direct Desk Inbound)');
    setNotes('');
    setError(null);
    setCreatedLead(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in pb-16">
      {/* Top Breadcrumb & Route - Stitch Screenshot 1 */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          id="back-to-leads-btn"
          onClick={() => onNavigate('/admin/leads')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Leads Management</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-500 shadow-2xs">
            <span className="text-slate-400">ROUTE</span> <strong className="text-slate-700">/admin/leads/new</strong>
          </span>
        </div>
      </div>

      {/* Main Header & Auto-Dispatcher Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-base shadow-2xs">
              +
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create New Lead
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manually enter customer inquiries received via phone calls, WhatsApp, walk-in visits, or referrals. A unique Lead ID will be generated automatically and synced to Google Sheets.
          </p>
        </div>

        {/* Auto Dispatcher Badge */}
        <div className="shrink-0 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-blue-100/90 text-blue-700 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              AUTO-DISPATCHER
            </div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Instant Quote Eligible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Syncing Notification Banner - Stitch Screenshot 1 */}
      <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          </div>
          <div>
            <strong className="font-semibold text-slate-900">Auto-Syncing to Shiftify Operations Hub</strong>
            <span className="text-slate-500 hidden sm:inline ml-1">
              • New entries instantly broadcast to desk operators & Google Drive Ledger
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-blue-100">
          Channel: <strong className="text-slate-700">#desk-inbound</strong>
        </span>
      </div>

      {/* Success View */}
      {createdLead && (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-4 animate-in zoom-in-95 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lead Successfully Created &amp; Synced</h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                The lead has been recorded with a unique Lead ID, stored in the CRM desk, synced to your Google Sheet, and emailed to shiftify.leads@gmail.com.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-100 text-xs shadow-2xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Generated Lead ID</span>
              <span className="font-mono font-bold text-orange-600 text-sm">{createdLead.leadId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
              <span className="font-semibold text-slate-900">{createdLead.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
              <span className="font-mono font-semibold text-blue-700">+91 {createdLead.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Initial Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px] inline-block mt-0.5">
                {createdLead.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              id="create-another-lead-btn"
              onClick={handleReset}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Lead</span>
            </button>
            <button
              id="view-created-leads-list-btn"
              onClick={() => onNavigate('/admin/leads')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Go to Leads List</span>
            </button>
          </div>
        </div>
      )}

      {/* Form Steps - Stitch Screenshot 1 */}
      {!createdLead && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: CUSTOMER INFORMATION */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  CUSTOMER INFORMATION
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Customer Full Name <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="manual-customer-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Primary point of contact for relocation</p>
              </div>

              {/* Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Phone Number <span className="text-orange-600">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp Enabled</span>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-bold font-mono">
                    +91
                  </span>
                  <input
                    id="manual-customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98452 01449"
                    maxLength={14}
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">10-digit Indian mobile number</p>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="text-[11px] text-slate-400 italic">Optional</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="manual-customer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Used for sending detailed quotation breakdowns and tracking links</p>
              </div>
            </div>
          </div>

          {/* STEP 2: MOVE & ROUTE SPECIFICATION */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  MOVE &amp; ROUTE SPECIFICATION
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  From (Pickup Location) <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute left-3.5 top-3.5"></span>
                  <input
                    id="manual-from-location"
                    type="text"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="e.g. Basavanagudi, Bangalore"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Specify area, landmark, or apartment complex</p>
              </div>

              {/* Drop Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  To (Drop Location) <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="manual-to-location"
                    type="text"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="e.g. Whitefield, Bangalore or Mumbai, Pune"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Destination city or neighborhood hub</p>
              </div>

              {/* Moving Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Moving Date <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    id="manual-moving-date"
                    type="date"
                    value={movingDate}
                    onChange={(e) => setMovingDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition cursor-pointer"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Tentative or fixed relocation schedule</p>
              </div>

              {/* Moving Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Moving Type <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Truck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <select
                    id="manual-moving-type"
                    value={movingType}
                    onChange={(e) => setMovingType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition cursor-pointer"
                  >
                    {MOVING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Assigns dedicated transport capacity &amp; crew</p>
              </div>
            </div>

            {/* Auto-calculated Corridor Banner - Stitch Screenshot 1 */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Auto-calculated Corridor: <span className="text-orange-700">Bangalore Intra-City</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Estimated Distance: ~24.5 km • Typical Dispatch Transit: 4-6 Hours
                  </div>
                </div>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200/70 text-xs font-bold text-slate-800 shrink-0 self-start sm:self-auto">
                Base Tariff: <span className="text-slate-900">₹ 5,800 - ₹ 8,500</span>
              </div>
            </div>
          </div>

          {/* STEP 3: ACQUISITION SOURCE & OPERATIONAL NOTES */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  ACQUISITION SOURCE &amp; OPERATIONAL NOTES
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Lead Source */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Lead Source <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <select
                    id="manual-lead-source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition cursor-pointer"
                  >
                    {LEAD_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Identifies customer acquisition channel</p>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <div className="px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span>NEW</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Default for manual entries</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Workflow automatically triggers quotation SLA timer</p>
              </div>

              {/* Customer Requirements / Internal Notes */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Customer Requirements / Internal Notes
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {notes.length} / 500 chars
                  </span>
                </div>
                <textarea
                  id="manual-lead-notes"
                  rows={3}
                  value={notes}
                  maxLength={500}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2 BHK household goods + 1 scooter. Wants packing on 3rd floor without elevator. Tentative budget shared."
                  className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">Add specific requirements: floors, elevator access, fragile antiques, packing material needs.</p>
              </div>
            </div>

            {/* Quick Note Tags (Click to append) - Stitch Screenshot 1 */}
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
                QUICK NOTE TAGS (CLICK TO APPEND):
              </div>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => {
                  const Icon = tag.icon;
                  return (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => handleAppendTag(tag.label)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 hover:bg-orange-50 hover:border-orange-200 border border-slate-200/80 text-[11px] font-semibold text-slate-700 hover:text-orange-700 transition shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Bottom Action Bar - Stitch Screenshot 1 */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Encrypted Operational Entry • Handled by Operations Desk</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/admin/leads')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition shadow-2xs"
              >
                Cancel
              </button>
              <button
                id="submit-create-lead-btn"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-xs font-bold text-white shadow-sm shadow-orange-600/20 disabled:opacity-50 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Creating Lead...' : 'Create Lead'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

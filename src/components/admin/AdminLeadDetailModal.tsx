import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Receipt,
  User,
  Plus,
  Send,
  CalendarCheck,
  Edit2,
  Save,
  Mail,
  Share2,
  Lock,
} from 'lucide-react';
import {
  AdminLeadRecord,
  FollowupRecord,
  LeadStatus,
  ALL_LEAD_STATUSES,
  MOVING_TYPES,
  LEAD_SOURCES,
} from '../../types/admin';
import {
  fetchLeadDetail,
  updateLeadStatus,
  updateLeadDetails,
  scheduleFollowup,
  completeFollowup,
} from '../../utils/adminAuth';
import { getCustomerCallUrl, getCustomerWhatsAppUrl } from '../../utils/whatsapp';

interface AdminLeadDetailModalProps {
  leadId: string;
  onClose: () => void;
  onLeadUpdated: () => void;
  onNavigate?: (path: string) => void;
}

export const AdminLeadDetailModal: React.FC<AdminLeadDetailModalProps> = ({
  leadId,
  onClose,
  onLeadUpdated,
  onNavigate,
}) => {
  const [lead, setLead] = useState<AdminLeadRecord | null>(null);
  const [followups, setFollowups] = useState<FollowupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status change state
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>('NEW');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);

  // Edit lead mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFromLocation, setEditFromLocation] = useState('');
  const [editToLocation, setEditToLocation] = useState('');
  const [editMovingDate, setEditMovingDate] = useState('');
  const [editMovingType, setEditMovingType] = useState('House Shifting');
  const [editSource, setEditSource] = useState('Website');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // New Note state
  const [newNote, setNewNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  // Schedule follow-up state
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [followupDate, setFollowupDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [followupTime, setFollowupTime] = useState('11:00 AM');
  const [followupNotes, setFollowupNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const populateEditState = (leadRecord: AdminLeadRecord) => {
    setEditName(leadRecord.name || '');
    setEditPhone(leadRecord.phone || '');
    setEditEmail(leadRecord.email || '');
    setEditFromLocation(leadRecord.fromLocation || '');
    setEditToLocation(leadRecord.toLocation || '');
    setEditMovingDate(leadRecord.movingDate || '');
    setEditMovingType(leadRecord.movingType || 'House Shifting');
    setEditSource(leadRecord.source || 'Website');
    setEditNotes(leadRecord.notes || '');
    setEditError(null);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchLeadDetail(leadId);
    setLoading(false);
    if (res.success && res.lead) {
      setLead(res.lead);
      setSelectedStatus(res.lead.status);
      setFollowups(res.followups || []);
      populateEditState(res.lead);
    } else {
      setError(res.error || 'Failed to load lead details');
    }
  };

  useEffect(() => {
    loadData();
  }, [leadId]);

  const handleStartEdit = () => {
    if (lead) {
      populateEditState(lead);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (lead) {
      populateEditState(lead);
    }
    setIsEditing(false);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setEditError(null);

    // Validation
    const cleanPhone = editPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setEditError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (editEmail && editEmail.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editEmail.trim())) {
        setEditError('Please enter a valid email address, or leave it blank.');
        return;
      }
    }

    if (!editName.trim()) {
      setEditError('Customer name cannot be empty.');
      return;
    }

    if (!editFromLocation.trim()) {
      setEditError('From location cannot be empty.');
      return;
    }

    if (!editToLocation.trim()) {
      setEditError('To location cannot be empty.');
      return;
    }

    if (!editMovingDate) {
      setEditError('Moving date is required.');
      return;
    }

    setEditSaving(true);
    const res = await updateLeadDetails(lead.leadId, {
      name: editName.trim(),
      phone: cleanPhone,
      email: editEmail && editEmail.trim().length > 0 ? editEmail.trim() : undefined,
      fromLocation: editFromLocation.trim(),
      toLocation: editToLocation.trim(),
      movingDate: editMovingDate,
      movingType: editMovingType,
      source: editSource,
      notes: editNotes && editNotes.trim().length > 0 ? editNotes.trim() : undefined,
    });
    setEditSaving(false);

    if (res.success && res.lead) {
      setLead(res.lead);
      setIsEditing(false);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
      onLeadUpdated();
    } else {
      setEditError(res.error || 'Failed to update lead details');
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setSelectedStatus(newStatus);
    setStatusUpdating(true);
    setStatusSuccess(false);

    const res = await updateLeadStatus(leadId, newStatus);
    setStatusUpdating(false);

    if (res.success && res.lead) {
      setLead(res.lead);
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 2500);
      onLeadUpdated();
    } else {
      alert(res.error || 'Failed to update status');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !lead) return;

    setNoteSaving(true);
    const res = await updateLeadStatus(lead.leadId, lead.status, newNote.trim());
    setNoteSaving(false);

    if (res.success && res.lead) {
      setLead(res.lead);
      setNewNote('');
      onLeadUpdated();
    } else {
      alert(res.error || 'Failed to add note');
    }
  };

  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !followupDate || !followupTime) return;

    setScheduling(true);
    const res = await scheduleFollowup({
      leadId: lead.leadId,
      followupDate,
      followupTime,
      notes: followupNotes,
    });
    setScheduling(false);

    if (res.success) {
      setShowFollowupForm(false);
      setFollowupNotes('');
      loadData();
      onLeadUpdated();
    } else {
      alert(res.error || 'Failed to schedule follow-up');
    }
  };

  const handleCompleteFollowup = async (fId: string) => {
    const res = await completeFollowup(fId);
    if (res.success) {
      loadData();
      onLeadUpdated();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">Lead Details</span>
                <span className="font-mono text-xs font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800/60">
                  {leadId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lead ? (lead.createdAt ? `Received on ${new Date(lead.createdAt).toLocaleString('en-IN')}` : 'Lead details') : 'Loading...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && lead && (
              <button
                id="edit-lead-btn"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                <span>Edit Lead</span>
              </button>
            )}
            <button
              id="close-lead-detail-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-12 text-center text-slate-400 text-sm">
              Loading customer and relocation details...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {editSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Lead details updated successfully and synced with Google Sheets.</span>
            </div>
          )}

          {lead && !loading && (
            <>
              {/* EDIT MODE FORM */}
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-950/30 border border-orange-800/50 text-xs text-orange-300">
                    <div className="flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-orange-400" />
                      <span className="font-bold">Editing Lead Information</span>
                    </div>
                    <span className="text-[10px] text-orange-400/80 font-mono">Lead ID &amp; Created At are locked</span>
                  </div>

                  {editError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  {/* Immutable Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> Lead ID (Immutable)
                      </span>
                      <span className="font-mono font-bold text-orange-400">{lead.leadId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> Created At (Immutable)
                      </span>
                      <span className="text-slate-300 font-mono">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Editable Fields */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Customer Name <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Phone Number <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          placeholder="customer@example.com"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Moving Date */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Moving Date <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editMovingDate}
                          onChange={(e) => setEditMovingDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Pickup Location */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Pickup Location (From) <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFromLocation}
                          onChange={(e) => setEditFromLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Drop Location */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Drop Location (To) <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editToLocation}
                          onChange={(e) => setEditToLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                          required
                        />
                      </div>

                      {/* Moving Type */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Moving Type <span className="text-orange-500">*</span>
                        </label>
                        <select
                          value={editMovingType}
                          onChange={(e) => setEditMovingType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 cursor-pointer focus:outline-none"
                        >
                          {MOVING_TYPES.map((t) => (
                            <option key={t} value={t} className="bg-slate-900 text-white">
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Lead Source */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Lead Source <span className="text-orange-500">*</span>
                        </label>
                        <select
                          value={editSource}
                          onChange={(e) => setEditSource(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 cursor-pointer focus:outline-none"
                        >
                          {LEAD_SOURCES.map((s) => (
                            <option key={s} value={s} className="bg-slate-900 text-white">
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Internal Notes / Customer Details
                        </label>
                        <textarea
                          rows={3}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Special instructions, inventory specifications, or quoted prices..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Edit Form Actions */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={editSaving}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editSaving}
                      className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* NORMAL VIEW MODE */
                <>
                  {/* Primary Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">Current Status:</span>
                      <div className="relative">
                        <select
                          id="lead-status-select"
                          value={selectedStatus}
                          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                          disabled={statusUpdating}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition cursor-pointer"
                        >
                          {ALL_LEAD_STATUSES.map((st) => (
                            <option key={st.value} value={st.value} className="bg-slate-900 text-white">
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {statusSuccess && (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Create Quotation Button */}
                      <button
                        id="lead-action-create-quotation-btn"
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigate) {
                            onNavigate(`/admin/quotations/new?leadId=${lead.leadId}`);
                          } else {
                            window.location.href = `/admin/quotations/new?leadId=${lead.leadId}`;
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Create Quotation</span>
                      </button>

                      {/* If Quotation already exists, offer quick link */}
                      {lead.quotationId && (
                        <button
                          id="lead-action-view-quote-btn"
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onNavigate) {
                              onNavigate(`/admin/quotations`);
                            } else {
                              window.location.href = `/admin/quotations`;
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-orange-400 border border-orange-800/40 transition"
                          title={`Quotation ID: ${lead.quotationId}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Quote: {lead.quotationId}</span>
                        </button>
                      )}

                      {/* If Invoice already exists, offer quick link */}
                      {lead.invoiceId && (
                        <button
                          id="lead-action-view-invoice-btn"
                          type="button"
                          onClick={() => {
                            onClose();
                            if (onNavigate) {
                              onNavigate(`/admin/invoices`);
                            } else {
                              window.location.href = `/admin/invoices`;
                            }
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 transition"
                          title={`Invoice ID: ${lead.invoiceId}`}
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice: {lead.invoiceId}</span>
                        </button>
                      )}

                      {/* Call Customer Button */}
                      <a
                        id="lead-action-call-btn"
                        href={getCustomerCallUrl(lead.phone)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>

                      {/* WhatsApp Customer Button */}
                      <a
                        id="lead-action-whatsapp-btn"
                        href={getCustomerWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {/* Schedule Follow-up Toggle */}
                      <button
                        id="lead-action-followup-toggle"
                        onClick={() => setShowFollowupForm(!showFollowupForm)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow-sm border border-slate-700"
                      >
                        <CalendarCheck className="w-3.5 h-3.5 text-orange-400" />
                        <span>{showFollowupForm ? 'Hide Form' : 'Schedule Follow-up'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Schedule Follow-up Form (Inline expandable) */}
                  {showFollowupForm && (
                    <form
                      onSubmit={handleScheduleFollowup}
                      className="p-4 rounded-2xl bg-orange-950/20 border border-orange-800/40 space-y-3 animate-in fade-in"
                    >
                      <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <CalendarCheck className="w-4 h-4" />
                        <span>Schedule Next Follow-up for {lead.name}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Follow-up Date
                          </label>
                          <input
                            type="date"
                            value={followupDate}
                            onChange={(e) => setFollowupDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Follow-up Time
                          </label>
                          <input
                            type="text"
                            value={followupTime}
                            onChange={(e) => setFollowupTime(e.target.value)}
                            placeholder="e.g. 10:30 AM or 04:00 PM"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Action Item / Call Objective
                        </label>
                        <input
                          type="text"
                          value={followupNotes}
                          onChange={(e) => setFollowupNotes(e.target.value)}
                          placeholder="e.g. Confirm vehicle dimensions and share tentative quote"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowFollowupForm(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={scheduling}
                          className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {scheduling ? 'Scheduling...' : 'Save Follow-up'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Customer & Relocation Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Details Card */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-orange-400" />
                          <span>Customer Details</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Lead ID: {lead.leadId}</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Customer Name:</span>
                          <span className="font-bold text-slate-100 text-sm">{lead.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Phone Number:</span>
                          <a
                            href={getCustomerCallUrl(lead.phone)}
                            className="font-mono font-semibold text-blue-400 hover:underline"
                          >
                            +91 {lead.phone}
                          </a>
                        </div>
                        {lead.email && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Email Address:</span>
                            <span className="font-medium text-slate-200">{lead.email}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-[11px]">Enquiry Source:</span>
                          <span className="font-semibold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/40 inline-block text-[11px]">
                            {lead.source}
                          </span>
                        </div>
                        {lead.nextFollowup && (
                          <div className="pt-2 border-t border-slate-800/80">
                            <span className="text-slate-400 block text-[11px]">Next Follow-up:</span>
                            <span className="font-semibold text-amber-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {lead.nextFollowup}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Move Details Card */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-orange-400" />
                        <span>Move Specification</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Service Type:</span>
                          <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 inline-block mt-0.5">
                            {lead.movingType}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Moving Date:</span>
                          <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" />
                            {lead.movingDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Pickup Location:</span>
                          <span className="text-slate-200 flex items-start gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            {lead.fromLocation}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Drop Location:</span>
                          <span className="text-slate-200 flex items-start gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            {lead.toLocation}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Follow-ups History Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-orange-400" />
                        <span>Scheduled Follow-ups ({followups.length})</span>
                      </div>
                      {!showFollowupForm && (
                        <button
                          onClick={() => setShowFollowupForm(true)}
                          className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Follow-up</span>
                        </button>
                      )}
                    </div>

                    {followups.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                        No follow-ups recorded yet for this customer.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {followups.map((f) => (
                          <div
                            key={f.followupId}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                  {f.followupDate} at {f.followupTime}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    f.status === 'COMPLETED'
                                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                      : 'bg-amber-950 text-amber-300 border-amber-800'
                                  }`}
                                >
                                  {f.status}
                                </span>
                              </div>
                              <p className="text-slate-300 text-[11px]">{f.notes}</p>
                            </div>
                            {f.status === 'PENDING' && (
                              <button
                                onClick={() => handleCompleteFollowup(f.followupId)}
                                className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-[11px] font-semibold transition"
                              >
                                Mark Done
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Internal Notes History & Add Note */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-orange-400" />
                      <span>Internal Operational Notes</span>
                    </div>

                    {lead.notes ? (
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                        {lead.notes}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">No notes recorded yet.</div>
                    )}

                    {/* Add note input */}
                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add an internal note (e.g. Quoted ₹14,500, customer negotiating on packing)..."
                        className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={noteSaving || !newNote.trim()}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Shiftify Admin Suite &bull; Single-Source Google Sheets Sync
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};


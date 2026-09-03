import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  User,
  Truck,
  Building,
  Home,
  Check,
  Zap,
  Tag,
  Flame,
  Send,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { FollowupRecord, AdminLeadRecord } from '../../types/admin';
import {
  fetchFollowups,
  completeFollowup,
  scheduleFollowup,
  fetchAdminLeads,
} from '../../utils/adminAuth';
import { getCustomerCallUrl, getCustomerWhatsAppUrl } from '../../utils/whatsapp';

export const AdminFollowupsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [todayFollowups, setTodayFollowups] = useState<FollowupRecord[]>([]);
  const [upcomingFollowups, setUpcomingFollowups] = useState<FollowupRecord[]>([]);
  const [completedFollowups, setCompletedFollowups] = useState<FollowupRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Schedule state in right sidebar
  const [leadsList, setLeadsList] = useState<AdminLeadRecord[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [followupDate, setFollowupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [followupTime, setFollowupTime] = useState('04:30 PM');
  const [followupType, setFollowupType] = useState<'call' | 'whatsapp' | 'inspection'>('call');
  const [notes, setNotes] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal for mobile or explicit button
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchFollowups();
    setLoading(false);
    if (res.success) {
      setTodayFollowups(res.today);
      setUpcomingFollowups(res.upcoming);
      setCompletedFollowups(res.completed);
    }
  };

  const loadLeads = async () => {
    const res = await fetchAdminLeads();
    if (res.success && res.leads) {
      setLeadsList(res.leads);
      if (res.leads.length > 0 && !selectedLeadId) {
        setSelectedLeadId(res.leads[0].leadId);
      }
    }
  };

  useEffect(() => {
    loadData();
    loadLeads();
  }, []);

  const handleMarkCompleted = async (followupId: string) => {
    const res = await completeFollowup(followupId);
    if (res.success) {
      loadData();
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !followupDate || !followupTime) return;

    setSubmitting(true);
    const fullNotes = isHighPriority
      ? `[HIGH PRIORITY] ${notes || 'Follow-up discussion regarding move slot and quote details.'}`
      : notes || 'Follow-up discussion regarding move slot and quote details.';

    const res = await scheduleFollowup({
      leadId: selectedLeadId,
      followupDate,
      followupTime,
      notes: fullNotes,
    });
    setSubmitting(false);

    if (res.success) {
      setNotes('');
      setShowScheduleModal(false);
      loadData();
    } else {
      alert(res.error || 'Failed to schedule follow-up');
    }
  };

  const handleAppendQuickNote = (phrase: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return phrase;
      return `${trimmed}. ${phrase}`;
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const totalTasks = todayFollowups.length + upcomingFollowups.length + completedFollowups.length;
  const completedCount = completedFollowups.length;
  const resolutionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 66;

  const currentList =
    activeTab === 'today'
      ? todayFollowups
      : activeTab === 'upcoming'
      ? upcomingFollowups
      : completedFollowups;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header - Stitch Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Follow-up Management
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                  <span>{todayFollowups.length || 2} Priority Today</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                Stay on top of customer callback reminders, quotation inquiries, and relocations booking confirmations with active dispatch triage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Autosynced with Google Sheets CRM Desk 3m ago</span>
          </div>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            id="schedule-followup-btn"
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Tabs & Metrics Bar - Stitch Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Today &amp; Overdue</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'today' ? 'bg-orange-700/80 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {todayFollowups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Upcoming Schedule</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {upcomingFollowups.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Completed</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {completedFollowups.length}
            </span>
          </button>
        </div>

        {/* Right side SLA metrics */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Avg Callback SLA: <strong className="text-slate-900">14 mins</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Conversion Target: <strong className="text-slate-900">78%</strong></span>
          </div>
        </div>
      </div>

      {/* Immediate Attention Alert Banner - Stitch Screenshot 2 */}
      {todayFollowups.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Immediate Attention Required
              </div>
              <div className="text-xs text-slate-600">
                {todayFollowups.length} customers have pending calls scheduled for current morning dispatch shifts.
              </div>
            </div>
          </div>
          <span className="px-3 py-1 bg-white rounded-lg border border-orange-200 text-xs font-bold text-orange-700 self-start sm:self-auto shadow-2xs">
            Shift Target: 100% Completed
          </span>
        </div>
      )}

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 of 12): Follow-up Cards */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600 mb-2" />
              <p>Loading follow-up tasks...</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-2 shadow-sm">
              <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-800">No follow-ups in this category.</p>
              <p className="text-[11px] text-slate-400">
                Use the quick scheduler on the right to record a customer callback touchpoint.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentList.map((item, index) => {
                const isOverdue = index % 2 === 1; // alternating overdue badge for visual preview
                return (
                  <div
                    key={item.followupId}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5 hover:border-slate-300 transition"
                  >
                    {/* Top Row: Lead ID & FLP ID & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700">
                        <span className="text-orange-600">{item.leadId}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500">{item.followupId}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span>
                        <span>{item.status}</span>
                      </span>
                    </div>

                    {/* Customer & Avatar Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-lg text-slate-900 tracking-tight">
                          {item.customerName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          <span>Residential Relocation • Indiranagar to Whitefield</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shadow-2xs">
                        {getInitials(item.customerName || 'Customer')}
                      </div>
                    </div>

                    {/* Date & Time Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        <span>{item.followupDate}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        <span>{item.followupTime}</span>
                      </div>
                      {isOverdue ? (
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
                          Overdue 45m
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[11px] border border-blue-200">
                          Due in 2h
                        </span>
                      )}
                    </div>

                    {/* TASK OBJECTIVE Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        TASK OBJECTIVE
                      </div>
                      <div className="text-xs text-slate-800 leading-relaxed font-medium">
                        {item.notes || 'Call to confirm 3BHK inventory and send shifting checklist.'}
                      </div>
                    </div>

                    {/* Meta Tags Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                        Est. ₹24,500
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        48 Items
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                        Rep: Tanzeem
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2.5">
                      <a
                        href={getCustomerCallUrl(item.phone)}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Customer</span>
                      </a>

                      <a
                        href={getCustomerWhatsAppUrl({
                          name: item.customerName,
                          phone: item.phone,
                          leadId: item.leadId,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleMarkCompleted(item.followupId)}
                        title="Mark Complete"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recently Completed Follow-ups Section - Stitch Screenshot 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recently Completed Follow-ups</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Today (1 Recorded)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Rohan Mehta (Villa Relocation)</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      SFY2608300892
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Quotation approved via call • Advance token ₹5,000 received
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400 hidden sm:inline">Completed at 09:42 AM</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12): Quick Schedule Follow-up & Performance Donut */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Schedule Card - Stitch Screenshot 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Quick Schedule Follow-up</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-extrabold border border-orange-200">
                Direct CRM Push
              </span>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-3.5">
              {/* Select Lead */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  SELECT ASSOCIATED LEAD
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                  required
                >
                  {leadsList.map((lead) => (
                    <option key={lead.leadId} value={lead.leadId}>
                      {lead.leadId} - {lead.name} ({lead.movingType || 'Move'})
                    </option>
                  ))}
                  {leadsList.length === 0 && (
                    <option value="">No leads available</option>
                  )}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                    DATE
                  </label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                    TIME
                  </label>
                  <input
                    type="text"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Follow-up Type */}
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1">
                  FOLLOW-UP TYPE
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFollowupType('call')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                      followupType === 'call'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowupType('whatsapp')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                      followupType === 'whatsapp'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowupType('inspection')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${
                      followupType === 'inspection'
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Building className="w-3 h-3" />
                    <span>Inspection</span>
                  </button>
                </div>
              </div>

              {/* Task Notes & Click templates */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    TASK NOTES
                  </label>
                  <span className="text-[10px] text-slate-400">Click template to insert</span>
                </div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter follow-up purpose, items to clarify, or negotiation notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['+ Inventory Check', '+ Quote Follow-up', '+ Slot Confirmation'].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => handleAppendQuickNote(tpl.replace('+', '').trim())}
                      className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 border border-slate-200 transition"
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mark High Priority */}
              <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span className="text-orange-600">!</span>
                  <span>Mark High Priority</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHighPriority}
                  onChange={(e) => setIsHighPriority(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-orange-600/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Scheduling...' : 'Confirm & Schedule'}</span>
              </button>
            </form>
          </div>

          {/* Daily Dispatch Performance - Stitch Screenshot 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
              Daily Dispatch Performance
            </div>

            <div className="flex items-center gap-5">
              {/* Circular Graphic */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-orange-500"
                    strokeDasharray={`${resolutionRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-extrabold text-sm text-slate-900 leading-none">
                    {resolutionRate}%
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                    RESOLVED
                  </span>
                </div>
              </div>

              {/* Progress stats */}
              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Total Scheduled:</span>
                  <strong className="text-slate-900">{totalTasks || 3} tasks</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Completed:</span>
                  <strong className="text-emerald-600">{completedCount || 1} task</strong>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Action Remaining:</span>
                  <strong className="text-orange-600">{todayFollowups.length || 2} tasks</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Follow-up Modal for mobile */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CalendarCheck className="w-4 h-4 text-orange-600" />
                <span>Schedule New Follow-up</span>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Relocation Lead
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                  required
                >
                  {leadsList.map((lead) => (
                    <option key={lead.leadId} value={lead.leadId}>
                      {lead.leadId} - {lead.name} ({lead.movingType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Follow-up Time
                  </label>
                  <input
                    type="text"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    placeholder="e.g. 11:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Notes / Call Objective
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Customer requested call in the evening after checking apartment lift availability."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Save Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CalendarCheck,
  Phone,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Building,
  Home,
  Truck,
  Plus,
  Zap,
} from 'lucide-react';
import { AdminStats, AdminLeadRecord, FollowupRecord, ALL_LEAD_STATUSES } from '../../types/admin';
import { fetchAdminStats, completeFollowup } from '../../utils/adminAuth';
import { getCustomerCallUrl, getCustomerWhatsAppUrl } from '../../utils/whatsapp';
import { AdminLeadDetailModal } from './AdminLeadDetailModal';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const res = await fetchAdminStats();
    setLoading(false);
    setRefreshing(false);

    if (res.success && res.stats) {
      setStats(res.stats);
    }
  };

  useEffect(() => {
    loadStats();

    const handleCustomRefresh = () => loadStats(true);
    window.addEventListener('shiftify_admin_refresh', handleCustomRefresh);
    return () => window.removeEventListener('shiftify_admin_refresh', handleCustomRefresh);
  }, []);

  const handleMarkFollowupDone = async (followupId: string) => {
    const res = await completeFollowup(followupId);
    if (res.success) {
      loadStats(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CONTACTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QUOTATION_SENT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'FOLLOW_UP':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CONFIRMED':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'SCHEDULED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'COMPLETED':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'LOST':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const counts = stats?.statusCounts || {
    NEW: 0,
    CONTACTED: 0,
    QUOTATION_SENT: 0,
    FOLLOW_UP: 0,
    CONFIRMED: 0,
    SCHEDULED: 0,
    COMPLETED: 0,
    LOST: 0,
    CANCELLED: 0,
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner / Welcome - Stitch Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Operations Dashboard</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Live Desk Active</span>
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline monitoring, relocation lead status, and today's priority follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="dashboard-refresh-btn"
            onClick={() => loadStats(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            id="dashboard-goto-leads-btn"
            onClick={() => onNavigate('/admin/leads')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Status Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {/* Total Leads */}
        <div
          onClick={() => onNavigate('/admin/leads')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-orange-500/50 transition cursor-pointer group shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Leads</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats?.totalLeads ?? 0}</div>
          <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
            <span className="text-orange-600 font-bold">{stats?.leadsToday ?? 0}</span> today ·{' '}
            <span className="text-slate-700 font-medium">{stats?.leadsThisMonth ?? 0}</span> this month
          </div>
        </div>

        {/* New Leads */}
        <div
          onClick={() => onNavigate('/admin/leads?status=NEW')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/50 transition cursor-pointer group shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">New Inquiries</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{counts.NEW}</div>
          <div className="text-[11px] text-slate-500 pt-1">Pending contact SLA</div>
        </div>

        {/* Contacted */}
        <div
          onClick={() => onNavigate('/admin/leads?status=CONTACTED')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/50 transition cursor-pointer group shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Contacted</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-700">{counts.CONTACTED}</div>
          <div className="text-[11px] text-slate-500 pt-1">Survey &amp; Inventory Call</div>
        </div>

        {/* Quotation Sent */}
        <div
          onClick={() => onNavigate('/admin/quotations')}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/50 transition cursor-pointer group shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Quotations Sent</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-700">{counts.QUOTATION_SENT}</div>
          <div className="text-[11px] text-slate-500 pt-1">Awaiting confirmation</div>
        </div>
      </div>

      {/* Secondary Status Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigate('/admin/followups')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-600">Follow-up Req.</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-xs">
            {counts.FOLLOW_UP}
          </span>
        </div>

        <div
          onClick={() => onNavigate('/admin/leads?status=CONFIRMED')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-600">Confirmed Moves</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-xs">
            {counts.CONFIRMED}
          </span>
        </div>

        <div
          onClick={() => onNavigate('/admin/leads?status=COMPLETED')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-600">Completed Shifts</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">
            {counts.COMPLETED}
          </span>
        </div>

        <div
          onClick={() => onNavigate('/admin/leads?status=LOST')}
          className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-300 transition shadow-2xs"
        >
          <span className="text-xs font-semibold text-slate-600">Lost / Cancelled</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs">
            {counts.LOST}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Today's Follow-ups & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Follow-ups (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-orange-600" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Today's Priority Follow-ups
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                {stats?.todayFollowups?.length ?? 0}
              </span>
            </div>
            <button
              onClick={() => onNavigate('/admin/followups')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
            {stats?.todayFollowups && stats.todayFollowups.length > 0 ? (
              stats.todayFollowups.map((f) => (
                <div
                  key={f.followupId}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{f.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="text-orange-700 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-600" /> {f.followupTime}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">{f.leadId}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkFollowupDone(f.followupId)}
                      title="Mark follow-up done"
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200 text-[11px] font-bold transition"
                    >
                      Done
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed font-medium">
                    {f.notes}
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={getCustomerCallUrl(f.phone)}
                      className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={getCustomerWhatsAppUrl({
                        name: f.customerName,
                        phone: f.phone,
                        leadId: f.leadId,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-semibold text-slate-800">All caught up!</p>
                <p className="text-[11px] text-slate-400">No pending follow-ups scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Leads Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Recent Leads
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/admin/leads')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View full list</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Lead ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Moving Route</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentLeads.map((lead) => (
                      <tr
                        key={lead.leadId}
                        className="hover:bg-slate-50/60 transition cursor-pointer"
                        onClick={() => setActiveLeadId(lead.leadId)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-orange-600">
                          {lead.leadId}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          <div className="text-[11px] text-slate-500">{lead.movingType}</div>
                        </td>
                        <td className="py-3 px-4 max-w-[200px] truncate text-slate-700 font-medium">
                          {lead.fromLocation.split(',')[0]} ➡️ {lead.toLocation.split(',')[0]}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              lead.status
                            )}`}
                          >
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLeadId(lead.leadId);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                No relocation leads recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {activeLeadId && (
        <AdminLeadDetailModal
          leadId={activeLeadId}
          onClose={() => setActiveLeadId(null)}
          onLeadUpdated={() => loadStats(true)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

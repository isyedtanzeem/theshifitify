import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  MessageSquare,
  Eye,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Truck,
  Users,
  Plus,
  Mail,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  AdminLeadRecord,
  LeadStatus,
  ALL_LEAD_STATUSES,
  LEAD_SOURCES,
  MOVING_TYPES,
} from '../../types/admin';
import { fetchAdminLeads, updateLeadStatus } from '../../utils/adminAuth';
import { getCustomerCallUrl, getCustomerWhatsAppUrl } from '../../utils/whatsapp';
import { AdminLeadDetailModal } from './AdminLeadDetailModal';

interface AdminLeadsListProps {
  initialStatusFilter?: string;
  onNavigate?: (path: string) => void;
}

export const AdminLeadsList: React.FC<AdminLeadsListProps> = ({
  initialStatusFilter,
  onNavigate,
}) => {
  const [leads, setLeads] = useState<AdminLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [movingTypeFilter, setMovingTypeFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [movingDateFilter, setMovingDateFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    const res = await fetchAdminLeads({
      search: searchQuery,
      status: statusFilter,
      source: sourceFilter !== 'ALL' ? sourceFilter : undefined,
      movingType: movingTypeFilter !== 'ALL' ? movingTypeFilter : undefined,
      movingDate: movingDateFilter || undefined,
      dateFilter: dateFilter,
      sort: sortOrder,
    });
    setLoading(false);
    if (res.success) {
      setLeads(res.leads);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter, sourceFilter, movingTypeFilter, dateFilter, movingDateFilter, sortOrder]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeads();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleQuickStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const res = await updateLeadStatus(leadId, newStatus);
    if (res.success && res.lead) {
      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId ? { ...l, status: newStatus } : l))
      );
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setSourceFilter('ALL');
    setMovingTypeFilter('ALL');
    setDateFilter('all');
    setMovingDateFilter('');
    setSortOrder('newest');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    sourceFilter !== 'ALL' ||
    movingTypeFilter !== 'ALL' ||
    dateFilter !== 'all' ||
    movingDateFilter !== '' ||
    sortOrder !== 'newest';

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

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Header - Stitch Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Leads Management</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {leads.length} {leads.length === 1 ? 'Record' : 'Records'}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse, search, update status, edit moving specifications, and connect with customers directly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Refresh Leads button */}
          <button
            id="admin-refresh-leads-btn"
            onClick={() => loadLeads()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            title="Refresh Leads from Storage & Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          {/* [ + Create Lead ] Button */}
          <button
            id="admin-create-lead-btn"
            onClick={() => {
              if (onNavigate) {
                onNavigate('/admin/leads/new');
              } else if (typeof window !== 'undefined') {
                window.location.href = '/admin/leads/new';
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar - Stitch Style */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
        {/* Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              id="admin-lead-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Lead ID, Customer Name, Phone, Email, Location..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 transition"
            />
          </div>

          {/* Lead Source Filter */}
          <div className="md:col-span-3">
            <select
              id="admin-filter-source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Acquisition Sources</option>
              {LEAD_SOURCES.map((s) => (
                <option key={s} value={s}>
                  Source: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-3">
            <select
              id="admin-sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest Created</option>
              <option value="oldest">Sort: Oldest Created</option>
              <option value="moving_date">Sort: Moving Date (Upcoming First)</option>
              <option value="moving_date_desc">Sort: Moving Date (Latest First)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row: Service, Moving Date, Created Date, Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-1">
          {/* Moving Type */}
          <div className="md:col-span-4">
            <select
              id="admin-filter-moving-type"
              value={movingTypeFilter}
              onChange={(e) => setMovingTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 cursor-pointer"
            >
              <option value="ALL">All Service Types</option>
              {MOVING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Moving Date */}
          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="admin-filter-moving-date"
                type="date"
                value={movingDateFilter}
                onChange={(e) => setMovingDateFilter(e.target.value)}
                title="Filter by Moving Date"
                className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500"
              />
            </div>
            {movingDateFilter && (
              <button
                onClick={() => setMovingDateFilter('')}
                title="Clear moving date filter"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Created Filter */}
          <div className="md:col-span-3">
            <select
              id="admin-filter-date-range"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 cursor-pointer"
            >
              <option value="all">Created: All Time</option>
              <option value="today">Created: Today</option>
              <option value="this_week">Created: This Week</option>
              <option value="this_month">Created: This Month</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-1 flex items-center justify-end">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="w-full py-2 px-2 text-[11px] font-bold text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl flex items-center justify-center gap-1 transition"
                title="Clear all active filters"
              >
                <X className="w-3.5 h-3.5" />
                <span className="md:hidden lg:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Pills Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            All Statuses
          </button>
          {ALL_LEAD_STATUSES.map((st) => (
            <button
              key={st.value}
              onClick={() => setStatusFilter(st.value)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border cursor-pointer ${
                statusFilter === st.value
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600 mb-2" />
            Loading Shiftify leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-800">No leads found matching current criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">LEAD ID</th>
                  <th className="py-3.5 px-4">CUSTOMER DETAILS</th>
                  <th className="py-3.5 px-4">RELOCATION ROUTE</th>
                  <th className="py-3.5 px-4">MOVING DATE</th>
                  <th className="py-3.5 px-4">STATUS &amp; ACTION</th>
                  <th className="py-3.5 px-4 text-right">INSTANT ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.leadId}
                    onClick={() => setSelectedLeadId(lead.leadId)}
                    className="hover:bg-slate-50/60 transition cursor-pointer group"
                  >
                    {/* Lead ID */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-bold text-orange-600 group-hover:underline">
                        {lead.leadId}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>

                    {/* Customer Details */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <a
                          href={getCustomerCallUrl(lead.phone)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-blue-700 hover:underline font-semibold"
                        >
                          +91 {lead.phone}
                        </a>
                      </div>
                      {lead.email && (
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{lead.email}</span>
                        </div>
                      )}
                      <div className="mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                          <Share2 className="w-2.5 h-2.5" />
                          {lead.source}
                        </span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4 align-top max-w-[240px]">
                      <div className="text-slate-800 font-semibold truncate flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>{lead.fromLocation}</span>
                      </div>
                      <div className="text-slate-700 truncate flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span>{lead.toLocation}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 inline-block font-bold">
                          {lead.movingType}
                        </span>
                      </div>
                    </td>

                    {/* Moving Date */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-600" />
                        <span>{lead.movingDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {lead.nextFollowup ? (
                          <span className="text-amber-800 font-semibold">
                            Follow-up: {lead.nextFollowup}
                          </span>
                        ) : (
                          <span>No follow-up set</span>
                        )}
                      </div>
                    </td>

                    {/* Status & Quick Change */}
                    <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          {lead.status.replace('_', ' ')}
                        </span>

                        <div>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleQuickStatusChange(lead.leadId, e.target.value as LeadStatus)
                            }
                            className="text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
                          >
                            {ALL_LEAD_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>

                    {/* Instant Actions */}
                    <td className="py-3.5 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getCustomerCallUrl(lead.phone)}
                          title="Call Customer"
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 transition shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getCustomerWhatsAppUrl(lead)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Message on WhatsApp"
                          className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-200 transition shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setSelectedLeadId(lead.leadId)}
                          title="View & Edit Full Lead Details"
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600 mb-2" />
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No leads match your filter.</div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.leadId}
              onClick={() => setSelectedLeadId(lead.leadId)}
              className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 cursor-pointer shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-xs font-bold text-orange-600">{lead.leadId}</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.movingType}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                    lead.status
                  )}`}
                >
                  {lead.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="text-slate-800 flex items-start gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <span className="truncate">From: {lead.fromLocation}</span>
                </div>
                <div className="text-slate-800 flex items-start gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                  <span className="truncate">To: {lead.toLocation}</span>
                </div>
                <div className="text-slate-500 flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>Moving Date: <b className="text-slate-800">{lead.movingDate}</b></span>
                </div>
                {lead.email && (
                  <div className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lead.email}</span>
                  </div>
                )}
                <div className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                  <Share2 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Source: <b className="text-slate-700">{lead.source}</b></span>
                </div>
              </div>

              <div
                className="flex items-center gap-2 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={getCustomerCallUrl(lead.phone)}
                  className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <a
                  href={getCustomerWhatsAppUrl(lead)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  onClick={() => setSelectedLeadId(lead.leadId)}
                  className="px-3 py-2 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200"
                >
                  Details / Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lead Detail Modal with full view and editing */}
      {selectedLeadId && (
        <AdminLeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onLeadUpdated={() => loadLeads()}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

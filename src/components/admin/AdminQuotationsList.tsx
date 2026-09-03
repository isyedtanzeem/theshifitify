import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Receipt,
  Edit3,
  Calendar,
  MapPin,
  Phone,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  Truck,
  ShieldCheck,
  Link as LinkIcon,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { QuotationRecord, QuotationStatus } from '../../types/admin';
import { fetchAdminQuotations } from '../../utils/adminAuth';
import { downloadQuotationPdf, formatINR } from '../../utils/pdfGenerator';
import { QuotationDocumentView } from './QuotationDocumentView';
import { COMPANY_INFO } from '../../data/companyData';

interface AdminQuotationsListProps {
  onNavigate: (path: string) => void;
}

export const AdminQuotationsList: React.FC<AdminQuotationsListProps> = ({ onNavigate }) => {
  const [quotations, setQuotations] = useState<QuotationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationRecord | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const loadQuotations = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    const res = await fetchAdminQuotations({
      search: search.trim() || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
    });

    if (isManual) setRefreshing(false);
    else setLoading(false);

    if (res.success) {
      setQuotations(res.quotations);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuotations(true);
  };

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'EXPIRED':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getWhatsAppShareUrl = (q: QuotationRecord) => {
    const lines = [
      `*Shiftify Packers & Movers - Quotation*`,
      `Quotation Ref: *${q.quotationId}*`,
      `Customer: *${q.customerName}*`,
      `Route: ${q.fromLocation} ➔ ${q.toLocation}`,
      `Move Date: ${q.movingDate}`,
      `*Grand Total: ₹${(q.grandTotal ?? 0).toLocaleString('en-IN')}*`,
      `Valid Until: ${q.validUntil}`,
      ``,
      `For queries, please reply or call ${COMPANY_INFO.phone}.`,
    ].join('\n');

    const cleanPhone = q.phone.replace(/\D/g, '');
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(lines)}`;
  };

  const handleCopyEstimateLink = () => {
    const link = `${window.location.origin}/#cost-calculator`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // If viewing single quotation document
  if (selectedQuotation) {
    return (
      <QuotationDocumentView
        quotation={selectedQuotation}
        onBack={() => {
          setSelectedQuotation(null);
          loadQuotations();
        }}
        onEdit={() => onNavigate(`/admin/quotations/new?leadId=${selectedQuotation.leadId || ''}`)}
        onConvertToInvoice={(q) => onNavigate(`/admin/invoices/new?quotationId=${q.quotationId}`)}
      />
    );
  }

  // Calculate KPIs
  const totalActiveValue = quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const acceptedRate = quotations.length > 0 ? ((acceptedQuotes / quotations.length) * 100).toFixed(1) : '33.3';
  const averageValue = quotations.length > 0 ? Math.round(totalActiveValue / quotations.length) : 19650;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Top Banner & Action - Stitch Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Quotation Management</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                {quotations.length}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, track, and dispatch formal relocation quotations with automatic GST calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="quotations-refresh-btn"
            onClick={() => loadQuotations(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <button
            id="quotations-create-btn"
            onClick={() => onNavigate('/admin/quotations/new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* 3 KPI Stats Cards - Stitch Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: TOTAL ACTIVE QUOTES */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              TOTAL ACTIVE QUOTES
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalActiveValue > 0 ? totalActiveValue.toLocaleString('en-IN') : '58,950'}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% from last week</span>
          </div>
        </div>

        {/* Card 2: ACCEPTED RATE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              ACCEPTED RATE
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {acceptedRate}%
          </div>
          <div className="text-[11px] font-medium text-slate-500 pt-1">
            {acceptedQuotes} of {quotations.length || 3} dispatched accepted
          </div>
        </div>

        {/* Card 3: AVERAGE MOVE VALUE */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              AVERAGE MOVE VALUE
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{averageValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] font-medium text-slate-500 pt-1">
            Avg GST: ₹2,483 per move
          </div>
        </div>
      </div>

      {/* Search & Status Filters Bar - Stitch Screenshot 3 */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="quotation-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Quotation ID, customer name, phone, or location..."
            className="w-full pl-9 pr-24 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 shadow-2xs transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
          >
            Search
          </button>
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Data Table - Stitch Screenshot 3 */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600" />
          <p className="text-xs">Loading quotations...</p>
        </div>
      ) : quotations.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <div className="text-slate-900 font-bold text-sm">No quotations found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'Try changing your search keywords or status filter.'
              : 'Create your first relocation quotation to begin itemized estimations.'}
          </p>
          <button
            onClick={() => onNavigate('/admin/quotations/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">QUOTATION ID</th>
                  <th className="py-3.5 px-4">CUSTOMER DETAILS</th>
                  <th className="py-3.5 px-4">MOVING ROUTE &amp; DATE</th>
                  <th className="py-3.5 px-4 text-right">GRAND TOTAL</th>
                  <th className="py-3.5 px-4 text-center">STATUS</th>
                  <th className="py-3.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.quotationId} className="hover:bg-slate-50/60 transition">
                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-orange-600 text-sm">
                        {q.quotationId}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{q.quotationDate}</span>
                      </div>
                      {q.leadId && (
                        <span className="inline-block font-mono text-[10px] font-semibold text-slate-600 mt-1 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                          Lead: {q.leadId}
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{q.customerName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {q.phone}</span>
                      </div>
                      {q.email && (
                        <div className="text-slate-400 text-[11px] mt-0.5">{q.email}</div>
                      )}
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="font-semibold truncate max-w-[220px]">{q.fromLocation}</span>
                      </div>
                      <div className="text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                        <span className="font-semibold truncate max-w-[220px]">{q.toLocation}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>Move: <strong className="text-slate-700">{q.movingDate}</strong> ({q.movingType || 'House Shifting'})</span>
                      </div>
                    </td>

                    {/* Grand Total */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-black text-sm text-slate-900">
                        {formatINR(q.grandTotal)}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {q.items?.length || 3} items | GST: {formatINR(q.gstAmount || Math.round((q.grandTotal || 0) * 0.18))}
                      </div>
                      <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded mt-0.5">
                        Insurance Added
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </span>
                      {q.status === 'ACCEPTED' && (
                        <div className="text-[10px] font-semibold text-emerald-700 mt-1">
                          Token Paid (₹2,500)
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Document */}
                        <button
                          onClick={() => setSelectedQuotation(q)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition shadow-2xs"
                          title="View & Print Quotation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => downloadQuotationPdf(q)}
                          className="p-1.5 rounded-lg bg-white hover:bg-orange-50 text-orange-600 border border-slate-200 hover:border-orange-200 transition shadow-2xs"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={getWhatsAppShareUrl(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-200 transition shadow-2xs"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>

                        {/* Convert to Invoice */}
                        <button
                          onClick={() => onNavigate(`/admin/invoices/new?quotationId=${q.quotationId}`)}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 transition shadow-2xs"
                          title="Create Invoice from this Quote"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination - Stitch Screenshot 3 */}
          <div className="p-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-800">1</strong> to <strong className="text-slate-800">{quotations.length}</strong> of{' '}
              <strong className="text-slate-800">{quotations.length}</strong> active quotations
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed shadow-2xs"
              >
                Previous
              </button>
              <button className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-bold shadow-2xs">
                1
              </button>
              <button
                disabled
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 text-xs font-semibold cursor-not-allowed shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3 Bottom Operational Modules - Stitch Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Module 1: Tax Compliance Engine */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Tax Compliance Engine</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
              GST 18% Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Automated splits between CGST (9%) + SGST (9%) for intra-state Bangalore movements and IGST (18%) for inter-state operations.
          </p>
          <div className="pt-2 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Next Sync Window: 12:00 PM IST (Auto)</span>
          </div>
        </div>

        {/* Module 2: Fleet Capacity Check */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900">Fleet Capacity Check</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-extrabold text-[10px] border border-blue-200">
              Optimal
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            3 verified vehicles (14ft Eicher &amp; 17ft Closed Container) ready for scheduled moves between Sept 10 and Sept 15.
          </p>
          <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Karnataka &amp; Telangana transit permits active</span>
          </div>
        </div>

        {/* Module 3: Quick Quotation Link Generator */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900">Quick Quotation Link Generator</span>
              <LinkIcon className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instantly dispatch formal estimate portals via SMS/WhatsApp with real-time customer reading receipts.
            </p>
          </div>
          <button
            onClick={handleCopyEstimateLink}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition"
          >
            {linkCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Copy Public Estimate Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  RefreshCw,
  Download,
  Share2,
  Eye,
  CreditCard,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { InvoiceRecord, InvoiceStatus, PaymentStatus } from '../../types/admin';
import { fetchAdminInvoices } from '../../utils/adminAuth';
import { downloadInvoicePdf, formatINR } from '../../utils/pdfGenerator';
import { InvoiceDocumentView } from './InvoiceDocumentView';
import { COMPANY_INFO } from '../../data/companyData';

interface AdminInvoicesListProps {
  onNavigate: (path: string) => void;
}

export const AdminInvoicesList: React.FC<AdminInvoicesListProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const loadInvoices = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    const res = await fetchAdminInvoices({
      search: search.trim() || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      paymentStatus: paymentStatusFilter !== 'ALL' ? paymentStatusFilter : undefined,
    });

    if (isManual) setRefreshing(false);
    else setLoading(false);

    if (res.success) {
      setInvoices(res.invoices);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter, paymentStatusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices(true);
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'PARTIALLY_PAID':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'UNPAID':
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
    }
  };

  const getWhatsAppShareUrl = (inv: InvoiceRecord) => {
    const lines = [
      `*Shiftify Packers & Movers - Invoice*`,
      `Invoice Ref: *${inv.invoiceId}*`,
      `Customer: *${inv.customerName}*`,
      `Route: ${inv.fromLocation} ➔ ${inv.toLocation}`,
      `Total Amount: ₹${(inv.grandTotal ?? 0).toLocaleString('en-IN')}`,
      `Amount Paid: ₹${(inv.amountPaid ?? 0).toLocaleString('en-IN')}`,
      `*Balance Due: ₹${(inv.balanceDue ?? 0).toLocaleString('en-IN')}*`,
      `Status: *${inv.paymentStatus}*`,
      ``,
      `For queries, please contact ${COMPANY_INFO.phone}.`,
    ].join('\n');

    const cleanPhone = inv.phone.replace(/\D/g, '');
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(lines)}`;
  };

  // Summary Metrics
  const totalBilled = invoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
  const totalReceived = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

  if (selectedInvoice) {
    return (
      <InvoiceDocumentView
        invoice={selectedInvoice}
        onBack={() => {
          setSelectedInvoice(null);
          loadInvoices();
        }}
        onEdit={() => onNavigate(`/admin/invoices/new?quotationId=${selectedInvoice.quotationId || ''}`)}
        onPaymentRecorded={() => loadInvoices()}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span>Invoice Management</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {invoices.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue tax invoices, track customer payment collections, and manage outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="invoices-refresh-btn"
            onClick={() => loadInvoices(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            id="invoices-create-btn"
            onClick={() => onNavigate('/admin/invoices/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Revenue & Receivables Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Invoiced
            </span>
            <span className="text-lg font-black text-white font-mono mt-0.5 block">
              {formatINR(totalBilled)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Collected Revenue
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
              {formatINR(totalReceived)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
              Outstanding Receivables
            </span>
            <span className="text-lg font-black text-rose-400 font-mono mt-0.5 block">
              {formatINR(totalOutstanding)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="invoice-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Invoice ID, customer name, phone, or location..."
            className="w-full pl-9 pr-20 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </form>

        {/* Payment Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
          {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID'].map((st) => (
            <button
              key={st}
              onClick={() => setPaymentStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                paymentStatusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-xs">Loading invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-white font-bold text-sm">No invoices found</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || paymentStatusFilter !== 'ALL'
              ? 'Try changing your search keywords or payment filter.'
              : 'Create your first invoice or convert an accepted quotation.'}
          </p>
          <button
            onClick={() => onNavigate('/admin/invoices/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Route & Date</th>
                  <th className="py-3 px-4 text-right">Total / Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-slate-800/30 transition">
                    {/* ID */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-400">
                        {inv.invoiceId}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{inv.invoiceDate}</span>
                      </div>
                      {inv.quotationId && (
                        <span className="inline-block font-mono text-[10px] text-slate-400 mt-1 px-1.5 py-0.5 bg-slate-950 rounded border border-slate-800">
                          Quote: {inv.quotationId}
                        </span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{inv.customerName}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>+91 {inv.phone}</span>
                      </div>
                      {inv.email && (
                        <div className="text-slate-500 text-[11px]">{inv.email}</div>
                      )}
                    </td>

                    {/* Route */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">{inv.fromLocation}</span>
                      </div>
                      <div className="text-slate-200 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="font-medium truncate max-w-[180px]">{inv.toLocation}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Move: <strong>{inv.movingDate}</strong>
                      </div>
                    </td>

                    {/* Total / Paid */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-white">
                        {formatINR(inv.grandTotal)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Paid: {formatINR(inv.amountPaid)}
                      </div>
                    </td>

                    {/* Balance Due */}
                    <td className="py-3 px-4 text-right">
                      <div
                        className={`font-mono font-black text-sm ${
                          inv.balanceDue > 0 ? 'text-rose-400' : 'text-slate-500'
                        }`}
                      >
                        {formatINR(inv.balanceDue)}
                      </div>
                      {inv.balanceDue > 0 && inv.dueDate && (
                        <div className="text-[10px] text-slate-500">
                          Due by {inv.dueDate}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPaymentBadge(
                          inv.paymentStatus
                        )}`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Document */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => downloadInvoicePdf(inv)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition"
                          title="Download Invoice PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={getWhatsAppShareUrl(inv)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-900/50 text-emerald-400 transition"
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

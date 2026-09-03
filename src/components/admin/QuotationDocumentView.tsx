import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  ArrowLeft,
  Edit3,
  CheckCircle2,
  Receipt,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { QuotationRecord, QuotationStatus } from '../../types/admin';
import { updateQuotationStatus } from '../../utils/adminAuth';
import { downloadQuotationPdf, formatINR } from '../../utils/pdfGenerator';
import { COMPANY_INFO } from '../../data/companyData';

interface QuotationDocumentViewProps {
  quotation: QuotationRecord;
  onBack: () => void;
  onEdit?: (quotation: QuotationRecord) => void;
  onConvertToInvoice?: (quotation: QuotationRecord) => void;
  onStatusUpdated?: (updated: QuotationRecord) => void;
}

export const QuotationDocumentView: React.FC<QuotationDocumentViewProps> = ({
  quotation: initialQuotation,
  onBack,
  onEdit,
  onConvertToInvoice,
  onStatusUpdated,
}) => {
  const [quotation, setQuotation] = useState<QuotationRecord>(initialQuotation);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleStatusChange = async (newStatus: QuotationStatus) => {
    setUpdatingStatus(true);
    const res = await updateQuotationStatus(quotation.quotationId, newStatus);
    setUpdatingStatus(false);
    if (res.success && res.quotation) {
      setQuotation(res.quotation);
      if (onStatusUpdated) onStatusUpdated(res.quotation);
    } else {
      alert(res.error || 'Failed to update quotation status');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareUrl = () => {
    const lines = [
      `*Shiftify Packers & Movers - Quotation Summary*`,
      `Quotation Ref: *${quotation.quotationId}*`,
      `Customer: *${quotation.customerName}*`,
      `Pickup: ${quotation.fromLocation}`,
      `Drop: ${quotation.toLocation}`,
      `Move Date: ${quotation.movingDate} (${quotation.movingType})`,
      `------------------------`,
      ...quotation.items.map(
        (it) =>
          `• ${it.description}: ₹${(it.total ?? it.amount ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0).toLocaleString('en-IN')}`
      ),
      `------------------------`,
      `Subtotal: ₹${(quotation.subtotal ?? 0).toLocaleString('en-IN')}`,
      (quotation.discount || 0) > 0 ? `Discount: -₹${(quotation.discount ?? 0).toLocaleString('en-IN')}` : null,
      (quotation.gstAmount || 0) > 0 ? `GST (${quotation.gstPercentage || 0}%): ₹${(quotation.gstAmount ?? 0).toLocaleString('en-IN')}` : null,
      `*Grand Total: ₹${(quotation.grandTotal ?? 0).toLocaleString('en-IN')}*`,
      `Valid Until: ${quotation.validUntil}`,
      ``,
      `For any questions or to confirm your move, reply to this message or call ${COMPANY_INFO.phone}.`,
    ]
      .filter(Boolean)
      .join('\n');

    const cleanPhone = quotation.phone.replace(/\D/g, '');
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(lines)}`;
  };

  const getStatusBadgeColor = (status: QuotationStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'SENT':
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case 'REJECTED':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'EXPIRED':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Screen Only) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            id="quotation-view-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Quotations</span>
          </button>

          <span className="text-slate-600">|</span>

          <span className="font-mono text-sm font-extrabold text-orange-400">
            {quotation.quotationId}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadgeColor(
              quotation.status
            )}`}
          >
            {quotation.status}
          </span>
        </div>

        {/* Right action group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Change dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Status:</span>
            <select
              id="quotation-status-select"
              value={quotation.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as QuotationStatus)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="DRAFT" className="bg-slate-900 text-white">DRAFT</option>
              <option value="SENT" className="bg-slate-900 text-white">SENT</option>
              <option value="ACCEPTED" className="bg-slate-900 text-white">ACCEPTED</option>
              <option value="REJECTED" className="bg-slate-900 text-white">REJECTED</option>
              <option value="EXPIRED" className="bg-slate-900 text-white">EXPIRED</option>
            </select>
          </div>

          {/* Edit */}
          {onEdit && (
            <button
              id="quotation-edit-btn"
              onClick={() => onEdit(quotation)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit</span>
            </button>
          )}

          {/* Convert to Invoice */}
          {onConvertToInvoice && (
            <button
              id="quotation-convert-invoice-btn"
              onClick={() => onConvertToInvoice(quotation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
              title="Generate a Tax Invoice directly from this Quotation"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Create Invoice</span>
            </button>
          )}

          {/* Share WhatsApp */}
          <a
            id="quotation-share-whatsapp-btn"
            href={getWhatsAppShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Print */}
          <button
            id="quotation-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Download PDF */}
          <button
            id="quotation-download-pdf-btn"
            onClick={() => downloadQuotationPdf(quotation)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-950/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Document Printable Canvas */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans print:shadow-none print:border-0 print:rounded-none print:max-w-none">
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500" />

        <div className="p-8 sm:p-10 space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-lg">
                  S
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  SHIFTIFY PACKERS & MOVERS
                </h1>
              </div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mt-1">
                Reliable Pan-India Relocation & Logistics
              </p>
              <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                <p>HSR Layout, Sector 2, Bangalore, Karnataka - 560102</p>
                <p>Phone: +91 98765 43210 | Email: contact@shiftify.in</p>
                <p>Website: www.shiftify.in | GSTIN: 29AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="sm:text-right bg-orange-50/60 p-4 rounded-xl border border-orange-100 sm:min-w-[240px]">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-orange-600 text-white mb-2">
                Quotation
              </span>
              <div className="text-lg font-black text-slate-900 font-mono">
                {quotation.quotationId}
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800">{quotation.quotationDate}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-semibold text-slate-800">{quotation.validUntil}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-orange-600 uppercase">{quotation.status}</span>
                </div>
                {quotation.leadId && (
                  <div className="flex justify-between sm:justify-end gap-3 pt-1 border-t border-orange-200/60">
                    <span className="text-slate-500">Ref Lead ID:</span>
                    <span className="font-mono text-slate-700">{quotation.leadId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Relocation & Customer Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Quotation Prepared For
              </span>
              <div className="text-base font-bold text-slate-900">
                {quotation.customerName}
              </div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <p className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {quotation.phone}
                </p>
                {quotation.email && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {quotation.email}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Relocation Route & Particulars
              </span>
              <div className="text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <Truck className="w-3.5 h-3.5 text-orange-600" />
                  <span>Service: {quotation.movingType}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Moving Date: <strong>{quotation.movingDate}</strong></span>
                </div>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>From:</strong> {quotation.fromLocation}</span>
                </div>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>To:</strong> {quotation.toLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Itemized Charges & Services
            </h2>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-4">Charge Description</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-4 text-right w-28">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right w-32">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                        {formatINR(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatINR(item.total ?? item.amount ?? (Number(item.quantity) * Number(item.unitPrice)))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation & Notes Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            {/* Notes & Terms (Left) */}
            <div className="sm:col-span-7 space-y-4">
              {quotation.notes && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                  <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide mb-1">
                    Special Notes / Instructions
                  </div>
                  <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                    {quotation.notes}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                  Terms & Conditions
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {quotation.terms ||
                    '1. Quotation valid for 7 days from issue.\n2. 50% advance on confirmation, balance upon unloading.\n3. Goods transit insurance optional upon prior declaration.\n4. Standard packing materials included.'}
                </p>
              </div>
            </div>

            {/* Financial Summary (Right) */}
            <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatINR(quotation.subtotal)}
                </span>
              </div>

              {quotation.discount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">- {formatINR(quotation.discount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Taxable Amount:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatINR(quotation.taxableAmount)}
                    </span>
                  </div>
                </>
              )}

              {quotation.gstAmount > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>GST ({quotation.gstPercentage}%):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatINR(quotation.gstAmount)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST:</span>
                  <span>Exempted / 0%</span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-slate-900">
                <span className="text-sm font-black uppercase text-orange-600">
                  Grand Total:
                </span>
                <span className="text-lg font-black font-mono text-orange-600">
                  {formatINR(quotation.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Document Signatory / Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700">Thank you for considering Shiftify!</p>
              <p className="text-[11px] text-slate-400">Computer generated relocation quotation document.</p>
            </div>
            <div className="sm:text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1" />
              <p className="font-bold text-slate-800 text-[11px]">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Shiftify Packers & Movers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

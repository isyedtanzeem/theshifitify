import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Share2,
  ArrowLeft,
  Edit3,
  CreditCard,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Truck,
  Building2,
} from 'lucide-react';
import { InvoiceRecord, InvoiceStatus, PaymentStatus } from '../../types/admin';
import { updateInvoiceStatus, recordInvoicePayment } from '../../utils/adminAuth';
import { downloadInvoicePdf, formatINR } from '../../utils/pdfGenerator';
import { COMPANY_INFO } from '../../data/companyData';

interface InvoiceDocumentViewProps {
  invoice: InvoiceRecord;
  onBack: () => void;
  onEdit?: (invoice: InvoiceRecord) => void;
  onPaymentRecorded?: (updated: InvoiceRecord) => void;
  onStatusUpdated?: (updated: InvoiceRecord) => void;
}

export const InvoiceDocumentView: React.FC<InvoiceDocumentViewProps> = ({
  invoice: initialInvoice,
  onBack,
  onEdit,
  onPaymentRecorded,
  onStatusUpdated,
}) => {
  const [invoice, setInvoice] = useState<InvoiceRecord>(initialInvoice);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(invoice.balanceDue);
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [payMethod, setPayMethod] = useState<string>('UPI');
  const [payNotes, setPayNotes] = useState<string>('');
  const [recordingPayment, setRecordingPayment] = useState(false);

  const handleStatusChange = async (newStatus: InvoiceStatus) => {
    setUpdatingStatus(true);
    const res = await updateInvoiceStatus(invoice.invoiceId, newStatus);
    setUpdatingStatus(false);
    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      if (onStatusUpdated) onStatusUpdated(res.invoice);
    } else {
      alert(res.error || 'Failed to update invoice status');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setRecordingPayment(true);
    // Add to previously paid amount
    const totalPaid = (invoice.amountPaid || 0) + Number(payAmount);
    const res = await recordInvoicePayment(invoice.invoiceId, {
      amountPaid: totalPaid,
      paymentDate: payDate,
      paymentMethod: payMethod,
      paymentNotes: payNotes,
    });
    setRecordingPayment(false);

    if (res.success && res.invoice) {
      setInvoice(res.invoice);
      setShowPaymentModal(false);
      setPayNotes('');
      if (onPaymentRecorded) onPaymentRecorded(res.invoice);
    } else {
      alert(res.error || 'Failed to record payment');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppShareUrl = () => {
    const lines = [
      `*Shiftify Packers & Movers - Tax Invoice*`,
      `Invoice Ref: *${invoice.invoiceId}*`,
      `Customer: *${invoice.customerName}*`,
      `Service: ${invoice.movingType}`,
      `Route: ${invoice.fromLocation} ➔ ${invoice.toLocation}`,
      `Date: ${invoice.invoiceDate}`,
      `------------------------`,
      `*Total Billed: ₹${(invoice.grandTotal ?? 0).toLocaleString('en-IN')}*`,
      `Amount Paid: ₹${(invoice.amountPaid ?? 0).toLocaleString('en-IN')}`,
      `*Balance Due: ₹${(invoice.balanceDue ?? 0).toLocaleString('en-IN')}*`,
      `Payment Status: *${invoice.paymentStatus}*`,
      `------------------------`,
      (invoice.balanceDue || 0) > 0
        ? `Payment options: UPI (shiftify@hdfcbank) or Bank Transfer.\nPlease share payment screenshot upon transfer.`
        : `Thank you! Full payment has been received for your relocation.`,
      ``,
      `For queries, call Shiftify Operations at ${COMPANY_INFO.phone}.`,
    ]
      .filter(Boolean)
      .join('\n');

    const cleanPhone = invoice.phone.replace(/\D/g, '');
    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(lines)}`;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
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

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Screen Only) */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <button
            id="invoice-view-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Invoices</span>
          </button>

          <span className="text-slate-600">|</span>

          <span className="font-mono text-sm font-extrabold text-emerald-400">
            {invoice.invoiceId}
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPaymentStatusBadge(
              invoice.paymentStatus
            )}`}
          >
            {invoice.paymentStatus}
          </span>
        </div>

        {/* Right action group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Record Payment Button */}
          {invoice.balanceDue > 0 && (
            <button
              id="invoice-record-payment-btn"
              onClick={() => {
                setPayAmount(invoice.balanceDue);
                setShowPaymentModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Record Payment (Due: {formatINR(invoice.balanceDue)})</span>
            </button>
          )}

          {/* Status Change dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Doc Status:</span>
            <select
              id="invoice-status-select"
              value={invoice.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as InvoiceStatus)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="DRAFT" className="bg-slate-900 text-white">DRAFT</option>
              <option value="ISSUED" className="bg-slate-900 text-white">ISSUED</option>
              <option value="PAID" className="bg-slate-900 text-white">PAID</option>
              <option value="CANCELLED" className="bg-slate-900 text-white">CANCELLED</option>
            </select>
          </div>

          {/* Edit */}
          {onEdit && (
            <button
              id="invoice-edit-btn"
              onClick={() => onEdit(invoice)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit</span>
            </button>
          )}

          {/* Share WhatsApp */}
          <a
            id="invoice-share-whatsapp-btn"
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
            id="invoice-print-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Download PDF */}
          <button
            id="invoice-download-pdf-btn"
            onClick={() => downloadInvoicePdf(invoice)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-white shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Record Customer Payment</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Grand Total:</span>
                  <span className="font-mono text-white">{formatINR(invoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Already Paid:</span>
                  <span className="font-mono text-emerald-400">{formatINR(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Remaining Due:</span>
                  <span className="font-mono text-rose-400">{formatINR(invoice.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Payment Amount to Record (₹) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={invoice.balanceDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPayAmount(invoice.balanceDue)}
                  className="text-[11px] text-emerald-400 hover:underline mt-1 block"
                >
                  Pay Full Balance ({formatINR(invoice.balanceDue)})
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="UPI">UPI / GooglePay / PhonePe</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Transaction Ref / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. UTR #123456789 or Received at delivery"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recordingPayment}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {recordingPayment ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 Document Printable Canvas */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans print:shadow-none print:border-0 print:rounded-none print:max-w-none">
        {/* Top Accent Strip */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700" />

        <div className="p-8 sm:p-10 space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
                  S
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  SHIFTIFY PACKERS & MOVERS
                </h1>
              </div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mt-1">
                Tax Invoice / Relocation Bill
              </p>
              <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                <p>HSR Layout, Sector 2, Bangalore, Karnataka - 560102</p>
                <p>Phone: +91 98765 43210 | Email: contact@shiftify.in</p>
                <p>Website: www.shiftify.in | GSTIN: 29AAAAA0000A1Z5</p>
              </div>
            </div>

            <div className="sm:text-right bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 sm:min-w-[240px]">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white mb-2">
                Tax Invoice
              </span>
              <div className="text-lg font-black text-slate-900 font-mono">
                {invoice.invoiceId}
              </div>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <div className="flex justify-between sm:justify-end gap-3">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-semibold text-slate-800">{invoice.invoiceDate}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
                  </div>
                )}
                {invoice.quotationId && (
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-slate-500">Ref Quote #:</span>
                    <span className="font-mono text-slate-700">{invoice.quotationId}</span>
                  </div>
                )}
                <div className="flex justify-between sm:justify-end gap-3 pt-1 border-t border-emerald-200/60">
                  <span className="text-slate-500">Payment:</span>
                  <span
                    className={`font-bold uppercase ${
                      invoice.paymentStatus === 'PAID'
                        ? 'text-emerald-600'
                        : invoice.paymentStatus === 'PARTIALLY_PAID'
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {invoice.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Relocation & Customer Overview Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Billed To (Customer)
              </span>
              <div className="text-base font-bold text-slate-900">
                {invoice.customerName}
              </div>
              <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                <p className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> +91 {invoice.phone}
                </p>
                {invoice.email && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {invoice.email}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Move Particulars
              </span>
              <div className="text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-slate-900">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Service: {invoice.movingType}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Move Date: <strong>{invoice.movingDate}</strong></span>
                </div>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>From:</strong> {invoice.fromLocation}</span>
                </div>
                <div className="flex items-start gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>To:</strong> {invoice.toLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              Particulars & Charges
            </h2>
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-4 text-right w-28">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right w-32">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
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

          {/* Calculation & Payment Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-2">
            {/* Bank Details & Terms (Left) */}
            <div className="sm:col-span-7 space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 text-xs">
                <div className="font-bold text-emerald-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Bank Transfer / UPI Details</span>
                </div>
                <div className="text-slate-700 space-y-0.5 leading-relaxed">
                  <p><strong>Account Name:</strong> Shiftify Logistics India Pvt Ltd</p>
                  <p><strong>Bank:</strong> HDFC Bank Ltd  |  <strong>Branch:</strong> HSR Layout, Bangalore</p>
                  <p><strong>A/C Number:</strong> 50200012345678  |  <strong>IFSC:</strong> HDFC0001234</p>
                  <p><strong>UPI ID:</strong> shiftify@hdfcbank</p>
                </div>
              </div>

              {invoice.notes && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                    Invoice Notes
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
              )}

              <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
                  Terms & Conditions
                </div>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {invoice.terms ||
                    '1. Goods received in good condition.\n2. Discrepancies if any must be notified within 24 hours of delivery.\n3. All disputes subject to Bangalore jurisdiction.'}
                </p>
              </div>
            </div>

            {/* Financial Summary & Payment Progress (Right) */}
            <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatINR(invoice.subtotal)}
                </span>
              </div>

              {invoice.discount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">- {formatINR(invoice.discount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Taxable Amount:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {formatINR(invoice.taxableAmount)}
                    </span>
                  </div>
                </>
              )}

              {invoice.gstAmount > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>GST ({invoice.gstPercentage}%):</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatINR(invoice.gstAmount)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST:</span>
                  <span>Exempted / 0%</span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-slate-900">
                <span className="text-sm font-black uppercase text-emerald-700">
                  Grand Total:
                </span>
                <span className="text-lg font-black font-mono text-emerald-700">
                  {formatINR(invoice.grandTotal)}
                </span>
              </div>

              {/* Payment Summary Box */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatINR(invoice.amountPaid)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-900 font-bold">
                  <span>Balance Due:</span>
                  <span
                    className={`font-mono text-sm ${
                      invoice.balanceDue > 0 ? 'text-rose-600' : 'text-slate-500'
                    }`}
                  >
                    {formatINR(invoice.balanceDue)}
                  </span>
                </div>

                {invoice.paymentMethod && (
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Latest Method:</span>
                    <span>{invoice.paymentMethod}</span>
                  </div>
                )}
                {invoice.paymentDate && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Latest Payment Date:</span>
                    <span>{invoice.paymentDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Signatory / Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-700">Shiftify Packers & Movers</p>
              <p className="text-[11px] text-slate-400">Official Computer Generated Tax Invoice.</p>
            </div>
            <div className="sm:text-right">
              <div className="h-10 border-b border-slate-400 w-48 mb-1" />
              <p className="font-bold text-slate-800 text-[11px]">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400">Shiftify Logistics India Pvt Ltd</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

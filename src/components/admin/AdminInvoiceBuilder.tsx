import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Receipt,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Calculator,
  FileText,
  CreditCard,
} from 'lucide-react';
import { InvoiceRecord, InvoiceItem, InvoiceStatus, PaymentStatus } from '../../types/admin';
import {
  createAdminInvoice,
  updateAdminInvoice,
  fetchQuotationById,
  fetchAdminLeads,
} from '../../utils/adminAuth';
import { InvoiceDocumentView } from './InvoiceDocumentView';

interface AdminInvoiceBuilderProps {
  initialInvoice?: InvoiceRecord | null;
  quotationIdParam?: string | null;
  leadIdParam?: string | null;
  onNavigate: (path: string) => void;
  onSaved?: (invoice: InvoiceRecord) => void;
}

const CHARGE_PRESETS = [
  { description: 'Transportation Charges', unitPrice: 8500 },
  { description: 'Packing Charges (Cartons, Bubble wrap & Stretch film)', unitPrice: 3500 },
  { description: 'Loading Charges (Origin Labor)', unitPrice: 2000 },
  { description: 'Unloading Charges (Destination Labor)', unitPrice: 2000 },
  { description: 'Unpacking & Rearranging Services', unitPrice: 1500 },
  { description: 'Furniture Disassembly & Re-assembly', unitPrice: 1200 },
  { description: 'Transit Goods Insurance (Declared Value Coverage)', unitPrice: 1800 },
  { description: 'Warehouse / Safe Storage Facility', unitPrice: 4500 },
];

export const AdminInvoiceBuilder: React.FC<AdminInvoiceBuilderProps> = ({
  initialInvoice,
  quotationIdParam,
  leadIdParam,
  onNavigate,
  onSaved,
}) => {
  const isEditing = !!initialInvoice;

  // Form State
  const [invoiceDate, setInvoiceDate] = useState<string>(
    initialInvoice?.invoiceDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(() => {
    if (initialInvoice?.dueDate) return initialInvoice.dueDate;
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [customerName, setCustomerName] = useState<string>(initialInvoice?.customerName || '');
  const [phone, setPhone] = useState<string>(initialInvoice?.phone || '');
  const [email, setEmail] = useState<string>(initialInvoice?.email || '');
  const [fromLocation, setFromLocation] = useState<string>(initialInvoice?.fromLocation || '');
  const [toLocation, setToLocation] = useState<string>(initialInvoice?.toLocation || '');
  const [movingDate, setMovingDate] = useState<string>(initialInvoice?.movingDate || '');
  const [movingType, setMovingType] = useState<string>(
    initialInvoice?.movingType || 'House Shifting'
  );
  const [quotationId, setQuotationId] = useState<string>(
    initialInvoice?.quotationId || quotationIdParam || ''
  );
  const [leadId, setLeadId] = useState<string>(initialInvoice?.leadId || leadIdParam || '');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (initialInvoice?.items && initialInvoice.items.length > 0) {
      return initialInvoice.items.map((it) => ({
        ...it,
        total: it.total ?? it.amount ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
        amount: it.amount ?? it.total ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
      }));
    }
    return [
      { description: 'Relocation & Transportation Services', quantity: 1, unitPrice: 8500, total: 8500, amount: 8500 },
      { description: 'Professional Packaging & Labor', quantity: 1, unitPrice: 3500, total: 3500, amount: 3500 },
    ];
  });

  const [discount, setDiscount] = useState<number>(initialInvoice?.discount || 0);
  const [gstPercentage, setGstPercentage] = useState<number>(
    initialInvoice?.gstPercentage !== undefined ? initialInvoice.gstPercentage : 18
  );

  // Payment Tracking
  const [amountPaid, setAmountPaid] = useState<number>(initialInvoice?.amountPaid || 0);
  const [paymentDate, setPaymentDate] = useState<string>(
    initialInvoice?.paymentDate || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    initialInvoice?.paymentMethod || 'UPI'
  );
  const [paymentNotes, setPaymentNotes] = useState<string>(initialInvoice?.paymentNotes || '');

  const [notes, setNotes] = useState<string>(
    initialInvoice?.notes || 'Payment terms: Due on delivery. Full consignment delivered intact.'
  );
  const [terms, setTerms] = useState<string>(
    initialInvoice?.terms ||
      '1. Goods received in good condition.\n2. Discrepancies if any must be notified within 24 hours of delivery.\n3. All disputes subject to Bangalore jurisdiction.'
  );
  const [status, setStatus] = useState<InvoiceStatus>(initialInvoice?.status || 'ISSUED');

  const [saving, setSaving] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<InvoiceRecord | null>(null);

  // Auto load from Quotation if quotationIdParam is provided
  useEffect(() => {
    if (quotationIdParam && !initialInvoice) {
      const loadQuotationData = async () => {
        setLoadingRef(true);
        const res = await fetchQuotationById(quotationIdParam);
        setLoadingRef(false);
        if (res.success && res.quotation) {
          const q = res.quotation;
          setQuotationId(q.quotationId);
          if (q.leadId) setLeadId(q.leadId);
          setCustomerName(q.customerName);
          setPhone(q.phone);
          if (q.email) setEmail(q.email);
          setFromLocation(q.fromLocation);
          setToLocation(q.toLocation);
          setMovingDate(q.movingDate);
          setMovingType(q.movingType);
          if (q.items && q.items.length > 0) {
            setItems(
              q.items.map((it) => ({
                ...it,
                total: it.total ?? it.amount ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
                amount: it.amount ?? it.total ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
              }))
            );
          }
          setDiscount(q.discount || 0);
          setGstPercentage(q.gstPercentage !== undefined ? q.gstPercentage : 18);
        }
      };
      loadQuotationData();
    } else if (leadIdParam && !initialInvoice && !quotationIdParam) {
      const loadLeadData = async () => {
        setLoadingRef(true);
        const res = await fetchAdminLeads({ search: leadIdParam });
        setLoadingRef(false);
        if (res.success && res.leads.length > 0) {
          const matched = res.leads.find((l) => l.leadId === leadIdParam) || res.leads[0];
          if (matched) {
            setLeadId(matched.leadId);
            setCustomerName(matched.name);
            setPhone(matched.phone);
            if (matched.email) setEmail(matched.email);
            setFromLocation(matched.fromLocation);
            setToLocation(matched.toLocation);
            setMovingDate(matched.movingDate);
            setMovingType(matched.movingType);
          }
        }
      };
      loadLeadData();
    }
  }, [quotationIdParam, leadIdParam, initialInvoice]);

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const safeDiscount = Math.max(0, Math.min(Number(discount) || 0, subtotal));
  const taxableAmount = Math.max(0, subtotal - safeDiscount);
  const gstAmount = Math.round((taxableAmount * (Number(gstPercentage) || 0)) / 100);
  const grandTotal = taxableAmount + gstAmount;
  const safeAmountPaid = Math.max(0, Math.min(Number(amountPaid) || 0, grandTotal));
  const balanceDue = Math.max(0, grandTotal - safeAmountPaid);

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (safeAmountPaid >= grandTotal && grandTotal > 0) {
    paymentStatus = 'PAID';
  } else if (safeAmountPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID';
  }

  // Item handlers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };

      if (field === 'description') {
        item.description = value;
      } else if (field === 'quantity') {
        item.quantity = Math.max(1, Number(value) || 1);
        item.total = item.quantity * item.unitPrice;
      } else if (field === 'unitPrice') {
        item.unitPrice = Math.max(0, Number(value) || 0);
        item.total = item.quantity * item.unitPrice;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: 'Additional Relocation Service', quantity: 1, unitPrice: 1000, total: 1000 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      alert('An invoice must have at least one line item.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPreset = (preset: { description: string; unitPrice: number }) => {
    setItems((prev) => [
      ...prev,
      {
        description: preset.description,
        quantity: 1,
        unitPrice: preset.unitPrice,
        total: preset.unitPrice,
      },
    ]);
  };

  const handleSubmit = async (submitStatus: InvoiceStatus = status) => {
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter customer phone number');
      return;
    }
    if (!fromLocation.trim() || !toLocation.trim()) {
      alert('Please provide pickup and destination locations');
      return;
    }
    if (!movingDate.trim()) {
      alert('Please provide moving date');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    setSaving(true);
    const payload = {
      quotationId: quotationId.trim() || undefined,
      leadId: leadId.trim() || undefined,
      invoiceDate,
      dueDate: dueDate || undefined,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      fromLocation: fromLocation.trim(),
      toLocation: toLocation.trim(),
      movingDate: movingDate.trim(),
      movingType,
      items,
      discount: safeDiscount,
      gstPercentage: Number(gstPercentage) || 0,
      amountPaid: safeAmountPaid,
      paymentDate: safeAmountPaid > 0 ? paymentDate : undefined,
      paymentMethod: safeAmountPaid > 0 ? paymentMethod : undefined,
      paymentNotes: safeAmountPaid > 0 ? paymentNotes : undefined,
      notes: notes.trim() || undefined,
      terms: terms.trim() || undefined,
      status: submitStatus,
    };

    let result;
    if (isEditing && initialInvoice) {
      result = await updateAdminInvoice(initialInvoice.invoiceId, payload);
    } else {
      result = await createAdminInvoice(payload);
    }
    setSaving(false);

    if (result.success && result.invoice) {
      setSavedInvoice(result.invoice);
      if (onSaved) onSaved(result.invoice);
    } else {
      alert(result.error || 'Failed to save invoice');
    }
  };

  if (savedInvoice) {
    return (
      <InvoiceDocumentView
        invoice={savedInvoice}
        onBack={() => onNavigate('/admin/invoices')}
        onEdit={() => setSavedInvoice(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            id="invoice-builder-back-btn"
            onClick={() => onNavigate('/admin/invoices')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>{isEditing ? `Edit Invoice ${initialInvoice?.invoiceId}` : 'Generate Tax Invoice'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {quotationIdParam
                ? `Loaded directly from Quotation #${quotationIdParam}`
                : leadIdParam
                ? `Loaded from Lead #${leadIdParam}`
                : 'Create official billing invoice with payment tracking & GST compliance.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="invoice-save-draft-btn"
            onClick={() => handleSubmit('DRAFT')}
            disabled={saving || loadingRef}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            id="invoice-save-issue-btn"
            onClick={() => handleSubmit('ISSUED')}
            disabled={saving || loadingRef}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{saving ? 'Issuing...' : 'Save & Issue Invoice'}</span>
          </button>
        </div>
      </div>

      {loadingRef && (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
          <Truck className="w-4 h-4 animate-bounce" />
          <span>Auto-populating details from reference record...</span>
        </div>
      )}

      {/* Primary Form Sections */}
      <div className="space-y-6">
        {/* Section 1: Customer & References */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Invoice Particulars & Customer</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Customer Name <span className="text-emerald-400">*</span>
              </label>
              <input
                id="inv-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-emerald-400">*</span>
              </label>
              <input
                id="inv-customer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="inv-customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Pickup Location (From) <span className="text-emerald-400">*</span>
              </label>
              <input
                id="inv-from-loc"
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="e.g. Indiranagar, Bangalore"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Destination (To) <span className="text-emerald-400">*</span>
              </label>
              <input
                id="inv-to-loc"
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="e.g. HSR Layout, Bangalore"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Moving Date <span className="text-emerald-400">*</span>
              </label>
              <input
                id="inv-moving-date"
                type="date"
                value={movingDate}
                onChange={(e) => setMovingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Moving Service Type
              </label>
              <select
                id="inv-moving-type"
                value={movingType}
                onChange={(e) => setMovingType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="House Shifting">House Shifting</option>
                <option value="Office Shifting">Office Shifting</option>
                <option value="Vehicle Transport">Vehicle Transport</option>
                <option value="Warehouse / Storage">Warehouse / Storage</option>
                <option value="Local Shifting">Local Shifting</option>
                <option value="Intercity Shifting">Intercity Shifting</option>
                <option value="Corporate Relocation">Corporate Relocation</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Invoice Date
              </label>
              <input
                id="inv-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Payment Due Date
              </label>
              <input
                id="inv-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Ref Quotation ID
              </label>
              <input
                id="inv-ref-quote-id"
                type="text"
                value={quotationId}
                onChange={(e) => setQuotationId(e.target.value)}
                placeholder="e.g. Q-2026-0001"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Ref Lead ID
              </label>
              <input
                id="inv-ref-lead-id"
                type="text"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                placeholder="e.g. LEAD-2026-0001"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Items & Financial Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Invoice Items & Services</span>
              </h2>
              <p className="text-xs text-slate-400">
                Itemize billing charges for transportation, packaging, labor, and taxes.
              </p>
            </div>

            <button
              id="inv-add-item-btn"
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Item</span>
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Add Standard Charge Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CHARGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{p.description.split('(')[0].trim()}</span>
                  <span className="text-slate-500 font-mono">₹{p.unitPrice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-right text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      ₹{(item.total ?? item.amount ?? (Number(item.quantity) * Number(item.unitPrice)) ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  GST Rate
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 12, 18].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setGstPercentage(pct)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        gstPercentage === pct
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.length} items):</span>
                <span className="font-mono text-white font-semibold">
                  ₹{(subtotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>

              {safeDiscount > 0 && (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">
                      - ₹{(safeDiscount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                    <span>Taxable Amount:</span>
                    <span className="font-mono text-white">
                      ₹{(taxableAmount ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-slate-400">
                <span>GST ({gstPercentage}%):</span>
                <span className="font-mono text-white font-semibold">
                  ₹{(gstAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold text-white">
                <span className="text-emerald-400">Grand Total:</span>
                <span className="text-lg font-mono text-emerald-400">
                  ₹{(grandTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Record */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Customer Payment Recording</span>
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                paymentStatus === 'PAID'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  : paymentStatus === 'PARTIALLY_PAID'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
              }`}
            >
              Status: {paymentStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Amount Paid (Advance / Full) ₹
              </label>
              <input
                id="inv-amount-paid"
                type="number"
                min="0"
                max={grandTotal}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAmountPaid(grandTotal)}
                className="text-[10px] text-emerald-400 hover:underline mt-1 block"
              >
                Mark Full Payment (₹{(grandTotal ?? 0).toLocaleString('en-IN')})
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                id="inv-payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Payment Mode
              </label>
              <select
                id="inv-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Payment Transaction Ref / Notes
              </label>
              <input
                id="inv-payment-notes"
                type="text"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g. UTR #123456789 or Advance token received"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Outstanding Balance Due:</span>
                <span
                  className={`font-mono text-base font-black ${
                    balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ₹{(balanceDue ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                {balanceDue === 0 ? 'Fully Paid' : 'Payment Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Notes & Terms */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Invoice Notes & Terms</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Remarks / Delivery Confirmation
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Invoice notes..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Invoice Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

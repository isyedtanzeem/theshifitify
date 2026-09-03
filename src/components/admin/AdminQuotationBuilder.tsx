import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Truck,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Calculator,
  FileText,
  Percent,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { QuotationRecord, QuotationItem, QuotationStatus } from '../../types/admin';
import { createAdminQuotation, updateAdminQuotation, fetchAdminLeads } from '../../utils/adminAuth';
import { QuotationDocumentView } from './QuotationDocumentView';

interface AdminQuotationBuilderProps {
  initialQuotation?: QuotationRecord | null;
  leadIdParam?: string | null;
  onNavigate: (path: string) => void;
  onSaved?: (quotation: QuotationRecord) => void;
}

const CHARGE_PRESETS = [
  { description: 'Transportation Charges', unitPrice: 8500 },
  { description: 'Packing Charges (Cartons, Bubble wrap & Stretch film)', unitPrice: 3500 },
  { description: 'Loading Charges (Origin Labor)', unitPrice: 2000 },
  { description: 'Unloading Charges (Destination Labor)', unitPrice: 2000 },
  { description: 'Unpacking & Rearranging Services', unitPrice: 1500 },
  { description: 'Furniture Disassembly & Re-assembly', unitPrice: 1200 },
  { description: 'Transit Goods Insurance (Declared Value Coverage)', unitPrice: 1800 },
  { description: 'Warehouse / Safe Storage Facility (1 Month)', unitPrice: 4500 },
];

export const AdminQuotationBuilder: React.FC<AdminQuotationBuilderProps> = ({
  initialQuotation,
  leadIdParam,
  onNavigate,
  onSaved,
}) => {
  const isEditing = !!initialQuotation;

  // Form State
  const [quotationDate, setQuotationDate] = useState<string>(
    initialQuotation?.quotationDate || new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(() => {
    if (initialQuotation?.validUntil) return initialQuotation.validUntil;
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [customerName, setCustomerName] = useState<string>(initialQuotation?.customerName || '');
  const [phone, setPhone] = useState<string>(initialQuotation?.phone || '');
  const [email, setEmail] = useState<string>(initialQuotation?.email || '');
  const [fromLocation, setFromLocation] = useState<string>(initialQuotation?.fromLocation || '');
  const [toLocation, setToLocation] = useState<string>(initialQuotation?.toLocation || '');
  const [movingDate, setMovingDate] = useState<string>(initialQuotation?.movingDate || '');
  const [movingType, setMovingType] = useState<string>(
    initialQuotation?.movingType || 'House Shifting'
  );
  const [leadId, setLeadId] = useState<string>(initialQuotation?.leadId || leadIdParam || '');

  // Line items
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (initialQuotation?.items && initialQuotation.items.length > 0) {
      return initialQuotation.items.map((it) => ({
        ...it,
        total: it.total ?? it.amount ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
        amount: it.amount ?? it.total ?? (Number(it.quantity) * Number(it.unitPrice)) ?? 0,
      }));
    }
    return [
      { description: 'Transportation Charges', quantity: 1, unitPrice: 8000, total: 8000, amount: 8000 },
      {
        description: 'Standard Packing Materials & Labor',
        quantity: 1,
        unitPrice: 3500,
        total: 3500,
        amount: 3500,
      },
      { description: 'Loading & Unloading Labor', quantity: 1, unitPrice: 2500, total: 2500, amount: 2500 },
    ];
  });

  const [discount, setDiscount] = useState<number>(initialQuotation?.discount || 0);
  const [gstPercentage, setGstPercentage] = useState<number>(
    initialQuotation?.gstPercentage !== undefined ? initialQuotation.gstPercentage : 18
  );
  const [notes, setNotes] = useState<string>(
    initialQuotation?.notes ||
      'Packing scheduled one day prior to transit. Dedicated vehicle arranged. All delicate glassware packed in customized multi-layer bubble wrap.'
  );
  const [terms, setTerms] = useState<string>(
    initialQuotation?.terms ||
      '1. Quotation valid for 7 days from the date of issue.\n2. 50% advance upon booking confirmation, balance upon arrival at destination.\n3. Goods transit insurance optional upon customer declaration.\n4. Additional items not listed in survey may attract pro-rata charges.'
  );
  const [status, setStatus] = useState<QuotationStatus>(initialQuotation?.status || 'DRAFT');

  const [saving, setSaving] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [savedQuotation, setSavedQuotation] = useState<QuotationRecord | null>(null);

  // If leadIdParam is provided and we are creating fresh, auto-load lead details from server
  useEffect(() => {
    if (leadIdParam && !initialQuotation) {
      const loadLeadDetails = async () => {
        setLoadingLead(true);
        const res = await fetchAdminLeads({ search: leadIdParam });
        setLoadingLead(false);
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
      loadLeadDetails();
    }
  }, [leadIdParam, initialQuotation]);

  // Dynamic calculations
  const subtotal = items.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
  const safeDiscount = Math.max(0, Math.min(Number(discount) || 0, subtotal));
  const taxableAmount = Math.max(0, subtotal - safeDiscount);
  const gstAmount = Math.round((taxableAmount * (Number(gstPercentage) || 0)) / 100);
  const grandTotal = taxableAmount + gstAmount;

  // Item helpers
  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
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
      alert('A quotation must have at least one line item.');
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

  const handleSubmit = async (submitStatus: QuotationStatus = status) => {
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
      alert('Please add at least one charge item');
      return;
    }

    setSaving(true);
    const payload = {
      leadId: leadId || undefined,
      quotationDate,
      validUntil,
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
      notes: notes.trim() || undefined,
      terms: terms.trim() || undefined,
      status: submitStatus,
    };

    let result;
    if (isEditing && initialQuotation) {
      result = await updateAdminQuotation(initialQuotation.quotationId, payload);
    } else {
      result = await createAdminQuotation(payload);
    }
    setSaving(false);

    if (result.success && result.quotation) {
      setSavedQuotation(result.quotation);
      if (onSaved) onSaved(result.quotation);
    } else {
      alert(result.error || 'Failed to save quotation');
    }
  };

  // If saved, render the generated view immediately
  if (savedQuotation) {
    return (
      <QuotationDocumentView
        quotation={savedQuotation}
        onBack={() => onNavigate('/admin/quotations')}
        onEdit={() => setSavedQuotation(null)}
        onConvertToInvoice={(q) => onNavigate(`/admin/invoices/new?quotationId=${q.quotationId}`)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            id="quotation-builder-back-btn"
            onClick={() => onNavigate('/admin/quotations')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              <span>{isEditing ? `Edit Quotation ${initialQuotation?.quotationId}` : 'Create New Quotation'}</span>
            </h1>
            <p className="text-xs text-slate-400">
              {leadIdParam
                ? `Auto-populated from Lead #${leadIdParam}`
                : 'Itemize relocation services, calculate taxes & generate professional quote.'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="quotation-save-draft-btn"
            onClick={() => handleSubmit('DRAFT')}
            disabled={saving || loadingLead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>

          <button
            id="quotation-save-send-btn"
            onClick={() => handleSubmit('SENT')}
            disabled={saving || loadingLead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-950/40 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{saving ? 'Generating...' : 'Save & Review'}</span>
          </button>
        </div>
      </div>

      {loadingLead && (
        <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-800/40 text-xs text-orange-300 flex items-center gap-2">
          <Truck className="w-4 h-4 animate-bounce" />
          <span>Loading customer and moving details from Lead #{leadIdParam}...</span>
        </div>
      )}

      {/* Primary Form Sections */}
      <div className="space-y-6">
        {/* Section 1: Customer & Move Overview */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            <span>Customer & Relocation Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Customer Name <span className="text-orange-500">*</span>
              </label>
              <input
                id="quote-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-orange-500">*</span>
              </label>
              <input
                id="quote-customer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Email Address <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                id="quote-customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ramesh@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Pickup Location (From) <span className="text-orange-500">*</span>
              </label>
              <input
                id="quote-from-loc"
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="e.g. Indiranagar, Bangalore"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Destination (To) <span className="text-orange-500">*</span>
              </label>
              <input
                id="quote-to-loc"
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="e.g. HSR Layout, Bangalore"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Moving Date <span className="text-orange-500">*</span>
              </label>
              <input
                id="quote-moving-date"
                type="date"
                value={movingDate}
                onChange={(e) => setMovingDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Moving Service Type
              </label>
              <select
                id="quote-moving-type"
                value={movingType}
                onChange={(e) => setMovingType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Quotation Date
              </label>
              <input
                id="quote-date"
                type="date"
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Valid Until (Expiry)
              </label>
              <input
                id="quote-valid-until"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Linked Lead ID (Optional)
              </label>
              <input
                id="quote-linked-lead-id"
                type="text"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                placeholder="e.g. LEAD-2026-0001"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Moving Charges & Line Items */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>Moving Services & Charge Items</span>
              </h2>
              <p className="text-xs text-slate-400">
                Add standard relocation charges or customize items and rates.
              </p>
            </div>

            <button
              id="quote-add-item-btn"
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 hover:bg-orange-600/30 text-xs font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Charge</span>
            </button>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Quick Add Standard Charges:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CHARGE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5 text-orange-400" />
                  <span>{p.description.split('(')[0].trim()}</span>
                  <span className="text-slate-500 font-mono">₹{p.unitPrice}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Service / Charge Description</th>
                  <th className="py-2.5 px-3 w-20 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-28 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
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
                        placeholder="Service charge description"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-center text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-right text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
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
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Bar */}
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
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                          ? 'bg-orange-600 text-white border-orange-500'
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
                <span className="text-orange-400">Grand Total:</span>
                <span className="text-lg font-mono text-orange-400">
                  ₹{(grandTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notes & Terms */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <span>Notes, Remarks & Quotation Terms</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Notes / Special Packaging Instructions
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes for transit, inventory highlights, packaging requirements..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Standard Terms & Conditions
              </label>
              <textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Quotation validity, advance payments, transit conditions..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

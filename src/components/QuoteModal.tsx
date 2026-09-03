import React from 'react';
import { X, Truck } from 'lucide-react';
import { LeadQuoteForm } from './LeadQuoteForm';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, serviceType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Container */}
        <div className="bg-slate-950 p-2 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="px-5 py-3 bg-slate-900 rounded-2xl mb-2 flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span>Shiftify Moving Quotation</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
              Free & Instant
            </span>
          </div>
          <LeadQuoteForm initialMovingType={serviceType || 'House Shifting'} />
        </div>
      </div>
    </div>
  );
};

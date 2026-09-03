import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp';
import { COMPANY_INFO } from '../data/companyData';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<boolean>(true);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Interactive Tooltip Bubble */}
      {showTooltip && (
        <div className="bg-white rounded-2xl p-3 shadow-2xl border border-slate-200 max-w-xs text-xs text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-2 -left-2 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600 transition-colors"
            title="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Shiftify Move Desk</div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Need an instant quotation for Bangalore or intercity shifting?
              </p>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-bold text-emerald-600 hover:text-emerald-700 text-[11px] underline"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Shiftify Packers & Movers on WhatsApp"
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/50 transition-all transform hover:scale-110 active:scale-95 group relative"
      >
        <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        {/* Radar ping animation */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
      </a>
    </div>
  );
};

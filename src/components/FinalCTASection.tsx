import React from 'react';
import { ArrowRight, MessageCircle, Phone, Truck } from 'lucide-react';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';
import { COMPANY_INFO } from '../data/companyData';

interface FinalCTASectionProps {
  onOpenQuoteModal: () => void;
}

export const FinalCTASection: React.FC<FinalCTASectionProps> = ({ onOpenQuoteModal }) => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-tr from-slate-950 via-slate-900 to-orange-950 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-600/20 border border-orange-500/40 text-orange-400 flex items-center justify-center shadow-lg">
          <Truck className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
          Ready for a Smooth, Worry-Free Move?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
          Get an instant, transparent moving quotation in under 60 seconds with our 4-step quote form, or chat directly with our Bangalore move coordination team.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenQuoteModal}
            className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 transition-all hover:scale-105"
          >
            <span>Get Free Quote Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={getCallUrl()}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <Phone className="w-4 h-4 text-orange-400" />
            <span>{COMPANY_INFO.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

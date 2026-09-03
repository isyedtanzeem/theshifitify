import React, { useEffect } from 'react';
import { Truck, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { LeadQuoteForm } from './LeadQuoteForm';
import { updatePageSEO } from '../utils/seo';

export const QuotePage: React.FC = () => {
  useEffect(() => {
    updatePageSEO({
      title: 'Get Free Moving Quote | Shiftify Packers & Movers Bangalore',
      description: 'Get an instant moving estimate for house shifting, office relocation, vehicle transport, or storage in Bangalore & all India.',
      canonicalPath: '/quote',
    });
  }, []);

  return (
    <div className="bg-slate-950 text-white min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-orange-400 text-xs font-bold uppercase mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>Instant Cost Estimation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
            Get Your Free Moving Quote
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Complete the 4 simple steps below. We will analyze your route and provide transparent pricing with zero obligation.
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-slate-900/90 p-3 sm:p-4 rounded-3xl border border-slate-800 shadow-2xl">
          <LeadQuoteForm />
        </div>
      </div>
    </div>
  );
};

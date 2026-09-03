import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../data/companyData';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface HowItWorksSectionProps {
  onOpenQuoteModal: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onOpenQuoteModal }) => {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-950/60 border border-orange-800/60 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-display tracking-tight mt-3">
            How Shifting Works with Shiftify
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            From your first click to final room-wise unpacking, our structured process makes your move effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between hover:border-orange-500/60 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 font-black text-lg flex items-center justify-center mb-4">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-white font-display">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center gap-1.5 text-xs text-orange-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified step</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenQuoteModal}
            className="py-3.5 px-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all hover:scale-105"
          >
            <span>Start Your Move Process</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

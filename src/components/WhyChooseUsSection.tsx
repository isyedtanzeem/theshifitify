import React from 'react';
import {
  ShieldCheck,
  Clock,
  Receipt,
  Headphones,
  Wrench,
  Truck,
  Sparkles,
  Award,
} from 'lucide-react';
import { WHY_CHOOSE_ITEMS } from '../data/companyData';

export const WhyChooseUsSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-orange-600" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'ReceiptCheck':
      case 'Receipt':
        return <Receipt className="w-6 h-6 text-emerald-600" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6 text-purple-600" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-amber-600" />;
      case 'Truck':
        return <Truck className="w-6 h-6 text-indigo-600" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-orange-600" />;
    }
  };

  return (
    <section id="why-choose-us" className="py-16 sm:py-20 bg-white text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-orange-500" />
            <span>The Shiftify Standard</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Why Choose Shiftify Packers & Movers?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            We focus on careful handling, on-time schedules, and upfront pricing so you can relocate with peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_ITEMS.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                {getIcon(item.icon)}
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

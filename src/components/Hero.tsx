import React from 'react';
import {
  Truck,
  ShieldCheck,
  Clock,
  IndianRupee,
  Headphones,
  MessageCircle,
  ArrowRight,
  Home,
  Briefcase,
  Car,
  Warehouse,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { LeadQuoteForm } from './LeadQuoteForm';
import { getWhatsAppUrl } from '../utils/whatsapp';

interface HeroProps {
  onOpenQuoteModal: () => void;
  onSelectService?: (slug: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteModal, onSelectService }) => {
  return (
    <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden pt-8 pb-16 lg:py-20 border-b border-slate-800">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & Trust Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Location Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-orange-400 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bangalore, Karnataka • Serving Across India</span>
            </div>

            {/* Main H1 Target */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
              Packers and Movers in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400">
                Bangalore
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Trusted packers and movers based in Bangalore providing safe house shifting, hassle-free office relocation, car/bike transport, and secure storage across India.
            </p>

            {/* Quick Service Highlights Pills (as seen in mobile UI mockup) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div
                onClick={() => onSelectService && onSelectService('house-shifting')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 cursor-pointer transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <Home className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">House Shifting</span>
              </div>

              <div
                onClick={() => onSelectService && onSelectService('office-shifting')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 cursor-pointer transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Office Shifting</span>
              </div>

              <div
                onClick={() => onSelectService && onSelectService('vehicle-transport')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 cursor-pointer transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Vehicle Transport</span>
              </div>

              <div
                onClick={() => onSelectService && onSelectService('warehouse-storage')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800 cursor-pointer transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Warehouse className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">Storage Bay</span>
              </div>
            </div>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
              <button
                onClick={onOpenQuoteModal}
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Free Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Quick Trust Highlights */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-layer Packaging</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Hidden Fees</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>On-Time Delivery Guarantee</span>
              </span>
            </div>
          </div>

          {/* Right Column: Multi-Step Lead Form (Directly Interactive on Hero) */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Form container */}
              <div className="relative z-10">
                <div className="bg-slate-900/60 backdrop-blur-sm p-2 rounded-3xl border border-slate-700/50 shadow-2xl">
                  <div className="px-4 py-2 bg-slate-800/90 rounded-2xl mb-2 flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-orange-500" />
                      <span>Instant Price Estimate</span>
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                      Free & No Obligation
                    </span>
                  </div>
                  <LeadQuoteForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: 4 Service Pillars (Matching mockup: Safe & Secure, On Time Delivery, Affordable Pricing, 24/7 Support) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Safe & Secure</h2>
            <p className="text-xs text-slate-400 mt-0.5">Multi-layer protection</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">On-Time Delivery</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scheduled time slots</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Affordable Pricing</h2>
            <p className="text-xs text-slate-400 mt-0.5">Transparent written quotes</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2">
              <Headphones className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-white">24/7 Support</h2>
            <p className="text-xs text-slate-400 mt-0.5">Dedicated move manager</p>
          </div>
        </div>
      </div>
    </section>
  );
};

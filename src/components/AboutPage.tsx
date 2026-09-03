import React, { useEffect } from 'react';
import { Truck, ShieldCheck, Clock, CheckCircle2, Award, Users, MapPin, Phone, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';
import { updatePageSEO } from '../utils/seo';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, onOpenQuoteModal }) => {
  useEffect(() => {
    updatePageSEO({
      title: 'About Shiftify Packers & Movers Bangalore | Our Standards & Mission',
      description:
        'Learn about Shiftify Packers & Movers, Bangalore. Committed to damage-free moving, transparent pricing, and punctual relocation services across India.',
      canonicalPath: '/about',
    });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Bangalore Born & Nationally Connected</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900">
            About Shiftify Packers & Movers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Founded in Bangalore, Karnataka, Shiftify was created to bring clarity, care, and dependable punctuality to the moving industry across India.
          </p>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Care & Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We treat every home and office inventory item as irreplaceable, using 4-layer defensive packing and cushioned handling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Punctual Schedules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We respect your time. Moving teams arrive on schedule and our dedicated long-haul container trucks adhere to strict transit timelines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Transparent Pricing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hidden surcharges or moving day surprises. All packing, labor, vehicle fuel, tolls, and GST are clearly specified upfront.
            </p>
          </div>
        </div>

        {/* Operating Fleet & Capabilities */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Our Infrastructure & Fleet
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Local City Trucks (Tata Ace, 14ft Eicher)</strong>
                Equipped for tight residential lanes and basement height clearances in Bangalore societies.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Sealed Long-Haul Containers (19ft, 22ft, 32ft)</strong>
                Weatherproof locked containers for intercity moves to Mumbai, Delhi, Hyderabad, Chennai, etc.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Hydraulic Enclosed Car Carriers</strong>
                Dedicated wheel-tied carrier vehicles ensuring zero transit wear for your automobile.
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Bangalore Warehouse Storage Hub</strong>
                CCTV-monitored, palletized, pest-controlled storage facilities for short and long-term rental.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onOpenQuoteModal}
            className="py-3.5 px-8 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all hover:scale-105"
          >
            Get Free Moving Quote
          </button>
        </div>
      </div>
    </div>
  );
};

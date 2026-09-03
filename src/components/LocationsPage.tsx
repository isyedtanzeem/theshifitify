import React, { useEffect } from 'react';
import { MapPin, Navigation, ArrowRight, ShieldCheck, Phone, MessageCircle } from 'lucide-react';
import { BANGALORE_LOCALITIES, COMPANY_INFO } from '../data/companyData';
import { updatePageSEO } from '../utils/seo';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface LocationsPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  onNavigate,
  onOpenQuoteModal,
}) => {
  useEffect(() => {
    updatePageSEO({
      title: 'Packers and Movers Bangalore Localities & Coverage | Shiftify',
      description:
        'Explore Shiftify Packers & Movers coverage across all Bangalore localities including HSR Layout, Koramangala, Whitefield, Indiranagar, Electronic City, and more.',
      canonicalPath: '/locations',
    });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bangalore Service Locations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
            Packers & Movers in Every Bangalore Locality
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Shiftify provides same-day local shifting, apartment moves, and packing crews across South, East, North, and West Bangalore.
          </p>
        </div>

        {/* Localities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BANGALORE_LOCALITIES.map((loc, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {loc.zone} Bangalore
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-900 font-display">
                  Packers and Movers in {loc.name}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Specialized in {loc.popularFor.toLowerCase()}. Doorstep survey, quality multi-layer packing, and apartment society gate pass support.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenQuoteModal(`Local Shifting (${loc.name})`)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>Book in {loc.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={getWhatsAppUrl(`Hi Shiftify, I need packers and movers in ${loc.name}, Bangalore.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Direct Contact Banner */}
        <div className="mt-14 bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Moving to or from any other area in Bangalore?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            We operate in 100% of Bangalore pin codes. Get a custom quotation for your exact pickup & drop addresses.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenQuoteModal()}
              className="py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm"
            >
              Get Free Bangalore Quote
            </button>
            <a
              href={getCallUrl()}
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-orange-400" />
              <span>Call: {COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

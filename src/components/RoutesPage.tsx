import React, { useEffect } from 'react';
import { Navigation, ArrowRight, ShieldCheck, Phone, MessageCircle, Truck } from 'lucide-react';
import { POPULAR_ROUTES, COMPANY_INFO } from '../data/companyData';
import { updatePageSEO } from '../utils/seo';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface RoutesPageProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
}

export const RoutesPage: React.FC<RoutesPageProps> = ({
  onNavigate,
  onOpenQuoteModal,
}) => {
  useEffect(() => {
    updatePageSEO({
      title: 'Intercity Packers and Movers Routes from Bangalore | Shiftify',
      description:
        'Pan-India intercity moving routes from Bangalore to Mumbai, Delhi, Hyderabad, Chennai, Pune, Kolkata, and all major Indian cities. Sealed containers & car transport.',
      canonicalPath: '/routes',
    });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase mb-3">
            <Navigation className="w-3.5 h-3.5" />
            <span>Pan-India Moving Corridors</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900">
            Intercity Relocation Routes from Bangalore
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Regular scheduled long-haul container trucks, car carriers, and dedicated household transit to all Indian states.
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {POPULAR_ROUTES.map((route, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-black text-lg text-slate-900 font-display">
                    <span>{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-orange-500" />
                    <span className="text-blue-700">{route.to}</span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    ~{route.distanceKm} km
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 my-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Time</span>
                    <span className="font-bold text-slate-800">{route.typicalTransitDays}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Truck Fleet</span>
                    <span className="font-bold text-slate-800">Sealed Container</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {route.popularTypes.map((t, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenQuoteModal(`Intercity: ${route.from} to ${route.to}`)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>Get Route Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={getWhatsAppUrl(`Hi Shiftify, I would like to check prices for moving from ${route.from} to ${route.to}.`)}
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
      </div>
    </div>
  );
};

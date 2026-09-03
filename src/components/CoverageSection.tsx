import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { BANGALORE_LOCALITIES, POPULAR_ROUTES } from '../data/companyData';

interface CoverageSectionProps {
  onSelectRoute?: (from: string, to: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
}

export const CoverageSection: React.FC<CoverageSectionProps> = ({
  onSelectRoute,
  onOpenQuoteModal,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const zones = ['All', 'South', 'East', 'North', 'West'];

  const filteredLocalities = BANGALORE_LOCALITIES.filter((loc) => {
    const matchesZone = selectedZone === 'All' || loc.zone === selectedZone;
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.popularFor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  return (
    <section id="coverage" className="py-16 sm:py-20 bg-slate-50 text-slate-900 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Bangalore Hub & All-India Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Service Coverage: Bangalore & Pan-India
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Providing door-to-door local shifting in every Bangalore pincode and seamless long-distance routes across all Indian states.
          </p>
        </div>

        {/* Tab / Grid Structure */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Bangalore Localities */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Bangalore Localities Served</span>
                </h3>
                <p className="text-xs text-slate-500">Same-day moving available across all zones</p>
              </div>

              {/* Zone Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {zones.map((zone) => (
                  <button
                    key={zone}
                    onClick={() => setSelectedZone(zone)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      selectedZone === zone
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input for Localities */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search your Bangalore locality (e.g. HSR, Whitefield)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Localities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredLocalities.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => onOpenQuoteModal(`Local Shifting (${loc.name})`)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-orange-50/60 border border-slate-200 hover:border-orange-300 cursor-pointer transition-all flex items-start justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{loc.popularFor}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {loc.zone}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500">
                Don't see your neighborhood? We cover <strong>all 50+ Bangalore zones</strong>.
              </span>
            </div>
          </div>

          {/* Right Column: Major Intercity Relocation Routes */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  <span>Popular Pan-India Routes</span>
                </h3>
                <p className="text-xs text-slate-500">Scheduled interstate carriers & car transport</p>
              </div>

              <div className="space-y-2.5">
                {POPULAR_ROUTES.slice(0, 5).map((route, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onSelectRoute) onSelectRoute(route.from, route.to);
                      onOpenQuoteModal(`Intercity: ${route.from} to ${route.to}`);
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                        <span>{route.from}</span>
                        <ArrowRight className="w-3 h-3 text-orange-500" />
                        <span>{route.to}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {route.distanceKm} km • Est: {route.typicalTransitDays}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-orange-600 group-hover:translate-x-1 transition-transform">
                      Quote →
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => onOpenQuoteModal('Intercity Shifting')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Get Intercity Route Quote</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

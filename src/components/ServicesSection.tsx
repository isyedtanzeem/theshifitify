import React from 'react';
import {
  Home,
  Briefcase,
  Car,
  Warehouse,
  Navigation,
  MapPin,
  Building,
  ArrowRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { SERVICES_LIST, ServiceData } from '../data/servicesData';

interface ServicesSectionProps {
  onSelectService: (slug: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  onOpenQuoteModal,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-6 h-6 text-orange-600" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6 text-blue-600" />;
      case 'Car':
        return <Car className="w-6 h-6 text-emerald-600" />;
      case 'Warehouse':
        return <Warehouse className="w-6 h-6 text-amber-600" />;
      case 'Navigation':
        return <Navigation className="w-6 h-6 text-purple-600" />;
      case 'MapPin':
        return <MapPin className="w-6 h-6 text-rose-600" />;
      case 'Building':
        return <Building className="w-6 h-6 text-indigo-600" />;
      default:
        return <Home className="w-6 h-6 text-orange-600" />;
    }
  };

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Comprehensive Moving Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Our Relocation Services
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Tailored packing and moving solutions for homes, enterprises, vehicles, and secure storage in Bangalore & nationwide.
          </p>
        </div>

        {/* Services Grid (7 full services) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_LIST.map((service: ServiceData) => (
            <div
              key={service.slug}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Icon & Badge Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getIcon(service.iconName)}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    Bangalore & Pan-India
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectService(service.slug)}
                  className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer font-display"
                >
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {service.shortDesc}
                </p>

                {/* Top Features */}
                <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100">
                  {service.features.slice(0, 2).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectService(service.slug)}
                  className="text-xs font-bold text-slate-800 hover:text-orange-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenQuoteModal(service.title)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors"
                >
                  Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

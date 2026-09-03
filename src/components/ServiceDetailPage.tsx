import React, { useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  Clock,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  Home,
  Briefcase,
  Car,
  Warehouse,
  Navigation,
  MapPin,
  Building,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { ServiceData, SERVICES_LIST } from '../data/servicesData';
import { LeadQuoteForm } from './LeadQuoteForm';
import { FaqSection } from './FaqSection';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';
import { COMPANY_INFO } from '../data/companyData';
import { updatePageSEO, getServiceSchema } from '../utils/seo';

interface ServiceDetailPageProps {
  serviceSlug: string;
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  serviceSlug,
  onNavigate,
  onOpenQuoteModal,
}) => {
  const service = SERVICES_LIST.find((s) => s.slug === serviceSlug) || SERVICES_LIST[0];

  useEffect(() => {
    updatePageSEO({
      title: `${service.metaTitle}`,
      description: service.metaDescription,
      canonicalPath: service.canonicalPath,
      schemaData: getServiceSchema(
        service.title,
        service.overview,
        typeof window !== 'undefined' ? `${window.location.origin}${service.canonicalPath}` : ''
      ),
    });
  }, [service]);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Home':
        return <Home className="w-8 h-8 text-orange-400" />;
      case 'Briefcase':
        return <Briefcase className="w-8 h-8 text-blue-400" />;
      case 'Car':
        return <Car className="w-8 h-8 text-emerald-400" />;
      case 'Warehouse':
        return <Warehouse className="w-8 h-8 text-amber-400" />;
      case 'Navigation':
        return <Navigation className="w-8 h-8 text-purple-400" />;
      case 'MapPin':
        return <MapPin className="w-8 h-8 text-rose-400" />;
      case 'Building':
        return <Building className="w-8 h-8 text-indigo-400" />;
      default:
        return <Home className="w-8 h-8 text-orange-400" />;
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="bg-slate-900 text-slate-400 text-xs py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => onNavigate('/#services')} className="hover:text-white transition-colors">
            Services
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-orange-400 font-semibold">{service.title}</span>
        </div>
      </div>

      {/* Service Page Hero */}
      <section className="bg-slate-950 text-white py-12 sm:py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Col: Hero Information */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 text-orange-400 text-xs font-bold uppercase tracking-wider">
                {getServiceIcon(service.iconName)}
                <span>Bangalore & Pan-India Service</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {service.title}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-medium">
                {service.heroTagline}
              </p>

              <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {service.overview}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href={getWhatsAppUrl(`Hi Shiftify, I would like a quote for ${service.title}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Quote</span>
                </a>

                <a
                  href={getCallUrl()}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>Call: {COMPANY_INFO.phone}</span>
                </a>
              </div>
            </div>

            {/* Right Col: Interactive Lead Form */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 p-2 rounded-3xl border border-slate-800 shadow-2xl">
                <div className="px-4 py-2 bg-slate-800 rounded-2xl mb-2 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-bold text-white">Get Instant Free Quote</span>
                  <span className="text-[11px] text-orange-400 font-semibold">{service.title}</span>
                </div>
                <LeadQuoteForm initialMovingType={service.title} isCompact />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features & Safeguards */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Key Advantages of Shiftify {service.title}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our systematic approach guarantees safety, speed, and complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {service.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packing Materials Grade */}
      <section className="py-14 sm:py-16 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold uppercase">
                <Package className="w-3.5 h-3.5 text-orange-600" />
                <span>Zero Damage Protocol</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                Premium Packaging Materials Used
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We never compromise on packing materials. Every box, wrap, and tape is commercial industrial grade to protect against impact, vibration, and dampness.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.packingMaterialsUsed.map((mat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">{mat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Move Execution Flow */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Our 4-Step Moving Execution
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              From survey to final room-by-room setup, here is how we handle your move.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.process.map((step, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-extrabold flex items-center justify-center text-sm mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service-Specific FAQs */}
      <FaqSection
        customFaqs={service.faqs}
        title={`${service.title} FAQs`}
        subtitle={`Frequently asked questions about ${service.title.toLowerCase()} in Bangalore and interstate routes.`}
      />

      {/* Other Services Navigation Bar */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 text-center sm:text-left">
            Other Moving Services by Shiftify
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SERVICES_LIST.filter((s) => s.slug !== service.slug).map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  onNavigate(`/services/${s.slug}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-orange-600 border border-slate-700 hover:border-orange-500 text-slate-200 hover:text-white font-semibold text-xs text-center transition-all group"
              >
                <div className="line-clamp-2">{s.title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

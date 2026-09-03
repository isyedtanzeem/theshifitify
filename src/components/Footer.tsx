import React from 'react';
import {
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { COMPANY_INFO, BANGALORE_LOCALITIES, POPULAR_ROUTES } from '../data/companyData';
import { SERVICES_LIST } from '../data/servicesData';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
  onOpenIntegrationModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenQuoteModal,
  onOpenIntegrationModal,
}) => {
  const handleLink = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 text-xs">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => handleLink('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Truck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white font-display">
                Shiftify Packers & Movers
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Bangalore's trusted relocation company. Providing safe residential shifting, commercial office moving, enclosed vehicle transport, and clean warehouse storage across all Bangalore localities and pan-India destinations.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <a
                  href={COMPANY_INFO.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors"
                  title="Open location in Google Maps"
                >
                  {COMPANY_INFO.officeAddress}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={getCallUrl()} className="hover:text-orange-400">
                  {COMPANY_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-orange-400">
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Move Desk</span>
              </a>
            </div>
          </div>

          {/* Services Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Relocation Services
            </h4>
            <ul className="space-y-2">
              {SERVICES_LIST.map((svc) => (
                <li key={svc.slug}>
                  <button
                    onClick={() => handleLink(`/services/${svc.slug}`)}
                    className="text-slate-400 hover:text-orange-400 transition-colors text-left"
                  >
                    {svc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Bangalore Localities Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Bangalore Coverage
            </h4>
            <ul className="space-y-2">
              {BANGALORE_LOCALITIES.slice(0, 6).map((loc, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLink('/locations')}
                    className="text-slate-400 hover:text-orange-400 transition-colors text-left"
                  >
                    Packers in {loc.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleLink('/locations')}
                  className="text-orange-400 font-semibold hover:underline"
                >
                  View All Localities →
                </button>
              </li>
            </ul>
          </div>

          {/* Intercity Routes & Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Popular Routes
            </h4>
            <ul className="space-y-2">
              {POPULAR_ROUTES.slice(0, 5).map((route, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleLink('/routes')}
                    className="text-slate-400 hover:text-orange-400 transition-colors text-left"
                  >
                    {route.from} to {route.to}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleLink('/routes')}
                  className="text-orange-400 font-semibold hover:underline"
                >
                  All Intercity Routes →
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Architecture and Google Sheet Integration Helper Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => handleLink('/')} className="hover:text-slate-200">
              Home
            </button>
            <button onClick={() => handleLink('/about')} className="hover:text-slate-200">
              About Us
            </button>
            <button onClick={() => handleLink('/contact')} className="hover:text-slate-200">
              Contact Us
            </button>
            <button onClick={() => handleLink('/locations')} className="hover:text-slate-200">
              Bangalore Localities
            </button>
            <button onClick={() => handleLink('/routes')} className="hover:text-slate-200">
              Pan-India Routes
            </button>
            <button onClick={() => handleLink('/track')} className="hover:text-slate-200">
              Track Enquiry
            </button>
            <button onClick={() => handleLink('/admin')} className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
              <span>Admin Portal</span>
            </button>
            <a href="/sitemap.xml" target="_blank" className="hover:text-slate-200">
              sitemap.xml
            </a>
            <a href="/robots.txt" target="_blank" className="hover:text-slate-200">
              robots.txt
            </a>
          </div>

          {onOpenIntegrationModal && (
            <button
              onClick={onOpenIntegrationModal}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-orange-400 hover:border-orange-500 flex items-center gap-1.5 transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Google Sheets Integration Guide</span>
            </button>
          )}
        </div>

        {/* Copyright notice */}
        <div className="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} Shiftify Packers & Movers. All rights reserved. Bangalore, Karnataka, India.</p>
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Lead Processing & Data Privacy</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

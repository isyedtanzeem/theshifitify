import React, { useState } from 'react';
import {
  Truck,
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  Shield,
  Clock,
  Search,
  Home,
  Briefcase,
  Car,
  Warehouse,
  MapPin,
  Building,
  Navigation,
} from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';
import { SERVICES_LIST } from '../data/servicesData';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenQuoteModal: (serviceType?: string) => void;
  onOpenTrackModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenQuoteModal,
  onOpenTrackModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const serviceIconMap: Record<string, React.ReactNode> = {
    'house-shifting': <Home className="w-4 h-4 text-orange-500" />,
    'office-shifting': <Briefcase className="w-4 h-4 text-orange-500" />,
    'vehicle-transport': <Car className="w-4 h-4 text-orange-500" />,
    'warehouse-storage': <Warehouse className="w-4 h-4 text-orange-500" />,
    'local-shifting': <Navigation className="w-4 h-4 text-orange-500" />,
    'intercity-shifting': <MapPin className="w-4 h-4 text-orange-500" />,
    'corporate-relocation': <Building className="w-4 h-4 text-orange-500" />,
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
      {/* Top micro-bar for direct contact */}
      <div className="bg-slate-900/80 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/60 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>Bangalore, Karnataka • Serving Across India</span>
            </span>
            <span className="hidden md:inline-block text-slate-500">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>24/7 Booking & Support</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/admin')}
              className="text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1 text-xs"
            >
              <Shield className="w-3 h-3 text-orange-400" />
              <span>Admin</span>
            </button>
            <button
              onClick={onOpenTrackModal}
              className="text-slate-300 hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              <span>Track Enquiry</span>
            </button>
            <a
              href={getCallUrl()}
              className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-tight text-white font-display">
                  Shiftify
                </span>
                <span className="text-orange-500 font-bold text-xl">.</span>
              </div>
              <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
                Packers & Movers
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() => handleNavClick('/')}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                currentPath === '/' ? 'text-orange-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                className={`text-sm font-medium flex items-center gap-1 transition-colors hover:text-orange-400 ${
                  currentPath.startsWith('/services') ? 'text-orange-400 font-semibold' : 'text-slate-200'
                }`}
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2">
                    {SERVICES_LIST.map((svc) => (
                      <button
                        key={svc.slug}
                        onClick={() => handleNavClick(`/services/${svc.slug}`)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                      >
                        <div className="p-1.5 rounded-md bg-slate-800/80 border border-slate-700/60">
                          {serviceIconMap[svc.slug]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{svc.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{svc.shortDesc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('/locations')}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                currentPath === '/locations' ? 'text-orange-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Bangalore Localities
            </button>

            <button
              onClick={() => handleNavClick('/routes')}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                currentPath === '/routes' ? 'text-orange-400 font-semibold' : 'text-slate-200'
              }`}
            >
              All India Routes
            </button>

            <button
              onClick={() => handleNavClick('/about')}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                currentPath === '/about' ? 'text-orange-400 font-semibold' : 'text-slate-200'
              }`}
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('/contact')}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                currentPath === '/contact' ? 'text-orange-400 font-semibold' : 'text-slate-200'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Chat with us on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => onOpenQuoteModal()}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition-all hover:shadow-orange-600/50 hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              <span>Get Free Quote</span>
            </button>
          </div>

          {/* Mobile Right Controls: Phone + Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href={getCallUrl()}
              className="p-2 rounded-lg bg-slate-800 text-orange-400 hover:bg-slate-700 transition-colors"
              aria-label="Call Shiftify"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu (matching design from mockup) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 overflow-y-auto lg:hidden animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-white">Shiftify Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-1">
              <button
                onClick={() => handleNavClick('/')}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-orange-400" />
                  <span>Home</span>
                </span>
              </button>

              <div className="bg-slate-900/40 rounded-xl p-2 border border-slate-800/80 space-y-1">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Our Moving Services
                </div>
                {SERVICES_LIST.map((svc) => (
                  <button
                    key={svc.slug}
                    onClick={() => handleNavClick(`/services/${svc.slug}`)}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5"
                  >
                    {serviceIconMap[svc.slug]}
                    <span>{svc.title}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQuoteModal();
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-orange-600/20 border border-orange-500/40 text-orange-400 font-semibold flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span>Get Free Quote (4-Step Form)</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTrackModal();
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-orange-400" />
                  <span>Track Existing Enquiry</span>
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/locations')}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Bangalore Localities Coverage</span>
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/routes')}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <Navigation className="w-4 h-4 text-orange-400" />
                  <span>Pan-India Intercity Routes</span>
                </span>
              </button>

              <button
                onClick={() => handleNavClick('/about')}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span>About Shiftify</span>
              </button>

              <button
                onClick={() => handleNavClick('/contact')}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-100 font-medium flex items-center justify-between"
              >
                <span>Contact & Support</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href={getCallUrl()}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-100 font-bold flex items-center justify-center gap-2 border border-slate-700"
            >
              <Phone className="w-5 h-5 text-orange-400" />
              <span>Call: {COMPANY_INFO.phone}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

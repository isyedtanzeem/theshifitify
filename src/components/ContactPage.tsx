import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Truck, ExternalLink } from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';
import { updatePageSEO } from '../utils/seo';
import { getWhatsAppUrl, getCallUrl } from '../utils/whatsapp';
import { LeadQuoteForm } from './LeadQuoteForm';

interface ContactPageProps {
  onOpenQuoteModal: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenQuoteModal }) => {
  useEffect(() => {
    updatePageSEO({
      title: 'Contact Shiftify Packers & Movers Bangalore | Phone, WhatsApp & Address',
      description: `Contact Shiftify Packers & Movers in Bangalore. Call ${COMPANY_INFO.phone} or WhatsApp for immediate shifting support, free surveys, and moving quotes.`,
      canonicalPath: '/contact',
    });
  }, []);

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900">
            Contact Shiftify Packers & Movers
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Get in touch with our Bangalore coordination desk for immediate price estimates, booking inquiries, or consignment status.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Bangalore Head Office
              </h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Office Address:</strong>
                    <p className="text-slate-600 mt-0.5">{COMPANY_INFO.officeAddress}</p>
                    <a
                      href={COMPANY_INFO.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline mt-1"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Phone Helpline:</strong>
                    <a href={getCallUrl()} className="text-orange-600 font-semibold hover:underline mt-0.5 block">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">WhatsApp Move Desk:</strong>
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-semibold hover:underline mt-0.5 block"
                    >
                      {COMPANY_INFO.phone} (Click to Chat)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Email Inquiries:</strong>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-slate-700 hover:underline mt-0.5 block">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm">Working Hours:</strong>
                    <p className="text-slate-600 mt-0.5">{COMPANY_INFO.operatingHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Quick WhatsApp Action */}
            <div className="bg-emerald-700 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4 shadow-lg shadow-emerald-700/20">
              <div>
                <h3 className="text-lg font-bold font-display">Chat with Move Coordinator</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  Average response time is under 5 minutes on WhatsApp.
                </p>
              </div>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-5 rounded-xl bg-white text-emerald-800 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md hover:bg-emerald-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Open Chat</span>
              </a>
            </div>
          </div>

          {/* Right Column: Embedded Quote Form */}
          <div className="lg:col-span-6">
            <div className="bg-slate-950 p-2 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="px-5 py-3 bg-slate-900 rounded-2xl mb-2 flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>Send Quotation Request</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  Instant Response
                </span>
              </div>
              <LeadQuoteForm isCompact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

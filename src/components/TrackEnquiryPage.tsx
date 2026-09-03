import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Truck, User, Phone, CheckCircle2, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { trackLead } from '../utils/leadService';
import { Lead } from '../types/lead';
import { getEnquiryWhatsAppUrl, getCallUrl } from '../utils/whatsapp';
import { updatePageSEO } from '../utils/seo';

export const TrackEnquiryPage: React.FC = () => {
  const [enquiryId, setEnquiryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [leadResult, setLeadResult] = useState<Lead | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    updatePageSEO({
      title: 'Track Moving Enquiry | Shiftify Packers & Movers',
      description: 'Check status and assigned coordinator details for your Shiftify Packers & Movers moving enquiry.',
      canonicalPath: '/track',
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = enquiryId.trim();
    if (!cleanId) {
      setErrorMessage('Please enter an Enquiry ID (e.g. SFY...)');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLeadResult(null);

    const res = await trackLead(cleanId);
    setIsLoading(false);

    if (res.success && res.lead) {
      setLeadResult(res.lead);
    } else {
      setErrorMessage(res.error || 'Enquiry not found. Please verify your ID or contact support.');
    }
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-12 sm:py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
            <Search className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Track Your Moving Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Check the status of your moving quote and connect with your coordinator.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="trackIdInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shiftify Enquiry ID
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="trackIdInput"
                  type="text"
                  placeholder="e.g. SFY2609021234"
                  value={enquiryId}
                  onChange={(e) => setEnquiryId(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search Status</span>
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {leadResult && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="px-3 py-1 rounded-full font-extrabold bg-emerald-100 text-emerald-800 text-xs">
                  {leadResult.status || 'NEW / IN REVIEW'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <span>Moving Type:</span>
                </span>
                <span className="font-bold text-slate-900">{leadResult.movingType}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Route:</span>
                </span>
                <span className="font-bold text-slate-900 text-right max-w-[60%]">
                  {leadResult.fromLocation} ➡️ {leadResult.toLocation}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Moving Date:</span>
                </span>
                <span className="font-bold text-slate-900">{leadResult.movingDate}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Customer Name:</span>
                </span>
                <span className="font-bold text-slate-900">{leadResult.name}</span>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <a
                  href={getEnquiryWhatsAppUrl(leadResult.leadId, leadResult)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href={getCallUrl()}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-orange-400" />
                  <span>Call Move Coordinator</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

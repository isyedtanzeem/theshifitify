import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, Phone, MessageCircle, AlertCircle, Loader2, MapPin, Calendar, Truck } from 'lucide-react';
import { trackLead } from '../utils/leadService';
import { Lead } from '../types/lead';
import { getEnquiryWhatsAppUrl, getCallUrl } from '../utils/whatsapp';

interface TrackEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackEnquiryModal: React.FC<TrackEnquiryModalProps> = ({ isOpen, onClose }) => {
  const [enquiryId, setEnquiryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [leadResult, setLeadResult] = useState<Lead | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = enquiryId.trim();
    if (!cleanId) {
      setErrorMessage('Please enter an Enquiry ID (e.g., SFY...)');
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
      setErrorMessage(res.error || 'Enquiry ID not found. Please check and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 font-display">
            Track Enquiry Status
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enter your Shiftify Enquiry ID (starts with SFY) to check status.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. SFY2609021234"
              value={enquiryId}
              onChange={(e) => setEnquiryId(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-600/30 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Track Status</span>
          </button>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {leadResult && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px]">
                {leadResult.status || 'NEW / IN REVIEW'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                <span>Service:</span>
              </span>
              <span className="font-semibold text-slate-900">{leadResult.movingType}</span>
            </div>

            <div className="flex items-start justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Route:</span>
              </span>
              <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                {leadResult.fromLocation} ➡️ {leadResult.toLocation}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Moving Date:</span>
              </span>
              <span className="font-semibold text-slate-900">{leadResult.movingDate}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <a
                href={getEnquiryWhatsAppUrl(leadResult.leadId, leadResult)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Connect via WhatsApp</span>
              </a>

              <a
                href={getCallUrl()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-orange-400" />
                <span>Call Move Coordinator</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

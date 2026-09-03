import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  LogOut,
  ExternalLink,
  RefreshCw,
  Menu,
  X,
  Phone,
  Plus,
  FileText,
  Receipt,
  Search,
  Bell,
  CheckCircle2,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { clearAdminSession, getStoredAdminUser, syncGoogleSheets } from '../../utils/adminAuth';
import { COMPANY_INFO } from '../../data/companyData';
import { getCallUrl } from '../../utils/whatsapp';

interface AdminLayoutProps {
  currentAdminPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminPath,
  onNavigate,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState('');

  const adminUser = getStoredAdminUser() || {
    email: 'isyedtanzeemahmed@gmail.com',
    name: 'Shiftify Operations Admin',
    role: 'Operations Admin',
  };

  const handleLogout = () => {
    clearAdminSession();
    onNavigate('/admin/login');
  };

  const handleSyncSheets = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    const res = await syncGoogleSheets();
    setSyncing(false);
    if (res.success) {
      setSyncFeedback(res.message || 'Synchronized successfully with Google Sheets CRM Desk');
      setTimeout(() => setSyncFeedback(null), 3500);
      window.dispatchEvent(new CustomEvent('shiftify_admin_refresh'));
    } else {
      setSyncFeedback(res.error || 'Sync failed. Local cache active.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    // Route to leads search or quotations search
    onNavigate(`/admin/leads?search=${encodeURIComponent(globalSearch.trim())}`);
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Leads',
      path: '/admin/leads',
      icon: Users,
    },
    {
      label: 'Quotations',
      path: '/admin/quotations',
      icon: Receipt,
    },
    {
      label: 'Invoices',
      path: '/admin/invoices',
      icon: FileText,
    },
    {
      label: 'Follow-ups',
      path: '/admin/followups',
      icon: CalendarCheck,
    },
  ];

  const isItemActive = (path: string) => {
    if (path === '/admin') return currentAdminPath === '/admin';
    if (path === '/admin/leads/new') return currentAdminPath === '/admin/leads/new';
    if (path === '/admin/leads') {
      return currentAdminPath.startsWith('/admin/leads') && currentAdminPath !== '/admin/leads/new';
    }
    return currentAdminPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900 flex flex-col antialiased font-sans">
      {/* Top Header - Stitch Light Theme */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-8 py-2.5 shadow-xs">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              id="admin-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                S
              </div>
              <span className="font-bold text-base text-slate-900">Shiftify</span>
            </div>
          </div>

          {/* Search bar - Stitch style */}
          <div className="hidden md:flex flex-1 max-w-md items-center">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="global-admin-search"
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search leads, quotes, vehicles..."
                className="w-full pl-9 pr-12 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-orange-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs font-mono">
                ⌘K
              </span>
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* Sync Sheets button */}
            <button
              id="admin-sync-sheets-btn"
              onClick={handleSyncSheets}
              disabled={syncing}
              title="Sync with Google Sheets CRM Desk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${syncing ? 'animate-spin text-orange-600' : ''}`} />
              <span className="hidden sm:inline">Sync Sheets</span>
            </button>

            {/* Customer Site */}
            <button
              id="admin-view-website-btn"
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Customer Site</span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              id="admin-notifications-btn"
              title="Notifications"
              className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-600 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Admin Profile & Logout */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-700 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                TO
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {adminUser.name || 'Shiftify Operations Admin'}
                </div>
                <div className="text-[11px] text-slate-500 leading-tight">
                  {adminUser.email || 'isyedtanzeemahmed@gmail.com'}
                </div>
              </div>
              <button
                id="admin-logout-btn"
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {syncFeedback && (
          <div className="w-full mt-2 py-1.5 px-3.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center justify-between border border-emerald-200 shadow-2xs animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {syncFeedback}
            </span>
            <button onClick={() => setSyncFeedback(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar Navigation - Stitch Light Theme (Width: 260px) */}
        <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-slate-200 shrink-0 p-4 justify-between min-h-[calc(100vh-57px)]">
          <div className="space-y-4">
            {/* Logo in Sidebar */}
            <div
              onClick={() => onNavigate('/admin')}
              className="flex items-center gap-3 px-1 py-1 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-extrabold shadow-sm shadow-orange-500/20">
                S
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-orange-600 transition">
                  Shiftify
                </div>
                <div className="text-[11px] text-slate-400 font-medium -mt-0.5">
                  Relocation CRM & Desk
                </div>
              </div>
            </div>

            {/* Primary Action: Create Lead Button (Stitch signature orange button) */}
            <button
              id="sidebar-create-lead-btn"
              onClick={() => onNavigate('/admin/leads/new')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-500/20 hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lead</span>
            </button>

            {/* Section Header: OPERATIONS */}
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-3 mb-1.5">
                OPERATIONS
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.path);
                  return (
                    <button
                      key={item.path}
                      id={`nav-link-${item.path.replace('/', '-')}`}
                      onClick={() => onNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Bottom Live Sync & Desk Widget (Stitch Screenshot 1/2/3) */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/80 space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Live Connected</span>
              </div>
              <button
                onClick={handleSyncSheets}
                title="Sync now"
                disabled={syncing}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Sheet Live Sync</span>
              <span className="font-medium text-slate-700">Just now</span>
            </div>
            <div className="pt-2 border-t border-blue-100/90 space-y-0.5">
              <div className="text-[10px] font-semibold text-slate-500">
                Emergency Operations Desk:
              </div>
              <a
                href={getCallUrl()}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
              >
                <Phone className="w-3 h-3 text-blue-600" />
                <span>+91 98452 01449</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] z-30 bg-white border-b border-slate-200 p-4 shadow-xl space-y-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                onNavigate('/admin/leads/new');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 text-white font-bold text-xs mb-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lead</span>
            </button>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    onNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-orange-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onNavigate('/');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Back to Customer Website</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

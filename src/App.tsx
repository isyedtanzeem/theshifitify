/**
 * Shiftify Packers & Movers - Main Application Component
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUsSection } from './components/WhyChooseUsSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { CoverageSection } from './components/CoverageSection';
import { FaqSection } from './components/FaqSection';
import { FinalCTASection } from './components/FinalCTASection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { QuoteModal } from './components/QuoteModal';
import { TrackEnquiryModal } from './components/TrackEnquiryModal';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { ServiceDetailPage } from './components/ServiceDetailPage';
import { LocationsPage } from './components/LocationsPage';
import { RoutesPage } from './components/RoutesPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { TrackEnquiryPage } from './components/TrackEnquiryPage';
import { QuotePage } from './components/QuotePage';
import { BlogPage } from './components/BlogPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLeadsList } from './components/admin/AdminLeadsList';
import { AdminCreateLeadPage } from './components/admin/AdminCreateLeadPage';
import { AdminFollowupsList } from './components/admin/AdminFollowupsList';
import { AdminQuotationsList } from './components/admin/AdminQuotationsList';
import { AdminQuotationBuilder } from './components/admin/AdminQuotationBuilder';
import { AdminInvoicesList } from './components/admin/AdminInvoicesList';
import { AdminInvoiceBuilder } from './components/admin/AdminInvoiceBuilder';
import { isAdminAuthenticated } from './utils/adminAuth';
import { updatePageSEO, getLocalBusinessSchema, getFAQSchema } from './utils/seo';
import { HOMEPAGE_FAQS } from './data/companyData';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [quoteModalOpen, setQuoteModalOpen] = useState<boolean>(false);
  const [quoteModalService, setQuoteModalService] = useState<string>('House Shifting');
  const [trackModalOpen, setTrackModalOpen] = useState<boolean>(false);
  const [integrationModalOpen, setIntegrationModalOpen] = useState<boolean>(false);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    if (path.startsWith('/#')) {
      // Handle in-page hash scroll
      const elId = path.replace('/#', '');
      const el = document.getElementById(elId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // SEO metadata setup for homepage
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      updatePageSEO({
        title: 'Packers and Movers in Bangalore | Shiftify Packers & Movers',
        description:
          'Bangalore-based Shiftify Packers & Movers offers safe house shifting, office relocation, vehicle transport, and pan-India moving services. Get an instant quote.',
        canonicalPath: '/',
        schemaData: {
          ...getLocalBusinessSchema(),
          ...getFAQSchema(HOMEPAGE_FAQS),
        },
      });
    }
  }, [currentPath]);

  const openQuoteModalWithService = (serviceType?: string) => {
    if (serviceType) {
      setQuoteModalService(serviceType);
    }
    setQuoteModalOpen(true);
  };

  // Protected Admin Area Router
  if (currentPath.startsWith('/admin')) {
    if (currentPath === '/admin/login') {
      return (
        <AdminLogin
          onLoginSuccess={() => navigateTo('/admin')}
          onGoHome={() => navigateTo('/')}
        />
      );
    }

    // Protect all /admin routes from unauthenticated access
    if (!isAdminAuthenticated()) {
      return (
        <AdminLogin
          onLoginSuccess={() => navigateTo(currentPath)}
          onGoHome={() => navigateTo('/')}
        />
      );
    }

    const renderAdminContent = () => {
      if (currentPath === '/admin/leads/new') {
        return <AdminCreateLeadPage onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/admin/leads')) {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const statusParam = urlParams ? urlParams.get('status') || undefined : undefined;
        return <AdminLeadsList initialStatusFilter={statusParam} onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/admin/followups')) {
        return <AdminFollowupsList />;
      }
      if (currentPath.startsWith('/admin/quotations/new')) {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const leadIdParam = urlParams?.get('leadId') || null;
        return <AdminQuotationBuilder leadIdParam={leadIdParam} onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/admin/quotations')) {
        return <AdminQuotationsList onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/admin/invoices/new')) {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const quotationIdParam = urlParams?.get('quotationId') || null;
        const leadIdParam = urlParams?.get('leadId') || null;
        return (
          <AdminInvoiceBuilder
            quotationIdParam={quotationIdParam}
            leadIdParam={leadIdParam}
            onNavigate={navigateTo}
          />
        );
      }
      if (currentPath.startsWith('/admin/invoices')) {
        return <AdminInvoicesList onNavigate={navigateTo} />;
      }
      return <AdminDashboard onNavigate={navigateTo} />;
    };

    return (
      <AdminLayout currentAdminPath={currentPath} onNavigate={navigateTo}>
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // Render sub-pages or homepage
  const renderCurrentView = () => {
    // Service Detail Route: /services/:slug
    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '').split('?')[0].split('#')[0];
      return (
        <ServiceDetailPage
          serviceSlug={slug}
          onNavigate={navigateTo}
          onOpenQuoteModal={openQuoteModalWithService}
        />
      );
    }

    if (currentPath === '/locations') {
      return <LocationsPage onNavigate={navigateTo} onOpenQuoteModal={openQuoteModalWithService} />;
    }

    if (currentPath === '/routes') {
      return <RoutesPage onNavigate={navigateTo} onOpenQuoteModal={openQuoteModalWithService} />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigateTo} onOpenQuoteModal={() => openQuoteModalWithService()} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onOpenQuoteModal={() => openQuoteModalWithService()} />;
    }

    if (currentPath === '/track') {
      return <TrackEnquiryPage />;
    }

    if (currentPath === '/quote') {
      return <QuotePage />;
    }

    if (currentPath === '/blog') {
      return <BlogPage onOpenQuoteModal={() => openQuoteModalWithService()} />;
    }

    // Default: Homepage
    return (
      <main>
        {/* Hero with H1 "Packers and Movers in Bangalore" */}
        <Hero
          onOpenQuoteModal={() => openQuoteModalWithService('House Shifting')}
          onSelectService={(slug) => navigateTo(`/services/${slug}`)}
        />

        {/* Services Section */}
        <ServicesSection
          onSelectService={(slug) => navigateTo(`/services/${slug}`)}
          onOpenQuoteModal={openQuoteModalWithService}
        />

        {/* Why Choose Us Section */}
        <WhyChooseUsSection />

        {/* How It Works Section */}
        <HowItWorksSection
          onOpenQuoteModal={() => openQuoteModalWithService('House Shifting')}
        />

        {/* Bangalore & All India Coverage */}
        <CoverageSection
          onOpenQuoteModal={openQuoteModalWithService}
          onSelectRoute={(from, to) => openQuoteModalWithService(`Intercity: ${from} to ${to}`)}
        />

        {/* FAQ Section */}
        <FaqSection />

        {/* Final CTA Banner */}
        <FinalCTASection
          onOpenQuoteModal={() => openQuoteModalWithService('House Shifting')}
        />
      </main>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* Header with Shiftify Branding & Mobile Menu */}
      <Header
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenQuoteModal={() => openQuoteModalWithService()}
        onOpenTrackModal={() => setTrackModalOpen(true)}
      />

      {/* Main Page Content */}
      <div className="flex-1">{renderCurrentView()}</div>

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onOpenQuoteModal={openQuoteModalWithService}
        onOpenIntegrationModal={() => setIntegrationModalOpen(true)}
      />

      {/* Persistent Floating WhatsApp Button */}
      <FloatingWhatsApp />

      {/* Modal Overlays */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        serviceType={quoteModalService}
      />

      <TrackEnquiryModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      <IntegrationGuideModal
        isOpen={integrationModalOpen}
        onClose={() => setIntegrationModalOpen(false)}
      />
    </div>
  );
}

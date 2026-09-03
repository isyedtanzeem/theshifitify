import { COMPANY_INFO } from '../data/companyData';

export interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
  schemaData?: object;
}

/**
 * Updates document title, meta tags, canonical links, and injects JSON-LD script for SPA routing.
 */
export function updatePageSEO({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  schemaData,
}: SEOProps) {
  // Update Title
  document.title = title;

  // Helper to set or create meta tag
  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:type', ogType);

  const fullUrl = `${window.location.origin}${canonicalPath}`;
  setMeta('property', 'og:url', fullUrl);

  // Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // JSON-LD Structured Data
  const jsonLdId = 'shiftify-schema-jsonld';
  let jsonLdScript = document.getElementById(jsonLdId) as HTMLScriptElement | null;
  if (schemaData) {
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = jsonLdId;
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(schemaData);
  } else if (jsonLdScript) {
    jsonLdScript.remove();
  }
}

/**
 * Schema for LocalBusiness / MovingCompany
 */
export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: COMPANY_INFO.name,
    description: 'Professional Packers and Movers in Bangalore offering house shifting, office relocation, vehicle transport, and pan-India moving services.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://shiftify.in',
    telephone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
    hasMap: COMPANY_INFO.googleMapsLink,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '52/1, Khazi Street, Basavanagudi',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      postalCode: '560004',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 12.9438,
      longitude: 77.5746,
    },
    areaServed: [
      { '@type': 'City', name: 'Bangalore' },
      { '@type': 'Country', name: 'India' },
    ],
    priceRange: '₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
  };
}

/**
 * Schema for individual Service
 */
export function getServiceSchema(serviceTitle: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceTitle,
    provider: {
      '@type': 'MovingCompany',
      name: COMPANY_INFO.name,
      telephone: COMPANY_INFO.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bangalore',
        addressRegion: 'Karnataka',
        addressCountry: 'IN',
      },
    },
    areaServed: {
      '@type': 'City',
      name: 'Bangalore',
    },
    description: description,
    url: url,
  };
}

/**
 * Schema for FAQ Page
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

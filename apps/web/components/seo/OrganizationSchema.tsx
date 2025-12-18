/**
 * Organization JSON-LD Schema Component
 *
 * Renders structured data for the business/organization.
 * Should be included in the root layout for site-wide SEO.
 *
 * @see https://schema.org/Organization
 * @see https://developers.google.com/search/docs/appearance/structured-data/organization
 * @packageDocumentation
 */

import Script from 'next/script';

// ============================================================================
// Configuration
// ============================================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sage-portal.webexpr.dev';

// ============================================================================
// Types
// ============================================================================

export interface OrganizationSchemaProps {
  /** Organization name */
  name?: string;
  /** Legal business name */
  legalName?: string;
  /** Organization description */
  description?: string;
  /** Logo URL (should be high resolution, min 112x112px) */
  logoUrl?: string;
  /** Website URL */
  url?: string;
  /** Email address */
  email?: string;
  /** Phone number in international format */
  telephone?: string;
  /** Physical address */
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  /** Social media profile URLs */
  socialProfiles?: string[];
  /** Same as URLs (Wikipedia, Wikidata, etc.) */
  sameAs?: string[];
  /** VAT/Tax ID */
  vatId?: string;
  /** Year founded */
  foundingDate?: string;
  /** Founders */
  founders?: Array<{ name: string; url?: string }>;
  /** Areas served (country codes) */
  areaServed?: string[];
}

// ============================================================================
// Default Values
// ============================================================================

const defaultProps: OrganizationSchemaProps = {
  name: 'WebexpR Pro',
  legalName: 'WebexpR Pro SAS',
  description:
    'Grossiste B2B specialise dans la distribution de bijoux de luxe pour les professionnels. Large selection de colliers, bagues, bracelets et montres des plus grandes marques.',
  logoUrl: `${SITE_URL}/logo.png`,
  url: SITE_URL,
  email: 'contact@sage-portal.webexpr.dev',
  telephone: '+33 1 23 45 67 89',
  address: {
    streetAddress: '123 Avenue des Champs-Elysees',
    addressLocality: 'Paris',
    addressRegion: 'Ile-de-France',
    postalCode: '75008',
    addressCountry: 'FR',
  },
  areaServed: ['FR', 'BE', 'CH', 'LU', 'MC'],
  foundingDate: '2020',
};

// ============================================================================
// Component
// ============================================================================

export function OrganizationSchema(props: OrganizationSchemaProps = {}) {
  const {
    name = defaultProps.name,
    legalName = defaultProps.legalName,
    description = defaultProps.description,
    logoUrl = defaultProps.logoUrl,
    url = defaultProps.url,
    email = defaultProps.email,
    telephone = defaultProps.telephone,
    address = defaultProps.address,
    socialProfiles = [],
    sameAs = [],
    vatId,
    foundingDate = defaultProps.foundingDate,
    founders = [],
    areaServed = defaultProps.areaServed,
  } = props;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}/#organization`,
    name,
    legalName,
    description,
    url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${url}/#logo`,
      url: logoUrl,
      contentUrl: logoUrl,
      caption: name,
      inLanguage: 'fr-FR',
    },
    image: logoUrl,
    email,
    telephone,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address.streetAddress,
        addressLocality: address.addressLocality,
        addressRegion: address.addressRegion,
        postalCode: address.postalCode,
        addressCountry: address.addressCountry,
      },
    }),
    ...(socialProfiles.length > 0 || sameAs.length > 0
      ? { sameAs: [...socialProfiles, ...sameAs] }
      : {}),
    ...(vatId && { vatID: vatId }),
    ...(foundingDate && { foundingDate }),
    ...(founders.length > 0 && {
      founder: founders.map((f) => ({
        '@type': 'Person',
        name: f.name,
        ...(f.url && { url: f.url }),
      })),
    }),
    ...(areaServed &&
      areaServed.length > 0 && {
        areaServed: areaServed.map((code) => ({
          '@type': 'Country',
          name: code,
        })),
      }),
    // B2B specific properties
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone,
        contactType: 'customer service',
        email,
        availableLanguage: ['French', 'English'],
        areaServed: areaServed,
      },
      {
        '@type': 'ContactPoint',
        telephone,
        contactType: 'sales',
        email,
        availableLanguage: ['French', 'English'],
        areaServed: areaServed,
      },
    ],
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default OrganizationSchema;

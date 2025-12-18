/**
 * WebSite JSON-LD Schema Component
 *
 * Renders structured data for the website with SearchAction.
 * Enables sitelinks search box in Google search results.
 *
 * @see https://schema.org/WebSite
 * @see https://developers.google.com/search/docs/appearance/structured-data/sitelinks-searchbox
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

export interface WebSiteSchemaProps {
  /** Website name */
  name?: string;
  /** Alternative names for the site */
  alternateName?: string[];
  /** Website URL */
  url?: string;
  /** Description of the website */
  description?: string;
  /** Language code (e.g., 'fr-FR') */
  inLanguage?: string;
  /** Search action URL template (with {search_term_string} placeholder) */
  searchUrlTemplate?: string;
  /** Publisher organization reference ID */
  publisherId?: string;
}

// ============================================================================
// Default Values
// ============================================================================

const defaultProps: WebSiteSchemaProps = {
  name: 'WebexpR Pro - Bijoux B2B',
  alternateName: ['WebexpR Pro', 'Bijoux B2B Grossiste'],
  url: SITE_URL,
  description:
    'Plateforme B2B professionnelle pour grossistes en bijoux. Catalogue complet de bijoux de luxe, commandes en gros, et gestion des devis.',
  inLanguage: 'fr-FR',
  searchUrlTemplate: `${SITE_URL}/recherche?q={search_term_string}`,
  publisherId: `${SITE_URL}/#organization`,
};

// ============================================================================
// Component
// ============================================================================

export function WebSiteSchema(props: WebSiteSchemaProps = {}) {
  const {
    name = defaultProps.name,
    alternateName = defaultProps.alternateName,
    url = defaultProps.url,
    description = defaultProps.description,
    inLanguage = defaultProps.inLanguage,
    searchUrlTemplate = defaultProps.searchUrlTemplate,
    publisherId = defaultProps.publisherId,
  } = props;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}/#website`,
    name,
    ...(alternateName && alternateName.length > 0 && { alternateName }),
    url,
    description,
    inLanguage,
    publisher: {
      '@id': publisherId,
    },
    // SearchAction for sitelinks search box
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: searchUrlTemplate,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    // Copyrights
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@id': publisherId,
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default WebSiteSchema;

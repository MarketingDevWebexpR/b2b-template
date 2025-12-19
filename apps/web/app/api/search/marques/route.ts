/**
 * Brand/Marque Search API Route (App Search v3)
 *
 * Direct integration with Elastic App Search v3 engine for brand search.
 * Filters by doc_type="marques" (plural) and returns brands with their details.
 *
 * GET /api/search/marques?q=query&limit=5
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
} from '@/lib/search/app-search-v3';

// Types for App Search v3 marque results
// Marques schema: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
interface AppSearchMarqueHit {
  id: { raw: string };
  name?: { raw: string };
  slug?: { raw: string };
  description?: { raw: string };
  doc_type?: { raw: string };
  // Marque-specific fields
  logo_url?: { raw: string };
  country?: { raw: string };
  website_url?: { raw: string };
  is_active?: { raw: string };
  rank?: { raw: number };
  _meta?: {
    score: number;
  };
}

interface AppSearchResponse {
  meta: {
    request_id: string;
    page: {
      current: number;
      total_pages: number;
      total_results: number;
      size: number;
    };
  };
  results: AppSearchMarqueHit[];
}

// Note: product_count is NOT in marques schema, removed from interface
export interface MarqueSuggestion {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  rank: number;
}

export interface MarqueSuggestionsResponse {
  query: string;
  marques: MarqueSuggestion[];
}

/**
 * Transform App Search marque hit to MarqueSuggestion format
 * Uses only fields from App Search v3 marques: name, slug, logo_url, country, is_active, rank
 */
function transformMarqueHit(hit: AppSearchMarqueHit): MarqueSuggestion {
  const name = hit.name?.raw || '';
  const slug = hit.slug?.raw || name.toLowerCase().replace(/\s+/g, '-');

  return {
    id: hit.id?.raw || '',
    name,
    slug,
    logo_url: hit.logo_url?.raw || null,
    country: hit.country?.raw || null,
    rank: hit.rank?.raw ?? 0,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      marques: [],
    });
  }

  try {
    // Build App Search query for marques
    const searchQuery = {
      query,
      page: {
        size: limit,
        current: 1,
      },
      // Filter by doc_type = marques (V3: plural form)
      filters: {
        all: [{ doc_type: 'marques' }],
      },
      // Result fields - only include fields from App Search v3 marques schema
      // Marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
      result_fields: {
        id: { raw: {} },
        name: { raw: {} },
        slug: { raw: {} },
        description: { raw: {} },
        doc_type: { raw: {} },
        // Marque specific fields
        logo_url: { raw: {} },
        country: { raw: {} },
        website_url: { raw: {} },
        is_active: { raw: {} },
        rank: { raw: {} },
      },
      // Search fields - only use fields that exist in schema
      search_fields: {
        name: { weight: 10 },
        description: { weight: 3 },
        country: { weight: 2 },
      },
    };

    // Call App Search API using shared configuration
    const appSearchUrl = getAppSearchUrl();

    const response = await fetch(appSearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${APP_SEARCH_CONFIG.publicKey}`,
      },
      body: JSON.stringify(searchQuery),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Marque Search API] App Search error: ${response.status}`,
        errorText
      );
      return NextResponse.json({
        query,
        marques: [],
      });
    }

    const data: AppSearchResponse = await response.json();

    // Transform results to MarqueSuggestion format (V3: plural form)
    const marques = data.results
      .filter((hit) => hit.doc_type?.raw === 'marques')
      .map(transformMarqueHit);

    return NextResponse.json({
      query,
      marques,
    });
  } catch (error) {
    console.error('[Marque Search API] Error:', error);
    return NextResponse.json({
      query,
      marques: [],
    });
  }
}

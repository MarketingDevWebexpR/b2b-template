/**
 * Brand Search API Route (Proxy)
 *
 * Proxies brand search requests to the Medusa backend.
 * Returns brands matching the search query with their details.
 *
 * GET /api/search/marques?q=query&limit=5
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export interface MarqueSuggestion {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  product_count: number;
}

export interface MarqueSuggestionsResponse {
  query: string;
  marques: MarqueSuggestion[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '5';

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      marques: [],
    });
  }

  try {
    // Search brands via Medusa backend
    const url = `${MEDUSA_BACKEND_URL}/search?q=${encodeURIComponent(query)}&type=marques&limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Allow caching for 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`[Brand Search Proxy] Error from Medusa: ${response.status}`);
      return NextResponse.json({
        query,
        marques: [],
      });
    }

    const data = await response.json();

    // Transform Medusa brand results to our MarqueSuggestion format
    const marques: MarqueSuggestion[] = (data.hits || []).map((brand: {
      id: string;
      name: string;
      handle?: string;
      slug?: string;
      logo_url?: string | null;
      logo?: string | null;
      country?: string | null;
      origin?: string | null;
      product_count?: number;
      metadata?: Record<string, unknown>;
    }) => {
      return {
        id: brand.id,
        name: brand.name,
        slug: brand.handle || brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-'),
        logo_url: brand.logo_url || brand.logo || null,
        country: brand.country || brand.origin || null,
        product_count: brand.product_count || 0,
      };
    });

    return NextResponse.json({
      query,
      marques,
    });
  } catch (error) {
    console.error('[Brand Search Proxy] Error:', error);
    return NextResponse.json({
      query,
      marques: [],
    });
  }
}

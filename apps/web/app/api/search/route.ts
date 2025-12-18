/**
 * Search API Route (Proxy)
 *
 * Proxies search requests to the Medusa backend Meilisearch service.
 * This avoids CORS issues when calling from the browser.
 *
 * GET /api/search?q=query&type=products|categories|all&limit=20&offset=0...
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Forward all search params to Medusa
  const url = `${MEDUSA_BACKEND_URL}/search?${searchParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Allow caching for 60 seconds
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`[Search Proxy] Error from Medusa: ${response.status}`);
      return NextResponse.json(
        {
          query: searchParams.get('q') || '',
          error: 'Search service unavailable',
          hits: [],
          total: 0,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Search Proxy] Error:', error);
    return NextResponse.json(
      {
        query: searchParams.get('q') || '',
        error: 'Search request failed',
        hits: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

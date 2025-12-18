/**
 * Search Suggestions API Route (Proxy)
 *
 * Proxies search suggestion requests to the Medusa backend.
 * This avoids CORS issues when calling from the browser.
 *
 * GET /api/search/suggestions?q=query&limit=8
 */

import { NextRequest, NextResponse } from 'next/server';

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = searchParams.get('limit') || '8';

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      suggestions: [],
    });
  }

  try {
    const url = `${MEDUSA_BACKEND_URL}/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`;

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
      return NextResponse.json({
        query,
        suggestions: [],
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Search Proxy] Error:', error);
    return NextResponse.json({
      query,
      suggestions: [],
    });
  }
}

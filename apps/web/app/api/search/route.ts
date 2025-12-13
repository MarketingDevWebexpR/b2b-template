import { NextResponse } from 'next/server';
import { filterProductsFromAPI } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '8', 10);

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], total: 0 });
  }

  try {
    const products = await filterProductsFromAPI({
      search: query.trim(),
      limit,
    });

    return NextResponse.json({
      products,
      total: products.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search products', products: [], total: 0 },
      { status: 500 }
    );
  }
}

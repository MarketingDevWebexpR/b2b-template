import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', categories: [] },
      { status: 500 }
    );
  }
}

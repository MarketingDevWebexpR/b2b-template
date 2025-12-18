import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Secret token for revalidation requests
 * Should be set in environment variables
 */
const REVALIDATION_SECRET = process.env.CMS_REVALIDATION_SECRET || 'dev-secret';

/**
 * POST /api/cms/revalidate
 *
 * On-demand revalidation endpoint for CMS content.
 * Call this from Medusa admin when content is published/unpublished.
 *
 * Body:
 * - type: 'hero-slides' | 'announcements' | 'all'
 * - secret: revalidation secret token
 *
 * Example usage from admin:
 * fetch('/api/cms/revalidate', {
 *   method: 'POST',
 *   body: JSON.stringify({ type: 'hero-slides', secret: 'your-secret' })
 * })
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, secret } = body;

    // Validate secret (skip in development for easier testing)
    if (process.env.NODE_ENV === 'production' && secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    // Revalidate based on type
    switch (type) {
      case 'hero-slides':
        revalidatePath('/api/cms/hero-slides');
        revalidatePath('/'); // Home page uses hero slides
        break;

      case 'announcements':
        revalidatePath('/api/cms/announcements');
        revalidatePath('/', 'layout'); // Announcements are in layout
        break;

      case 'all':
        revalidatePath('/api/cms/hero-slides');
        revalidatePath('/api/cms/announcements');
        revalidatePath('/', 'layout');
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Use: hero-slides, announcements, or all' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      revalidated: type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cms/revalidate?type=hero-slides
 *
 * Simple GET endpoint for testing revalidation (dev only)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'GET revalidation not allowed in production' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'all';

  switch (type) {
    case 'hero-slides':
      revalidatePath('/api/cms/hero-slides');
      revalidatePath('/');
      break;

    case 'announcements':
      revalidatePath('/api/cms/announcements');
      revalidatePath('/', 'layout');
      break;

    case 'all':
    default:
      revalidatePath('/api/cms/hero-slides');
      revalidatePath('/api/cms/announcements');
      revalidatePath('/', 'layout');
      break;
  }

  return NextResponse.json({
    success: true,
    revalidated: type,
    timestamp: new Date().toISOString(),
    note: 'Dev mode - refresh your browser to see changes',
  });
}

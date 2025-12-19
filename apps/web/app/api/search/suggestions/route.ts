/**
 * Search Suggestions API Route (App Search v3)
 *
 * Direct integration with Elastic App Search v3 engine for autocomplete.
 * Returns product suggestions with category paths and brand info.
 *
 * GET /api/search/suggestions?q=query&limit=8
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  APP_SEARCH_CONFIG,
  getAppSearchUrl,
} from '@/lib/search/app-search-v3';

// Types for App Search v3 suggestions
// Products: title, handle, description, thumbnail, images, price_min, price_max, brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles, has_stock, is_available, sku, barcode, tags, doc_type, id
// Categories: name, handle, description, parent_category_id, path, ancestor_handles, ancestor_names, depth, rank, product_count, doc_type, id
// Marques: name, slug, description, country, logo_url, website_url, is_active, rank, doc_type, id
interface AppSearchHit {
  id: { raw: string };
  // Product title (v3 uses 'title' for products, 'name' for categories/marques)
  title?: { raw: string };
  // Category/Marque name
  name?: { raw: string };
  handle?: { raw: string };
  slug?: { raw: string };
  doc_type?: { raw: string };
  description?: { raw: string };
  thumbnail?: { raw: string };
  // Product fields (v3)
  brand_id?: { raw: string };
  brand_name?: { raw: string };
  brand_slug?: { raw: string };
  category_lvl0?: { raw: string };
  category_lvl1?: { raw: string };
  category_lvl2?: { raw: string };
  category_lvl3?: { raw: string };
  category_lvl4?: { raw: string };
  all_category_handles?: { raw: string[] };
  price_min?: { raw: number };
  price_max?: { raw: number };
  has_stock?: { raw: string };
  is_available?: { raw: string };
  sku?: { raw: string };
  barcode?: { raw: string };
  tags?: { raw: string[] };
  // Category-specific fields
  path?: { raw: string };
  ancestor_handles?: { raw: string[] };
  ancestor_names?: { raw: string[] };
  depth?: { raw: number };
  product_count?: { raw: number };
  parent_category_id?: { raw: string };
  rank?: { raw: number };
  // Marque-specific fields
  logo_url?: { raw: string };
  website_url?: { raw: string };
  country?: { raw: string };
  is_active?: { raw: string };
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
  results: AppSearchHit[];
}

/**
 * Build suggestion for a product hit
 * Uses fields available in App Search v3: title, handle, thumbnail, price_min, brand_name, brand_slug, brand_id, category_lvl0-4, all_category_handles
 */
function buildProductSuggestion(hit: AppSearchHit) {
  // Build path from category_lvl fields - each level contains the full path
  const levels = [
    hit.category_lvl0?.raw,
    hit.category_lvl1?.raw,
    hit.category_lvl2?.raw,
    hit.category_lvl3?.raw,
    hit.category_lvl4?.raw,
  ].filter(Boolean);
  // Use the deepest level which contains the full path
  const categoryPath = levels.length > 0 ? (levels[levels.length - 1] || '') : '';

  // Get the first category handle if available
  const categoryHandles = hit.all_category_handles?.raw || [];
  const categoryHandle = categoryHandles.length > 0 ? categoryHandles[categoryHandles.length - 1] : null;

  return {
    id: hit.id?.raw || '',
    title: hit.title?.raw || '',
    handle: hit.handle?.raw || '',
    thumbnail: hit.thumbnail?.raw || null,
    price_min: hit.price_min?.raw ?? null,
    // v3 brand fields
    brand_id: hit.brand_id?.raw || null,
    brand_name: hit.brand_name?.raw || null,
    brand_slug: hit.brand_slug?.raw || null,
    category_path: categoryPath,
    category_handle: categoryHandle,
  };
}

/**
 * Build suggestion for a category hit
 * Uses only fields available in App Search v3: name, handle, path, ancestor_names, ancestor_handles, depth, product_count
 */
function buildCategorySuggestion(hit: AppSearchHit) {
  const name = hit.name?.raw || '';
  const handle = hit.handle?.raw || '';

  // Build path array from path field or ancestor_names
  let pathArray: string[] = [];
  let pathString = '';

  if (hit.path?.raw) {
    pathString = hit.path.raw;
    pathArray = pathString.split(' > ');
  } else if (hit.ancestor_names?.raw?.length) {
    // Build path from ancestor_names + current name
    pathArray = [...hit.ancestor_names.raw, name];
    pathString = pathArray.join(' > ');
  } else {
    pathArray = [name];
    pathString = name;
  }

  // Build full URL path from ancestor_handles
  let fullPath = handle;
  if (hit.ancestor_handles?.raw?.length) {
    fullPath = [...hit.ancestor_handles.raw, handle].join('/');
  }

  return {
    id: hit.id?.raw || '',
    name,
    handle,
    path: pathArray,
    pathString,
    fullPath,
    productCount: hit.product_count?.raw ?? 0,
    depth: hit.depth?.raw ?? Math.max(0, pathArray.length - 1),
  };
}

/**
 * Build suggestion for a brand/marque hit
 * Uses only fields available in App Search v3: name, slug, logo_url, country (product_count is NOT in marques)
 */
function buildMarqueSuggestion(hit: AppSearchHit) {
  return {
    id: hit.id?.raw || '',
    name: hit.name?.raw || '',
    slug: hit.slug?.raw || '',
    logo_url: hit.logo_url?.raw || null,
    country: hit.country?.raw || null,
    product_count: 0, // product_count field doesn't exist on marques in v3
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '8', 10);
  const includeCategories = searchParams.get('categories') !== 'false';
  const includeBrands = searchParams.get('brands') !== 'false';

  // Validate query
  if (!query || query.length < 2) {
    return NextResponse.json({
      query,
      suggestions: [],
      categories: [],
      marques: [],
    });
  }

  try {
    // Build App Search query for suggestions
    // Search across all doc_types but prioritize products
    const searchQuery = {
      query,
      page: {
        size: limit + (includeCategories ? 5 : 0) + (includeBrands ? 5 : 0),
        current: 1,
      },
      // Result fields - only include fields that exist in App Search v3 schema
      result_fields: {
        id: { raw: {} },
        // Product: title (NOT name), Categories/Marques: name
        title: { raw: {} },
        name: { raw: {} },
        handle: { raw: {} },
        slug: { raw: {} },
        doc_type: { raw: {} },
        description: { raw: {} },
        thumbnail: { raw: {} },
        // Product fields
        brand_id: { raw: {} },
        brand_name: { raw: {} },
        brand_slug: { raw: {} },
        category_lvl0: { raw: {} },
        category_lvl1: { raw: {} },
        category_lvl2: { raw: {} },
        category_lvl3: { raw: {} },
        category_lvl4: { raw: {} },
        all_category_handles: { raw: {} },
        price_min: { raw: {} },
        price_max: { raw: {} },
        has_stock: { raw: {} },
        is_available: { raw: {} },
        sku: { raw: {} },
        // Category fields
        path: { raw: {} },
        ancestor_handles: { raw: {} },
        ancestor_names: { raw: {} },
        depth: { raw: {} },
        product_count: { raw: {} },
        parent_category_id: { raw: {} },
        rank: { raw: {} },
        // Marque fields
        logo_url: { raw: {} },
        website_url: { raw: {} },
        country: { raw: {} },
        is_active: { raw: {} },
      },
      // Search fields - use 'title' for products, 'name' for categories/marques
      search_fields: {
        title: { weight: 10 },
        name: { weight: 10 },
        description: { weight: 3 },
        brand_name: { weight: 5 },
        sku: { weight: 8 },
        category_lvl0: { weight: 3 },
        category_lvl1: { weight: 2 },
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
      console.error(`[Suggestions API] App Search error: ${response.status}`);
      return NextResponse.json({
        query,
        suggestions: [],
        categories: [],
        marques: [],
      });
    }

    const data: AppSearchResponse = await response.json();

    // Separate results by doc_type
    const productSuggestions: ReturnType<typeof buildProductSuggestion>[] = [];
    const categorySuggestions: ReturnType<typeof buildCategorySuggestion>[] = [];
    const marqueSuggestions: ReturnType<typeof buildMarqueSuggestion>[] = [];

    // V3: doc_type values are plural (products, categories, marques)
    for (const hit of data.results) {
      const docType = hit.doc_type?.raw;

      if (docType === 'products') {
        if (productSuggestions.length < limit) {
          productSuggestions.push(buildProductSuggestion(hit));
        }
      } else if (docType === 'categories' && includeCategories) {
        if (categorySuggestions.length < 5) {
          categorySuggestions.push(buildCategorySuggestion(hit));
        }
      } else if (docType === 'marques' && includeBrands) {
        if (marqueSuggestions.length < 5) {
          marqueSuggestions.push(buildMarqueSuggestion(hit));
        }
      } else if (!docType) {
        // Fallback: treat as product if no doc_type
        if (productSuggestions.length < limit) {
          productSuggestions.push(buildProductSuggestion(hit));
        }
      }
    }

    return NextResponse.json({
      query,
      suggestions: productSuggestions,
      categories: categorySuggestions,
      marques: marqueSuggestions,
    });
  } catch (error) {
    console.error('[Suggestions API] Error:', error);
    return NextResponse.json({
      query,
      suggestions: [],
      categories: [],
      marques: [],
    });
  }
}

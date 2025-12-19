/**
 * Initial App Search Data Sync Script
 *
 * Loads all products, categories, and marques from the database
 * and indexes them into App Search.
 *
 * This script should be run once when first setting up App Search,
 * or when you need to do a full reindex.
 *
 * Usage:
 *   npx ts-node scripts/initial-sync-appsearch.ts
 *
 * Required environment variables:
 *   - DATABASE_URL
 *   - APPSEARCH_ENDPOINT
 *   - APPSEARCH_PRIVATE_KEY
 *   - APPSEARCH_ENGINE (optional)
 */

import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
const ENDPOINT = process.env.APPSEARCH_ENDPOINT;
const PRIVATE_KEY = process.env.APPSEARCH_PRIVATE_KEY;
const BASE_ENGINE = process.env.APPSEARCH_ENGINE || "bijoux";

// App Search has a limit of 100 documents per request
const BATCH_SIZE = 100;

interface ProductRow {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  status: string;
  thumbnail: string | null;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, unknown> | null;
}

interface CategoryRow {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  is_active: boolean;
  rank: number;
  created_at: Date;
  updated_at: Date;
  // Hierarchy fields from recursive CTE
  depth: number;
  parent_category_id: string | null;
  ancestor_names: string[];
  ancestor_handles: string[];
  parent_category_ids: string[];
  full_path: string;
  // Product count
  product_count: number;
  // Metadata fields
  metadata: {
    name_en?: string;
    icon?: string;
    image_url?: string;
    [key: string]: unknown;
  } | null;
}

interface MarqueRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  country: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  rank: number;
  created_at: Date;
  updated_at: Date;
}

async function appSearchRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  const url = `${ENDPOINT}/api/as/v1${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PRIVATE_KEY}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      data: data as T,
      error: response.ok ? undefined : JSON.stringify(data),
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function ensureEngine(engineName: string): Promise<boolean> {
  console.log(`   Checking engine: ${engineName}`);

  let response = await appSearchRequest(`/engines/${engineName}`);

  if (response.ok) {
    console.log(`   ✅ Engine exists`);
    return true;
  }

  console.log(`   Creating engine...`);
  response = await appSearchRequest("/engines", {
    method: "POST",
    body: JSON.stringify({
      name: engineName,
      language: "fr",
    }),
  });

  if (response.ok) {
    console.log(`   ✅ Engine created`);
    return true;
  }

  console.log(`   ❌ Failed to create engine: ${response.error}`);
  return false;
}

async function clearEngine(engineName: string): Promise<void> {
  console.log(`   Clearing existing documents...`);

  // Get all document IDs
  const searchResponse = await appSearchRequest<{
    results: Array<{ id: { raw: string } }>;
    meta: { page: { total_results: number } };
  }>(`/engines/${engineName}/search`, {
    method: "POST",
    body: JSON.stringify({
      query: "",
      page: { size: 1000 },
      result_fields: { id: { raw: {} } },
    }),
  });

  if (!searchResponse.ok || !searchResponse.data?.results?.length) {
    console.log(`   Engine is empty or couldn't retrieve documents`);
    return;
  }

  const ids = searchResponse.data.results.map((r) => r.id.raw);
  console.log(`   Found ${ids.length} documents to delete`);

  // Delete in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await appSearchRequest(`/engines/${engineName}/documents`, {
      method: "DELETE",
      body: JSON.stringify(batch),
    });
  }

  console.log(`   ✅ Engine cleared`);
}

/**
 * Delete documents by doc_type (for single-engine architecture)
 */
async function deleteDocumentsByType(engineName: string, docType: string): Promise<void> {
  console.log(`   Clearing existing ${docType}...`);

  // Get documents of this type
  const searchResponse = await appSearchRequest<{
    results: Array<{ id: { raw: string } }>;
    meta: { page: { total_results: number } };
  }>(`/engines/${engineName}/search`, {
    method: "POST",
    body: JSON.stringify({
      query: "",
      filters: { doc_type: docType },
      page: { size: 1000 },
      result_fields: { id: { raw: {} } },
    }),
  });

  if (!searchResponse.ok || !searchResponse.data?.results?.length) {
    console.log(`   No existing ${docType} to delete`);
    return;
  }

  const ids = searchResponse.data.results.map((r) => r.id.raw);
  console.log(`   Found ${ids.length} ${docType} to delete`);

  // Delete in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await appSearchRequest(`/engines/${engineName}/documents`, {
      method: "DELETE",
      body: JSON.stringify(batch),
    });
  }

  console.log(`   ✅ ${docType} cleared`);
}

async function indexBatch(
  engineName: string,
  documents: Array<Record<string, unknown>>,
  batchNum: number,
  totalBatches: number
): Promise<{ success: number; failed: number }> {
  const response = await appSearchRequest<Array<{ id: string; errors: string[] }>>(
    `/engines/${engineName}/documents`,
    {
      method: "POST",
      body: JSON.stringify(documents),
    }
  );

  if (!response.ok) {
    console.log(`   ❌ Batch ${batchNum}/${totalBatches} failed: ${response.error}`);
    return { success: 0, failed: documents.length };
  }

  const results = response.data || [];
  const failed = results.filter((r) => r.errors && r.errors.length > 0).length;
  const success = documents.length - failed;

  if (failed > 0) {
    console.log(`   ⚠️ Batch ${batchNum}/${totalBatches}: ${success} success, ${failed} failed`);
  } else {
    process.stdout.write(`\r   Batch ${batchNum}/${totalBatches}: ${success} documents indexed`);
  }

  return { success, failed };
}

async function syncProducts(pool: Pool): Promise<{ indexed: number; failed: number }> {
  console.log("\n📦 Syncing Products...");

  // All entity types use the same engine - distinguished by doc_type field
  const engineName = BASE_ENGINE;
  if (!(await ensureEngine(engineName))) {
    return { indexed: 0, failed: 0 };
  }

  // Don't clear the entire engine - just delete products by doc_type
  await deleteDocumentsByType(engineName, "products");

  // Fetch products from database
  const result = await pool.query<ProductRow>(`
    SELECT
      p.id,
      p.title,
      p.handle,
      p.description,
      p.status,
      p.thumbnail,
      p.created_at,
      p.updated_at,
      p.metadata
    FROM product p
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC
  `);

  const products = result.rows;
  console.log(`   Found ${products.length} published products`);

  if (products.length === 0) {
    return { indexed: 0, failed: 0 };
  }

  let totalIndexed = 0;
  let totalFailed = 0;
  const totalBatches = Math.ceil(products.length / BATCH_SIZE);

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const documents = batch.map((p) => ({
      id: p.id,
      doc_type: "products", // Single-engine architecture: distinguish by doc_type
      title: p.title || "",
      handle: p.handle || "",
      description: p.description || "",
      status: p.status || "published",
      thumbnail: p.thumbnail || "",
      created_at: p.created_at?.toISOString() || "",
      updated_at: p.updated_at?.toISOString() || "",
      // Flatten metadata for searchability
      marque: (p.metadata as Record<string, string>)?.marque || "",
    }));

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const { success, failed } = await indexBatch(engineName, documents, batchNum, totalBatches);
    totalIndexed += success;
    totalFailed += failed;
  }

  console.log(`\n   ✅ Products: ${totalIndexed} indexed, ${totalFailed} failed`);
  return { indexed: totalIndexed, failed: totalFailed };
}

async function syncCategories(pool: Pool): Promise<{ indexed: number; failed: number }> {
  console.log("\n📁 Syncing Categories...");

  // All entity types use the same engine - distinguished by doc_type field
  const engineName = BASE_ENGINE;
  if (!(await ensureEngine(engineName))) {
    return { indexed: 0, failed: 0 };
  }

  // Don't clear the entire engine - just delete categories by doc_type
  await deleteDocumentsByType(engineName, "categories");

  // Fetch categories with full hierarchy using recursive CTE
  const result = await pool.query<CategoryRow>(`
    WITH RECURSIVE category_hierarchy AS (
      -- Base case: Root categories (no parent)
      SELECT
        id,
        name,
        handle,
        description,
        is_active,
        rank,
        created_at,
        updated_at,
        parent_category_id,
        metadata,
        0 AS depth,
        ARRAY[]::text[] AS ancestor_names,
        ARRAY[]::text[] AS ancestor_handles,
        ARRAY[]::text[] AS parent_category_ids,
        name AS full_path
      FROM product_category
      WHERE parent_category_id IS NULL AND is_active = true AND deleted_at IS NULL

      UNION ALL

      -- Recursive case: Child categories
      SELECT
        c.id,
        c.name,
        c.handle,
        c.description,
        c.is_active,
        c.rank,
        c.created_at,
        c.updated_at,
        c.parent_category_id,
        c.metadata,
        h.depth + 1 AS depth,
        h.ancestor_names || h.name AS ancestor_names,
        h.ancestor_handles || h.handle AS ancestor_handles,
        h.parent_category_ids || h.id AS parent_category_ids,
        h.full_path || ' > ' || c.name AS full_path
      FROM product_category c
      INNER JOIN category_hierarchy h ON c.parent_category_id = h.id
      WHERE c.is_active = true AND c.deleted_at IS NULL
    ),
    -- Count products per category
    category_product_counts AS (
      SELECT
        pcp.product_category_id,
        COUNT(DISTINCT pcp.product_id) AS product_count
      FROM product_category_product pcp
      GROUP BY pcp.product_category_id
    )
    SELECT
      ch.id,
      ch.name,
      ch.handle,
      ch.description,
      ch.is_active,
      ch.rank,
      ch.created_at,
      ch.updated_at,
      ch.parent_category_id,
      ch.metadata,
      ch.depth,
      ch.ancestor_names,
      ch.ancestor_handles,
      ch.parent_category_ids,
      ch.full_path,
      COALESCE(cpc.product_count, 0)::integer AS product_count
    FROM category_hierarchy ch
    LEFT JOIN category_product_counts cpc ON ch.id = cpc.product_category_id
    ORDER BY ch.full_path
  `);

  const categories = result.rows;
  console.log(`   Found ${categories.length} active categories`);

  if (categories.length === 0) {
    return { indexed: 0, failed: 0 };
  }

  let totalIndexed = 0;
  let totalFailed = 0;
  const totalBatches = Math.ceil(categories.length / BATCH_SIZE);

  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE);
    const documents = batch.map((c) => ({
      id: c.id,
      doc_type: "categories", // Single-engine architecture: distinguish by doc_type
      name: c.name || "",
      handle: c.handle || "",
      description: c.description || "",
      is_active: c.is_active,
      rank: c.rank || 0,
      created_at: c.created_at?.toISOString() || "",
      updated_at: c.updated_at?.toISOString() || "",
      // Hierarchy fields
      depth: c.depth,
      parent_category_id: c.parent_category_id || "",
      ancestor_names: c.ancestor_names || [],
      ancestor_handles: c.ancestor_handles || [],
      parent_category_ids: c.parent_category_ids || [],
      full_path: c.full_path || c.name,
      // Product count
      product_count: c.product_count || 0,
      // Metadata fields extracted
      name_en: c.metadata?.name_en || "",
      icon: c.metadata?.icon || "",
      image_url: c.metadata?.image_url || "",
      // Full metadata as JSON string for flexibility
      metadata: c.metadata ? JSON.stringify(c.metadata) : "",
    }));

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const { success, failed } = await indexBatch(engineName, documents, batchNum, totalBatches);
    totalIndexed += success;
    totalFailed += failed;
  }

  console.log(`\n   ✅ Categories: ${totalIndexed} indexed, ${totalFailed} failed`);
  return { indexed: totalIndexed, failed: totalFailed };
}

async function syncMarques(pool: Pool): Promise<{ indexed: number; failed: number }> {
  console.log("\n🏷️ Syncing Marques (Brands)...");

  // All entity types use the same engine - distinguished by doc_type field
  const engineName = BASE_ENGINE;
  if (!(await ensureEngine(engineName))) {
    return { indexed: 0, failed: 0 };
  }

  // Don't clear the entire engine - just delete marques by doc_type
  await deleteDocumentsByType(engineName, "marques");

  // Fetch marques from database
  const result = await pool.query<MarqueRow>(`
    SELECT
      m.id,
      m.name,
      m.slug,
      m.description,
      m.country,
      m.logo_url,
      m.website_url,
      m.is_active,
      m.rank,
      m.created_at,
      m.updated_at
    FROM marque m
    WHERE m.is_active = true
    ORDER BY m.rank, m.name
  `);

  const marques = result.rows;
  console.log(`   Found ${marques.length} active marques`);

  if (marques.length === 0) {
    return { indexed: 0, failed: 0 };
  }

  let totalIndexed = 0;
  let totalFailed = 0;
  const totalBatches = Math.ceil(marques.length / BATCH_SIZE);

  for (let i = 0; i < marques.length; i += BATCH_SIZE) {
    const batch = marques.slice(i, i + BATCH_SIZE);
    const documents = batch.map((m) => ({
      id: m.id,
      doc_type: "marques", // Single-engine architecture: distinguish by doc_type
      name: m.name || "",
      slug: m.slug || "",
      description: m.description || "",
      country: m.country || "",
      logo_url: m.logo_url || "",
      website_url: m.website_url || "",
      is_active: m.is_active,
      rank: m.rank || 0,
      created_at: m.created_at?.toISOString() || "",
      updated_at: m.updated_at?.toISOString() || "",
    }));

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const { success, failed } = await indexBatch(engineName, documents, batchNum, totalBatches);
    totalIndexed += success;
    totalFailed += failed;
  }

  console.log(`\n   ✅ Marques: ${totalIndexed} indexed, ${totalFailed} failed`);
  return { indexed: totalIndexed, failed: totalFailed };
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("         Initial App Search Data Synchronization           ");
  console.log("═══════════════════════════════════════════════════════════");

  // Validate configuration
  if (!DATABASE_URL) {
    console.log("\n❌ ERROR: Missing DATABASE_URL");
    process.exit(1);
  }

  if (!ENDPOINT || !PRIVATE_KEY) {
    console.log("\n❌ ERROR: Missing APPSEARCH_ENDPOINT or APPSEARCH_PRIVATE_KEY");
    console.log("   Please configure App Search credentials in .env");
    process.exit(1);
  }

  console.log(`\n📊 Configuration:`);
  console.log(`   Database: ${DATABASE_URL.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`   App Search: ${ENDPOINT}`);
  console.log(`   Engine prefix: ${BASE_ENGINE}`);

  // Connect to database
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log("\n🔌 Connecting to database...");
    await pool.query("SELECT 1");
    console.log("   ✅ Database connected");

    const startTime = Date.now();

    // Sync all entities
    const results = {
      products: await syncProducts(pool),
      categories: await syncCategories(pool),
      marques: await syncMarques(pool),
    };

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Summary
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("                    Sync Complete                           ");
    console.log("═══════════════════════════════════════════════════════════");
    console.log(`   Products:   ${results.products.indexed} indexed, ${results.products.failed} failed`);
    console.log(`   Categories: ${results.categories.indexed} indexed, ${results.categories.failed} failed`);
    console.log(`   Marques:    ${results.marques.indexed} indexed, ${results.marques.failed} failed`);
    console.log(`   Duration:   ${duration} seconds`);

    const totalIndexed =
      results.products.indexed + results.categories.indexed + results.marques.indexed;
    const totalFailed =
      results.products.failed + results.categories.failed + results.marques.failed;

    console.log(`\n   Total: ${totalIndexed} documents indexed, ${totalFailed} failed`);

    if (totalFailed === 0) {
      console.log("\n🎉 Initial sync completed successfully!");
      console.log("\n📋 Next steps:");
      console.log("   1. Test search: npx ts-node scripts/test-appsearch.ts");
      console.log("   2. Enable dual mode: SEARCH_PROVIDER=dual");
      console.log("   3. Gradually increase traffic: APPSEARCH_TRAFFIC_PERCENTAGE=10");
    } else {
      console.log("\n⚠️ Some documents failed to index. Check logs above.");
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

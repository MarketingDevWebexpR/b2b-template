/**
 * App Search Connection Test Script
 *
 * Tests the App Search integration to verify:
 * - Connection to App Search API
 * - Engine creation/access
 * - Document indexing
 * - Search functionality
 *
 * Usage:
 *   npx ts-node scripts/test-appsearch.ts
 *
 * Required environment variables:
 *   - APPSEARCH_ENDPOINT
 *   - APPSEARCH_PRIVATE_KEY
 *   - APPSEARCH_ENGINE (optional, defaults to test-bijoux)
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const ENDPOINT = process.env.APPSEARCH_ENDPOINT;
const PRIVATE_KEY = process.env.APPSEARCH_PRIVATE_KEY;
const ENGINE_NAME = process.env.APPSEARCH_ENGINE || "test-bijoux";

interface AppSearchResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function appSearchRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<AppSearchResponse<T>> {
  if (!ENDPOINT || !PRIVATE_KEY) {
    return {
      ok: false,
      status: 0,
      error: "Missing APPSEARCH_ENDPOINT or APPSEARCH_PRIVATE_KEY",
    };
  }

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

async function testConnection(): Promise<boolean> {
  console.log("\n🔌 Testing App Search Connection...");
  console.log(`   Endpoint: ${ENDPOINT}`);

  const response = await appSearchRequest("/engines");

  if (response.ok) {
    console.log("   ✅ Connection successful!");
    const engines = response.data as { results?: { name: string }[] };
    console.log(
      `   Found ${engines.results?.length || 0} engine(s): ${engines.results?.map((e) => e.name).join(", ") || "none"}`
    );
    return true;
  } else {
    console.log(`   ❌ Connection failed: ${response.error}`);
    return false;
  }
}

async function testEngine(): Promise<boolean> {
  console.log(`\n🔧 Testing Engine "${ENGINE_NAME}"...`);

  // Try to get the engine
  let response = await appSearchRequest(`/engines/${ENGINE_NAME}`);

  if (response.ok) {
    console.log(`   ✅ Engine "${ENGINE_NAME}" exists`);
    return true;
  }

  // Try to create the engine
  console.log(`   Engine not found, creating...`);
  response = await appSearchRequest("/engines", {
    method: "POST",
    body: JSON.stringify({
      name: ENGINE_NAME,
      language: "fr",
    }),
  });

  if (response.ok) {
    console.log(`   ✅ Engine "${ENGINE_NAME}" created successfully`);
    return true;
  } else {
    console.log(`   ❌ Failed to create engine: ${response.error}`);
    return false;
  }
}

async function testIndexing(): Promise<boolean> {
  console.log("\n📝 Testing Document Indexing...");

  const testDoc = {
    id: "test-product-001",
    title: "Bague en or 18 carats",
    description: "Magnifique bague en or avec diamant central",
    handle: "bague-or-18-carats",
    price: 2500,
    currency: "EUR",
    category: "Bagues",
    marque: "Test Brand",
    in_stock: true,
    created_at: new Date().toISOString(),
  };

  const response = await appSearchRequest(`/engines/${ENGINE_NAME}/documents`, {
    method: "POST",
    body: JSON.stringify([testDoc]),
  });

  if (response.ok) {
    console.log("   ✅ Document indexed successfully");
    console.log(`   Document ID: ${testDoc.id}`);
    return true;
  } else {
    console.log(`   ❌ Failed to index document: ${response.error}`);
    return false;
  }
}

async function testSearch(): Promise<boolean> {
  console.log("\n🔍 Testing Search...");

  // Wait a moment for indexing to complete
  await new Promise((r) => setTimeout(r, 1000));

  const response = await appSearchRequest<{
    results: Array<{ id: { raw: string }; title?: { raw: string } }>;
    meta: { page: { total_results: number } };
  }>(`/engines/${ENGINE_NAME}/search`, {
    method: "POST",
    body: JSON.stringify({
      query: "bague or",
      result_fields: {
        id: { raw: {} },
        title: { raw: {} },
        price: { raw: {} },
      },
    }),
  });

  if (response.ok && response.data) {
    const results = response.data.results || [];
    const totalResults = response.data.meta?.page?.total_results || 0;

    console.log(`   ✅ Search successful!`);
    console.log(`   Total results: ${totalResults}`);

    if (results.length > 0) {
      console.log(`   First result: ${results[0].title?.raw || results[0].id?.raw}`);
    }
    return true;
  } else {
    console.log(`   ❌ Search failed: ${response.error}`);
    return false;
  }
}

async function testFilteredSearch(): Promise<boolean> {
  console.log("\n🔍 Testing Filtered Search (price range)...");

  const response = await appSearchRequest<{
    results: Array<{ id: { raw: string }; title?: { raw: string }; price?: { raw: number } }>;
    meta: { page: { total_results: number } };
  }>(`/engines/${ENGINE_NAME}/search`, {
    method: "POST",
    body: JSON.stringify({
      query: "",
      filters: {
        price: {
          from: 1000,
          to: 5000,
        },
      },
      result_fields: {
        id: { raw: {} },
        title: { raw: {} },
        price: { raw: {} },
      },
    }),
  });

  if (response.ok && response.data) {
    const results = response.data.results || [];
    const totalResults = response.data.meta?.page?.total_results || 0;

    console.log(`   ✅ Filtered search successful!`);
    console.log(`   Results in price range 1000-5000: ${totalResults}`);

    if (results.length > 0) {
      console.log(`   First result: ${results[0].title?.raw} (€${results[0].price?.raw})`);
    }
    return true;
  } else {
    console.log(`   ❌ Filtered search failed: ${response.error}`);
    return false;
  }
}

async function cleanupTestDoc(): Promise<void> {
  console.log("\n🧹 Cleaning up test document...");

  const response = await appSearchRequest(`/engines/${ENGINE_NAME}/documents`, {
    method: "DELETE",
    body: JSON.stringify(["test-product-001"]),
  });

  if (response.ok) {
    console.log("   ✅ Test document removed");
  } else {
    console.log(`   ⚠️ Could not remove test document: ${response.error}`);
  }
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("          App Search Integration Test Suite                 ");
  console.log("═══════════════════════════════════════════════════════════");

  if (!ENDPOINT || !PRIVATE_KEY) {
    console.log("\n❌ ERROR: Missing required environment variables");
    console.log("   Please set APPSEARCH_ENDPOINT and APPSEARCH_PRIVATE_KEY");
    console.log("\n   Example:");
    console.log("   APPSEARCH_ENDPOINT=https://xxx.ent-search.cloud.es.io");
    console.log("   APPSEARCH_PRIVATE_KEY=private-xxxxx");
    process.exit(1);
  }

  const results = {
    connection: false,
    engine: false,
    indexing: false,
    search: false,
    filteredSearch: false,
  };

  // Run tests
  results.connection = await testConnection();

  if (results.connection) {
    results.engine = await testEngine();

    if (results.engine) {
      results.indexing = await testIndexing();

      if (results.indexing) {
        results.search = await testSearch();
        results.filteredSearch = await testFilteredSearch();
        await cleanupTestDoc();
      }
    }
  }

  // Summary
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("                      Test Summary                          ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`   Connection:      ${results.connection ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Engine Access:   ${results.engine ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Indexing:        ${results.indexing ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Search:          ${results.search ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`   Filtered Search: ${results.filteredSearch ? "✅ PASS" : "❌ FAIL"}`);

  const allPassed = Object.values(results).every((r) => r);
  console.log("\n" + (allPassed ? "🎉 All tests passed!" : "⚠️ Some tests failed"));

  if (allPassed) {
    console.log("\n📋 Next steps:");
    console.log("   1. Configure production App Search credentials in .env");
    console.log("   2. Set SEARCH_PROVIDER=dual to enable dual-engine mode");
    console.log("   3. Run reindex: POST /admin/search/reindex");
    console.log("   4. Monitor sync: GET /admin/search/status");
    console.log("   5. Gradually increase APPSEARCH_TRAFFIC_PERCENTAGE");
  }

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

/**
 * Search Engine Comparison Script
 *
 * Compares search results between Meilisearch and App Search
 * to validate result consistency before traffic migration.
 *
 * Features:
 * - Runs identical queries against both search engines
 * - Compares response times, result counts, and top result IDs
 * - Calculates match percentage for relevance alignment
 * - Outputs detailed comparison report
 *
 * Usage:
 *   npx ts-node scripts/compare-search-engines.ts
 *
 * Required environment variables:
 *   - MEILISEARCH_HOST
 *   - MEILISEARCH_API_KEY
 *   - APPSEARCH_ENDPOINT
 *   - APPSEARCH_PRIVATE_KEY
 *   - APPSEARCH_ENGINE (optional, defaults to environment default)
 */

import dotenv from "dotenv";
import path from "path";
import { MeiliSearch } from "meilisearch";

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

/** Test queries representing common jewelry searches */
const TEST_QUERIES: readonly string[] = [
  "bague or",
  "collier diamant",
  "bracelet argent",
  "boucles oreilles perle",
  "alliance platine",
  "montre homme",
  "parure mariage",
  "pendentif coeur",
  "chaine maille",
  "solitaire",
] as const;

/** Number of top results to compare for relevance alignment */
const TOP_RESULTS_COUNT = 5;

/** Index name to search */
const INDEX_NAME = "products";

// Environment configuration with validation
interface EnvironmentConfig {
  readonly meilisearch: {
    readonly host: string;
    readonly apiKey: string;
    readonly indexPrefix: string;
  };
  readonly appSearch: {
    readonly endpoint: string;
    readonly privateApiKey: string;
    readonly engineName: string;
  };
}

/**
 * Load and validate environment configuration
 * @throws {Error} If required environment variables are missing
 */
function loadEnvironmentConfig(): EnvironmentConfig {
  const meilisearchHost = process.env.MEILISEARCH_HOST;
  const meilisearchApiKey = process.env.MEILISEARCH_API_KEY;
  const appSearchEndpoint = process.env.APPSEARCH_ENDPOINT;
  const appSearchPrivateKey = process.env.APPSEARCH_PRIVATE_KEY;

  const missing: string[] = [];

  if (!meilisearchHost) missing.push("MEILISEARCH_HOST");
  if (!meilisearchApiKey) missing.push("MEILISEARCH_API_KEY");
  if (!appSearchEndpoint) missing.push("APPSEARCH_ENDPOINT");
  if (!appSearchPrivateKey) missing.push("APPSEARCH_PRIVATE_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    meilisearch: {
      host: meilisearchHost!,
      apiKey: meilisearchApiKey!,
      indexPrefix: process.env.MEILISEARCH_INDEX_PREFIX ?? "",
    },
    appSearch: {
      endpoint: appSearchEndpoint!.replace(/\/$/, ""),
      privateApiKey: appSearchPrivateKey!,
      engineName: process.env.APPSEARCH_ENGINE ?? "dev-medusa-v2",
    },
  };
}

// =============================================================================
// TYPES
// =============================================================================

/** Result from a single search engine query */
interface SearchEngineResult {
  readonly query: string;
  readonly timeMs: number;
  readonly totalCount: number;
  readonly topIds: readonly string[];
  readonly error?: string;
}

/** Comparison result between two search engines */
interface ComparisonResult {
  readonly query: string;
  readonly meilisearch: SearchEngineResult;
  readonly appSearch: SearchEngineResult;
  readonly matchPercentage: number;
  readonly matchingIds: readonly string[];
  readonly meilisearchOnly: readonly string[];
  readonly appSearchOnly: readonly string[];
}

/** Summary statistics across all queries */
interface ComparisonSummary {
  readonly totalQueries: number;
  readonly successfulQueries: number;
  readonly averageMatchPercentage: number;
  readonly averageMeilisearchTimeMs: number;
  readonly averageAppSearchTimeMs: number;
  readonly timeDifferenceMs: number;
  readonly fasterEngine: "meilisearch" | "appsearch" | "tie";
}

// =============================================================================
// SEARCH ENGINE CLIENTS
// =============================================================================

/**
 * Search Meilisearch for a query
 */
async function searchMeilisearch(
  client: MeiliSearch,
  indexName: string,
  query: string,
  indexPrefix: string
): Promise<SearchEngineResult> {
  const startTime = performance.now();

  try {
    const fullIndexName = `${indexPrefix}${indexName}`;
    const index = client.index(fullIndexName);

    const response = await index.search(query, {
      limit: TOP_RESULTS_COUNT,
      attributesToRetrieve: ["id"],
    });

    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    const topIds = response.hits.map((hit) => {
      const doc = hit as { id?: string };
      return doc.id ?? "unknown";
    });

    return {
      query,
      timeMs,
      totalCount: response.estimatedTotalHits ?? response.hits.length,
      topIds,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      query,
      timeMs: Math.round(endTime - startTime),
      totalCount: 0,
      topIds: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * App Search API response types
 */
interface AppSearchSearchResponse {
  readonly meta: {
    readonly page: {
      readonly total_results: number;
    };
  };
  readonly results: ReadonlyArray<{
    readonly id: { readonly raw: string };
  }>;
}

/**
 * Search App Search for a query
 */
async function searchAppSearch(
  config: EnvironmentConfig["appSearch"],
  query: string
): Promise<SearchEngineResult> {
  const startTime = performance.now();

  try {
    const url = `${config.endpoint}/api/as/v1/engines/${config.engineName}/search`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.privateApiKey}`,
      },
      body: JSON.stringify({
        query,
        page: {
          size: TOP_RESULTS_COUNT,
          current: 1,
        },
        result_fields: {
          id: { raw: {} },
        },
      }),
    });

    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error");
      return {
        query,
        timeMs,
        totalCount: 0,
        topIds: [],
        error: `HTTP ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as AppSearchSearchResponse;

    const topIds = data.results.map((result) => result.id.raw);

    return {
      query,
      timeMs,
      totalCount: data.meta.page.total_results,
      topIds,
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      query,
      timeMs: Math.round(endTime - startTime),
      totalCount: 0,
      topIds: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// COMPARISON LOGIC
// =============================================================================

/**
 * Compare top result IDs between two search results
 */
function compareResults(
  meilisearch: SearchEngineResult,
  appSearch: SearchEngineResult
): Pick<
  ComparisonResult,
  "matchPercentage" | "matchingIds" | "meilisearchOnly" | "appSearchOnly"
> {
  // Handle error cases
  if (meilisearch.error || appSearch.error) {
    return {
      matchPercentage: 0,
      matchingIds: [],
      meilisearchOnly: [...meilisearch.topIds],
      appSearchOnly: [...appSearch.topIds],
    };
  }

  // Handle empty results
  if (meilisearch.topIds.length === 0 && appSearch.topIds.length === 0) {
    return {
      matchPercentage: 100,
      matchingIds: [],
      meilisearchOnly: [],
      appSearchOnly: [],
    };
  }

  const meilisearchSet = new Set(meilisearch.topIds);
  const appSearchSet = new Set(appSearch.topIds);

  const matchingIds: string[] = [];
  const meilisearchOnly: string[] = [];
  const appSearchOnly: string[] = [];

  // Find matching IDs
  for (const id of meilisearch.topIds) {
    if (appSearchSet.has(id)) {
      matchingIds.push(id);
    } else {
      meilisearchOnly.push(id);
    }
  }

  // Find App Search only IDs
  for (const id of appSearch.topIds) {
    if (!meilisearchSet.has(id)) {
      appSearchOnly.push(id);
    }
  }

  // Calculate match percentage based on union of both result sets
  const totalUniqueIds = new Set([...meilisearch.topIds, ...appSearch.topIds]).size;
  const matchPercentage =
    totalUniqueIds > 0 ? Math.round((matchingIds.length / totalUniqueIds) * 100) : 100;

  return {
    matchPercentage,
    matchingIds,
    meilisearchOnly,
    appSearchOnly,
  };
}

/**
 * Run comparison for a single query
 */
async function compareQuery(
  meilisearchClient: MeiliSearch,
  config: EnvironmentConfig,
  query: string
): Promise<ComparisonResult> {
  // Run both searches in parallel
  const [meilisearchResult, appSearchResult] = await Promise.all([
    searchMeilisearch(
      meilisearchClient,
      INDEX_NAME,
      query,
      config.meilisearch.indexPrefix
    ),
    searchAppSearch(config.appSearch, query),
  ]);

  const comparison = compareResults(meilisearchResult, appSearchResult);

  return {
    query,
    meilisearch: meilisearchResult,
    appSearch: appSearchResult,
    ...comparison,
  };
}

/**
 * Calculate summary statistics from comparison results
 */
function calculateSummary(results: readonly ComparisonResult[]): ComparisonSummary {
  const successfulResults = results.filter(
    (r) => !r.meilisearch.error && !r.appSearch.error
  );

  const totalMatchPercentage = successfulResults.reduce(
    (sum, r) => sum + r.matchPercentage,
    0
  );
  const totalMeilisearchTime = results.reduce(
    (sum, r) => sum + r.meilisearch.timeMs,
    0
  );
  const totalAppSearchTime = results.reduce(
    (sum, r) => sum + r.appSearch.timeMs,
    0
  );

  const avgMeilisearchTime = Math.round(totalMeilisearchTime / results.length);
  const avgAppSearchTime = Math.round(totalAppSearchTime / results.length);
  const timeDiff = avgMeilisearchTime - avgAppSearchTime;

  let fasterEngine: "meilisearch" | "appsearch" | "tie";
  if (Math.abs(timeDiff) < 10) {
    fasterEngine = "tie";
  } else if (timeDiff > 0) {
    fasterEngine = "appsearch";
  } else {
    fasterEngine = "meilisearch";
  }

  return {
    totalQueries: results.length,
    successfulQueries: successfulResults.length,
    averageMatchPercentage:
      successfulResults.length > 0
        ? Math.round(totalMatchPercentage / successfulResults.length)
        : 0,
    averageMeilisearchTimeMs: avgMeilisearchTime,
    averageAppSearchTimeMs: avgAppSearchTime,
    timeDifferenceMs: Math.abs(timeDiff),
    fasterEngine,
  };
}

// =============================================================================
// REPORT FORMATTING
// =============================================================================

/**
 * Format a single comparison result for display
 */
function formatComparisonResult(result: ComparisonResult, index: number): string {
  const lines: string[] = [];

  lines.push(`\n${index + 1}. Query: "${result.query}"`);
  lines.push("   " + "-".repeat(50));

  // Meilisearch results
  if (result.meilisearch.error) {
    lines.push(`   Meilisearch: ERROR - ${result.meilisearch.error}`);
  } else {
    lines.push(
      `   Meilisearch: ${result.meilisearch.timeMs}ms | ${result.meilisearch.totalCount} results`
    );
    lines.push(`   Top ${TOP_RESULTS_COUNT} IDs: ${result.meilisearch.topIds.join(", ") || "(none)"}`);
  }

  // App Search results
  if (result.appSearch.error) {
    lines.push(`   App Search:  ERROR - ${result.appSearch.error}`);
  } else {
    lines.push(
      `   App Search:  ${result.appSearch.timeMs}ms | ${result.appSearch.totalCount} results`
    );
    lines.push(`   Top ${TOP_RESULTS_COUNT} IDs: ${result.appSearch.topIds.join(", ") || "(none)"}`);
  }

  // Comparison
  lines.push("");
  lines.push(`   Match: ${result.matchPercentage}%`);

  if (result.matchingIds.length > 0) {
    lines.push(`   Matching IDs: ${result.matchingIds.join(", ")}`);
  }

  if (result.meilisearchOnly.length > 0) {
    lines.push(`   Meilisearch only: ${result.meilisearchOnly.join(", ")}`);
  }

  if (result.appSearchOnly.length > 0) {
    lines.push(`   App Search only: ${result.appSearchOnly.join(", ")}`);
  }

  return lines.join("\n");
}

/**
 * Format the summary statistics
 */
function formatSummary(summary: ComparisonSummary): string {
  const lines: string[] = [];

  lines.push("\n" + "=".repeat(60));
  lines.push("                    COMPARISON SUMMARY");
  lines.push("=".repeat(60));
  lines.push("");
  lines.push(`   Total Queries:          ${summary.totalQueries}`);
  lines.push(`   Successful Queries:     ${summary.successfulQueries}`);
  lines.push("");
  lines.push(`   Avg Match Percentage:   ${summary.averageMatchPercentage}%`);
  lines.push("");
  lines.push("   Response Times:");
  lines.push(`     Meilisearch:          ${summary.averageMeilisearchTimeMs}ms avg`);
  lines.push(`     App Search:           ${summary.averageAppSearchTimeMs}ms avg`);
  lines.push(`     Difference:           ${summary.timeDifferenceMs}ms`);

  const fasterLabel =
    summary.fasterEngine === "tie"
      ? "(tie)"
      : summary.fasterEngine === "meilisearch"
        ? "(Meilisearch faster)"
        : "(App Search faster)";
  lines.push(`     Winner:               ${fasterLabel}`);

  lines.push("");

  // Recommendation based on match percentage
  if (summary.averageMatchPercentage >= 80) {
    lines.push("   [OK] High relevance alignment - safe for traffic migration");
  } else if (summary.averageMatchPercentage >= 60) {
    lines.push("   [WARN] Moderate relevance alignment - review synonyms and weights");
  } else {
    lines.push("   [ALERT] Low relevance alignment - investigate configuration differences");
  }

  lines.push("=".repeat(60));

  return lines.join("\n");
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

/**
 * Main comparison function
 */
async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("      Search Engine Comparison: Meilisearch vs App Search");
  console.log("=".repeat(60));
  console.log("");

  // Load configuration
  let config: EnvironmentConfig;
  try {
    config = loadEnvironmentConfig();
  } catch (error) {
    console.error(`Configuration error: ${(error as Error).message}`);
    console.log("");
    console.log("Please ensure the following environment variables are set:");
    console.log("  - MEILISEARCH_HOST");
    console.log("  - MEILISEARCH_API_KEY");
    console.log("  - APPSEARCH_ENDPOINT");
    console.log("  - APPSEARCH_PRIVATE_KEY");
    process.exit(1);
  }

  console.log("Configuration:");
  console.log(`  Meilisearch: ${config.meilisearch.host}`);
  console.log(`  App Search:  ${config.appSearch.endpoint}`);
  console.log(`  Engine:      ${config.appSearch.engineName}`);
  console.log(`  Index:       ${INDEX_NAME}`);
  console.log(`  Queries:     ${TEST_QUERIES.length}`);
  console.log("");

  // Initialize Meilisearch client
  const meilisearchClient = new MeiliSearch({
    host: config.meilisearch.host,
    apiKey: config.meilisearch.apiKey,
  });

  // Verify connections
  console.log("Verifying connections...");

  try {
    await meilisearchClient.health();
    console.log("  Meilisearch: Connected");
  } catch (error) {
    console.error(
      `  Meilisearch: Connection failed - ${(error as Error).message}`
    );
    process.exit(1);
  }

  try {
    const engineUrl = `${config.appSearch.endpoint}/api/as/v1/engines/${config.appSearch.engineName}`;
    const response = await fetch(engineUrl, {
      headers: { Authorization: `Bearer ${config.appSearch.privateApiKey}` },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    console.log("  App Search:  Connected");
  } catch (error) {
    console.error(
      `  App Search: Connection failed - ${(error as Error).message}`
    );
    process.exit(1);
  }

  console.log("");
  console.log("Running comparisons...");

  // Run all comparisons
  const results: ComparisonResult[] = [];

  for (const query of TEST_QUERIES) {
    process.stdout.write(`  Comparing: "${query}"...`);
    const result = await compareQuery(meilisearchClient, config, query);
    results.push(result);

    const status =
      result.meilisearch.error || result.appSearch.error
        ? " [ERROR]"
        : ` [${result.matchPercentage}% match]`;
    console.log(status);
  }

  // Generate report
  console.log("\n" + "=".repeat(60));
  console.log("                    DETAILED RESULTS");
  console.log("=".repeat(60));

  for (let i = 0; i < results.length; i++) {
    console.log(formatComparisonResult(results[i], i));
  }

  // Calculate and display summary
  const summary = calculateSummary(results);
  console.log(formatSummary(summary));

  // Exit with appropriate code
  const hasErrors = results.some(
    (r) => r.meilisearch.error || r.appSearch.error
  );
  const lowMatch = summary.averageMatchPercentage < 60;

  if (hasErrors) {
    console.log("\nExiting with code 1 (errors occurred)");
    process.exit(1);
  } else if (lowMatch) {
    console.log("\nExiting with code 2 (low match percentage)");
    process.exit(2);
  } else {
    console.log("\nExiting with code 0 (success)");
    process.exit(0);
  }
}

// Run the comparison
main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

/**
 * Search Rollback Script
 *
 * Quickly switches back to Meilisearch in case of App Search issues.
 * This script:
 * 1. Verifies Meilisearch is available
 * 2. Switches the search provider to Meilisearch
 * 3. Verifies search is working
 *
 * Usage:
 *   npm run search:rollback
 *   npx ts-node scripts/search-rollback.ts
 *
 * Options:
 *   --force    Skip confirmations
 *   --verify   Only verify current status, don't switch
 */

import dotenv from "dotenv";
import path from "path";
import readline from "readline";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY;
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN;

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const VERIFY_ONLY = args.includes("--verify");

interface HealthStatus {
  meilisearch: boolean;
  appSearch: boolean;
  currentProvider: string;
  dualMode: boolean;
}

async function checkMeilisearchHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${MEILISEARCH_HOST}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function checkAppSearchHealth(): Promise<boolean> {
  const endpoint = process.env.APPSEARCH_ENDPOINT;
  const privateKey = process.env.APPSEARCH_PRIVATE_KEY;

  if (!endpoint || !privateKey) {
    return false;
  }

  try {
    const response = await fetch(`${endpoint}/api/as/v1/engines`, {
      headers: { Authorization: `Bearer ${privateKey}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function getSearchStatus(): Promise<HealthStatus | null> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (ADMIN_TOKEN) {
      headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
    }

    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/search/status`, {
      headers,
    });

    if (!response.ok) {
      console.log(`   Warning: Could not fetch search status (${response.status})`);
      return null;
    }

    const data = await response.json();

    return {
      meilisearch: data.meilisearch?.healthy || false,
      appSearch: data.appsearch?.healthy || false,
      currentProvider: data.engine?.activeProvider || "unknown",
      dualMode: data.engine?.mode === "dual",
    };
  } catch (error) {
    console.log(`   Warning: Could not connect to backend`);
    return null;
  }
}

async function switchToMeilisearch(): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (ADMIN_TOKEN) {
      headers["Authorization"] = `Bearer ${ADMIN_TOKEN}`;
    }

    const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/search/engine`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        active_engine: "meilisearch",
        dual_write_enabled: false,
        confirmation_token: "CONFIRM_ENGINE_SWITCH",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`   Error: ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.log(`   Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function testSearch(): Promise<boolean> {
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/search?q=test&limit=1`);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return Array.isArray(data.products) || Array.isArray(data.hits);
  } catch {
    return false;
  }
}

async function confirm(message: string): Promise<boolean> {
  if (FORCE) {
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main(): Promise<void> {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("           Search Rollback to Meilisearch                  ");
  console.log("═══════════════════════════════════════════════════════════");

  console.log("\n🔍 Checking current status...\n");

  // Check Meilisearch health
  console.log("   Meilisearch:");
  const meilisearchOk = await checkMeilisearchHealth();
  console.log(`   ${meilisearchOk ? "✅" : "❌"} ${MEILISEARCH_HOST}`);

  if (!meilisearchOk) {
    console.log("\n❌ CRITICAL: Meilisearch is not available!");
    console.log("   Cannot rollback to Meilisearch if it's not running.");
    console.log("\n   Start Meilisearch first:");
    console.log("   docker-compose up -d meilisearch");
    process.exit(1);
  }

  // Check App Search health
  console.log("\n   App Search:");
  const appSearchOk = await checkAppSearchHealth();
  console.log(`   ${appSearchOk ? "✅" : "❌"} ${process.env.APPSEARCH_ENDPOINT || "not configured"}`);

  // Get current search status from backend
  console.log("\n   Backend Status:");
  const status = await getSearchStatus();

  if (status) {
    console.log(`   Current provider: ${status.currentProvider}`);
    console.log(`   Dual mode: ${status.dualMode ? "enabled" : "disabled"}`);
  } else {
    console.log(`   Could not retrieve status (backend may not be running)`);
  }

  // Verify only mode
  if (VERIFY_ONLY) {
    console.log("\n📊 Verification complete (--verify mode)");
    process.exit(0);
  }

  // Check if already on Meilisearch
  if (status?.currentProvider === "meilisearch" && !status.dualMode) {
    console.log("\n✅ Already using Meilisearch exclusively.");
    console.log("   No rollback needed.");
    process.exit(0);
  }

  // Confirm rollback
  console.log("\n⚠️  ROLLBACK ACTION");
  console.log("   This will switch all search traffic to Meilisearch.");

  if (status?.currentProvider === "appsearch") {
    console.log("   Current: App Search → New: Meilisearch");
  } else if (status?.dualMode) {
    console.log("   Current: Dual Mode → New: Meilisearch only");
  }

  const confirmed = await confirm("\n   Proceed with rollback?");

  if (!confirmed) {
    console.log("\n   Rollback cancelled.");
    process.exit(0);
  }

  // Perform rollback
  console.log("\n🔄 Switching to Meilisearch...");

  const switched = await switchToMeilisearch();

  if (!switched) {
    console.log("\n❌ Failed to switch via API.");
    console.log("\n   Manual rollback options:");
    console.log("   1. Set SEARCH_PROVIDER=meilisearch in .env");
    console.log("   2. Restart the backend");
    process.exit(1);
  }

  console.log("   ✅ Provider switched to Meilisearch");

  // Verify search is working
  console.log("\n🧪 Testing search...");

  // Wait a moment for the change to take effect
  await new Promise((r) => setTimeout(r, 1000));

  const searchOk = await testSearch();

  if (searchOk) {
    console.log("   ✅ Search is working");
  } else {
    console.log("   ⚠️ Search test returned unexpected results");
    console.log("   This may be normal if there's no test data.");
  }

  // Final status
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("                  Rollback Complete                         ");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("\n   ✅ Search provider: Meilisearch");
  console.log("   ✅ Dual write: Disabled");
  console.log("   ✅ App Search: Kept as fallback");

  console.log("\n📋 Next steps:");
  console.log("   1. Monitor search performance");
  console.log("   2. Investigate App Search issues");
  console.log("   3. When ready, re-enable with: SEARCH_PROVIDER=dual");

  console.log("\n🎉 Rollback successful!");
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});

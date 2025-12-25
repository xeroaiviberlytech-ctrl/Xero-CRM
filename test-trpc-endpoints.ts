/**
 * tRPC Endpoints Test Script
 * Tests all API endpoints to verify they're working correctly
 */

import { appRouter } from "./src/lib/trpc/routers/_app"
import { prisma } from "./src/lib/prisma/client"

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60))
  log(title, "cyan")
  console.log("=".repeat(60))
}

function logSuccess(message: string) {
  log(`✅ ${message}`, "green")
}

function logError(message: string, error?: any) {
  log(`❌ ${message}`, "red")
  if (error) {
    console.error(error)
  }
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, "blue")
}

// Create a mock context with a test user (bypassing Next.js cookies)
async function createTestContext() {
  // Get the first user from database to use for testing
  const testUser = await prisma.user.findFirst()
  
  if (!testUser) {
    throw new Error("No users found in database. Please seed the database first.")
  }

  // Create mock Supabase user
  const mockSupabaseUser = {
    id: testUser.supabaseUserId || "test-user-id",
    email: testUser.email,
    user_metadata: {
      name: testUser.name,
    },
  }

  // Create mock context directly (bypassing Supabase server client)
  const headers = new Headers()
  return {
    headers,
    user: mockSupabaseUser as any,
    prismaUser: testUser,
    prisma,
  }
}

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
}

async function testEndpoint(
  name: string,
  testFn: () => Promise<any>,
  skip = false
) {
  if (skip) {
    logInfo(`⏭️  ${name} - SKIPPED (requires authentication)`)
    results.skipped++
    return
  }

  try {
    const result = await testFn()
    logSuccess(`${name} - PASSED`)
    if (result && typeof result === "object") {
      const keys = Object.keys(result)
      if (keys.length > 0 && keys.length < 10) {
        logInfo(`   Result: ${JSON.stringify(result).substring(0, 100)}...`)
      }
    }
    results.passed++
  } catch (error: any) {
    logError(`${name} - FAILED`, error.message || error)
    results.failed++
  }
}

async function runTests() {
  logSection("tRPC API Endpoints Test Suite")
  
  const ctx = await createTestContext()
  const caller = appRouter.createCaller(ctx)

  // ==========================================
  // 1. Public Endpoints
  // ==========================================
  logSection("1. Public Endpoints")

  await testEndpoint("hello (public)", async () => {
    return await caller.hello({ text: "tRPC" })
  })

  // ==========================================
  // 2. Users Endpoints
  // ==========================================
  logSection("2. Users Endpoints")

  await testEndpoint("users.getCurrent", async () => {
    return await caller.users.getCurrent()
  })

  await testEndpoint("users.getById", async () => {
    const users = await prisma.user.findMany({ take: 1 })
    if (users.length > 0) {
      return await caller.users.getById({ id: users[0].id })
    }
    throw new Error("No users found")
  })

  // ==========================================
  // 3. Leads Endpoints
  // ==========================================
  logSection("3. Leads Endpoints")

  await testEndpoint("leads.list", async () => {
    return await caller.leads.list({})
  })

  await testEndpoint("leads.getById", async () => {
    const leads = await prisma.lead.findMany({ take: 1 })
    if (leads.length > 0) {
      return await caller.leads.getById({ id: leads[0].id })
    }
    throw new Error("No leads found")
  })

  // ==========================================
  // 4. Deals Endpoints
  // ==========================================
  logSection("4. Deals Endpoints")

  await testEndpoint("deals.list", async () => {
    return await caller.deals.list({})
  })

  await testEndpoint("deals.getByStage", async () => {
    return await caller.deals.getByStage()
  })

  await testEndpoint("deals.getStageStats", async () => {
    return await caller.deals.getStageStats()
  })

  // ==========================================
  // 5. Campaigns Endpoints
  // ==========================================
  logSection("5. Campaigns Endpoints")

  await testEndpoint("campaigns.list", async () => {
    return await caller.campaigns.list({})
  })

  await testEndpoint("campaigns.getStats", async () => {
    return await caller.campaigns.getStats()
  })

  // ==========================================
  // 6. Tasks Endpoints
  // ==========================================
  logSection("6. Tasks Endpoints")

  await testEndpoint("tasks.list", async () => {
    return await caller.tasks.list({})
  })

  await testEndpoint("tasks.getByStatus", async () => {
    return await caller.tasks.getByStatus()
  })

  await testEndpoint("tasks.getStats", async () => {
    return await caller.tasks.getStats()
  })

  // ==========================================
  // 7. Analytics Endpoints
  // ==========================================
  logSection("7. Analytics Endpoints")

  await testEndpoint("analytics.getDashboardStats", async () => {
    return await caller.analytics.getDashboardStats()
  })

  await testEndpoint("analytics.getRevenueTrend", async () => {
    return await caller.analytics.getRevenueTrend()
  })

  await testEndpoint("analytics.getPipelineDistribution", async () => {
    return await caller.analytics.getPipelineDistribution()
  })

  await testEndpoint("analytics.getRecentActivities", async () => {
    return await caller.analytics.getRecentActivities({ limit: 10 })
  })

  await testEndpoint("analytics.getLeadSources", async () => {
    return await caller.analytics.getLeadSources()
  })

  // ==========================================
  // 8. Activities Endpoints
  // ==========================================
  logSection("8. Activities Endpoints")

  await testEndpoint("activities.list", async () => {
    return await caller.activities.list({ limit: 10 })
  })

  // ==========================================
  // 9. Search Endpoints
  // ==========================================
  logSection("9. Search Endpoints")

  await testEndpoint("search.global", async () => {
    return await caller.search.global({ query: "test", limit: 5 })
  })

  await testEndpoint("search.leads", async () => {
    return await caller.search.leads({ query: "test", limit: 5 })
  })

  await testEndpoint("search.deals", async () => {
    return await caller.search.deals({ query: "test", limit: 5 })
  })

  // ==========================================
  // 10. Filters Endpoints
  // ==========================================
  logSection("10. Filters Endpoints")

  await testEndpoint("filters.getLeadFilters", async () => {
    return await caller.filters.getLeadFilters()
  })

  await testEndpoint("filters.getDealFilters", async () => {
    return await caller.filters.getDealFilters()
  })

  await testEndpoint("filters.getTaskFilters", async () => {
    return await caller.filters.getTaskFilters()
  })

  await testEndpoint("filters.getCampaignFilters", async () => {
    return await caller.filters.getCampaignFilters()
  })

  // ==========================================
  // Test Summary
  // ==========================================
  logSection("Test Summary")
  
  log(`Total Tests: ${results.passed + results.failed + results.skipped}`, "cyan")
  logSuccess(`Passed: ${results.passed}`)
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`)
  }
  if (results.skipped > 0) {
    logInfo(`Skipped: ${results.skipped}`)
  }

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1)
  log(`\nSuccess Rate: ${successRate}%`, results.failed === 0 ? "green" : "yellow")

  // Cleanup
  await prisma.$disconnect()

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0)
}

// Run tests
runTests().catch((error) => {
  logError("Test suite failed with error:", error)
  process.exit(1)
})


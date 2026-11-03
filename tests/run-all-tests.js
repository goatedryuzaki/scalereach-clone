#!/usr/bin/env node
/**
 * ScaleReach Standalone E2E & Integration Master Test Runner
 *
 * Can be executed directly via:
 *   node tests/run-all-tests.js
 *
 * Supported CLI Options:
 *   --tier=<1|2|3|4>   Run only tests belonging to a specific tier
 *   --filter=<string>  Filter tests by regex matching suite or test description
 *   --verbose          Print full error stack traces
 *   --bail             Abort execution upon first test failure
 *   --json             Output results as raw JSON
 */

const { TestContext, ANSI } = require('./helpers/test-context');
const { registerTier1Tests } = require('./e2e/tier1-features.test');
const { registerTier2Tests } = require('./e2e/tier2-boundaries.test');
const { registerTier3Tests } = require('./e2e/tier3-combinations.test');
const { registerTier4Tests } = require('./e2e/tier4-scenarios.test');

// Parse CLI flags
const args = process.argv.slice(2);
const options = {
  tier: null,
  filter: null,
  verbose: false,
  bail: false,
  json: false
};

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    options.tier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--filter=')) {
    options.filter = arg.split('=')[1];
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--bail') {
    options.bail = true;
  } else if (arg === '--json') {
    options.json = true;
  }
}

async function main() {
  if (!options.json) {
    console.log(`${ANSI.bold}${ANSI.blue}================================================================${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.blue} ScaleReach E2E & Integration Test Suite (Dual Track Runner)   ${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.blue} Zero-Paywall Standalone Verification Engine                    ${ANSI.reset}`);
    console.log(`${ANSI.bold}${ANSI.blue}================================================================${ANSI.reset}`);
    if (options.tier) console.log(`${ANSI.yellow}Filtering to Tier: ${options.tier}${ANSI.reset}`);
    if (options.filter) console.log(`${ANSI.yellow}Filtering by pattern: ${options.filter}${ANSI.reset}`);
  }

  const context = new TestContext({
    verbose: options.verbose,
    bail: options.bail,
    filter: options.filter
  });

  // Register tiers according to options
  if (!options.tier || options.tier === 1) {
    registerTier1Tests(context);
  }
  if (!options.tier || options.tier === 2) {
    registerTier2Tests(context);
  }
  if (!options.tier || options.tier === 3) {
    registerTier3Tests(context);
  }
  if (!options.tier || options.tier === 4) {
    registerTier4Tests(context);
  }

  const stats = await context.run();

  if (options.json) {
    console.log(JSON.stringify(stats, null, 2));
  } else {
    context.printSummary();
  }

  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`${ANSI.red}FATAL ERROR IN TEST RUNNER:${ANSI.reset}`, err);
  process.exit(1);
});

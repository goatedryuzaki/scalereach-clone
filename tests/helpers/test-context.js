/**
 * ScaleReach Standalone Test Harness & Context Helper
 * Pure Node.js zero-dependency runner core
 */

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

class TestContext {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      bail: false,
      filter: null,
      ...options
    };
    this.suites = [];
    this.currentSuite = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      startTime: 0,
      endTime: 0
    };
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      passed: 0,
      failed: 0,
      skipped: 0
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = null;
    }
  }

  it(description, testFn) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => this.it(description, testFn));
      return;
    }

    const testItem = {
      description,
      testFn,
      status: 'pending',
      error: null,
      duration: 0
    };
    this.currentSuite.tests.push(testItem);
  }

  skip(description, testFn) {
    if (!this.currentSuite) return;
    this.currentSuite.tests.push({
      description,
      testFn,
      status: 'skipped',
      error: null,
      duration: 0
    });
  }

  async run() {
    this.stats.startTime = Date.now();
    const filterRegex = this.options.filter ? new RegExp(this.options.filter, 'i') : null;

    for (const suite of this.suites) {
      let suitePrinted = false;

      for (const test of suite.tests) {
        if (filterRegex && !filterRegex.test(test.description) && !filterRegex.test(suite.name)) {
          test.status = 'skipped';
          suite.skipped++;
          this.stats.skipped++;
          continue;
        }

        if (test.status === 'skipped') {
          suite.skipped++;
          this.stats.skipped++;
          continue;
        }

        if (!suitePrinted) {
          console.log(`\n${ANSI.bold}${ANSI.cyan}▶ ${suite.name}${ANSI.reset}`);
          suitePrinted = true;
        }

        this.stats.total++;
        const start = performance.now();
        try {
          if (test.testFn.constructor.name === 'AsyncFunction') {
            await test.testFn();
          } else {
            test.testFn();
          }
          test.duration = performance.now() - start;
          test.status = 'passed';
          suite.passed++;
          this.stats.passed++;
          console.log(`  ${ANSI.green}✓${ANSI.reset} ${ANSI.gray}${test.description}${ANSI.reset} ${ANSI.dim}(${test.duration.toFixed(1)}ms)${ANSI.reset}`);
        } catch (err) {
          test.duration = performance.now() - start;
          test.status = 'failed';
          test.error = err;
          suite.failed++;
          this.stats.failed++;
          console.log(`  ${ANSI.red}✗ ${test.description}${ANSI.reset}`);
          console.log(`    ${ANSI.red}${err.message}${ANSI.reset}`);
          if (this.options.verbose && err.stack) {
            console.log(`    ${ANSI.dim}${err.stack.split('\n').slice(1, 4).join('\n    ')}${ANSI.reset}`);
          }
          if (this.options.bail) {
            console.log(`\n${ANSI.yellow}Bailing after first test failure...${ANSI.reset}`);
            break;
          }
        }
      }

      if (this.options.bail && suite.failed > 0) break;
    }

    this.stats.endTime = Date.now();
    return this.stats;
  }

  printSummary() {
    const elapsed = ((this.stats.endTime - this.stats.startTime) / 1000).toFixed(2);
    console.log(`\n${ANSI.bold}======================================================${ANSI.reset}`);
    console.log(`${ANSI.bold} ScaleReach E2E & Integration Test Suite Summary${ANSI.reset}`);
    console.log(`${ANSI.bold}======================================================${ANSI.reset}`);
    console.log(`Total Tests Run:  ${this.stats.total}`);
    console.log(`Passed:           ${ANSI.green}${this.stats.passed}${ANSI.reset}`);
    console.log(`Failed:           ${this.stats.failed > 0 ? ANSI.red + this.stats.failed + ANSI.reset : '0'}`);
    console.log(`Skipped:          ${this.stats.skipped}`);
    console.log(`Total Time:       ${elapsed}s`);
    console.log(`${ANSI.bold}======================================================${ANSI.reset}`);

    if (this.stats.failed === 0) {
      console.log(`${ANSI.bgGreen}${ANSI.bold} ALL TESTS PASSED (100% SUCCESS) ${ANSI.reset}\n`);
    } else {
      console.log(`${ANSI.bgRed}${ANSI.bold} FAILURES DETECTED: ${this.stats.failed} ${ANSI.reset}\n`);
    }
  }
}

/**
 * Lightweight, zero-dependency assertions
 */
const assert = {
  ok(val, msg) {
    if (!val) throw new Error(msg || `Expected truthy value but got ${JSON.stringify(val)}`);
  },
  equal(actual, expected, msg) {
    if (actual !== expected) {
      throw new Error(msg || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  notEqual(actual, expected, msg) {
    if (actual === expected) {
      throw new Error(msg || `Expected value NOT to equal ${JSON.stringify(expected)}`);
    }
  },
  deepEqual(actual, expected, msg) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr !== expStr) {
      throw new Error(msg || `Deep equality mismatch:\nExpected: ${expStr}\nActual:   ${actStr}`);
    }
  },
  throws(fn, expectedRegexOrMsg, msg) {
    let threw = false;
    let caughtErr = null;
    try {
      fn();
    } catch (err) {
      threw = true;
      caughtErr = err;
    }
    if (!threw) throw new Error(msg || 'Expected function to throw error but it did not.');
    if (expectedRegexOrMsg) {
      const errMsg = caughtErr.message || String(caughtErr);
      if (expectedRegexOrMsg instanceof RegExp) {
        if (!expectedRegexOrMsg.test(errMsg)) {
          throw new Error(`Expected error message matching ${expectedRegexOrMsg}, got "${errMsg}"`);
        }
      } else if (typeof expectedRegexOrMsg === 'string') {
        if (!errMsg.includes(expectedRegexOrMsg)) {
          throw new Error(`Expected error message containing "${expectedRegexOrMsg}", got "${errMsg}"`);
        }
      }
    }
  },
  async rejects(asyncFn, expectedRegexOrMsg, msg) {
    let threw = false;
    let caughtErr = null;
    try {
      await asyncFn();
    } catch (err) {
      threw = true;
      caughtErr = err;
    }
    if (!threw) throw new Error(msg || 'Expected async function to reject but it resolved.');
    if (expectedRegexOrMsg) {
      const errMsg = caughtErr.message || String(caughtErr);
      if (expectedRegexOrMsg instanceof RegExp) {
        if (!expectedRegexOrMsg.test(errMsg)) {
          throw new Error(`Expected error message matching ${expectedRegexOrMsg}, got "${errMsg}"`);
        }
      } else if (typeof expectedRegexOrMsg === 'string') {
        if (!errMsg.includes(expectedRegexOrMsg)) {
          throw new Error(`Expected error message containing "${expectedRegexOrMsg}", got "${errMsg}"`);
        }
      }
    }
  },
  includes(container, item, msg) {
    if (typeof container === 'string') {
      if (!container.includes(item)) {
        throw new Error(msg || `Expected string "${container}" to include "${item}"`);
      }
    } else if (Array.isArray(container)) {
      if (!container.includes(item)) {
        throw new Error(msg || `Expected array ${JSON.stringify(container)} to include ${JSON.stringify(item)}`);
      }
    } else {
      throw new Error(`Unsupported container type for assert.includes: ${typeof container}`);
    }
  },
  closeTo(actual, expected, delta = 0.001, msg) {
    if (Math.abs(actual - expected) > delta) {
      throw new Error(msg || `Expected ${actual} to be close to ${expected} within delta ${delta}`);
    }
  }
};

module.exports = {
  TestContext,
  assert,
  ANSI
};

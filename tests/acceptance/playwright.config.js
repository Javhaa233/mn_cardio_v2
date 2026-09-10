/**
 * Playwright config for the acceptance UI tests.
 *
 * Serial, single worker, and no retries by design: these run against a SHARED
 * test server that also hosts six live customer sites, and each browser plus
 * any PDF it triggers costs real memory there. Parallel workers would race for
 * the same records and make failures ambiguous.
 */
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: '**/*.spec.js',
  timeout: 180000,
  expect: { timeout: 30000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'results/playwright-report', open: 'never' }]],
  outputDir: 'results/playwright-artifacts',
  use: {
    baseURL: process.env.ACCEPTANCE_BASE || 'https://mncardio.itsystem.mn',
    headless: true,
    viewport: { width: 1600, height: 1000 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 45000,
    navigationTimeout: 60000,
    ignoreHTTPSErrors: false,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});

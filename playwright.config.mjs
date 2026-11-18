import { defineConfig, devices } from '@playwright/test';

// A manually supplied URL tests a deployed site. Otherwise, test the checked-out index.html.
const remoteUrl = (process.env.TEST_BASE_URL || '').trim();
const localUrl = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: remoteUrl || localUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 12_000,
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],
  webServer: remoteUrl ? undefined : {
    command: 'node scripts/serve.mjs',
    url: localUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});

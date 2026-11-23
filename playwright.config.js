const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const uiDirectory = path.resolve(__dirname, 'code', 'demo-app-ui');
const authDirectory = path.resolve(__dirname, 'playwright', '.auth');
const reportDirectory = path.resolve(__dirname, 'playwright-report');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: ['**/*.spec.js', '**/*.pw.js', '**/*.setup.js'],
  outputDir: path.resolve(__dirname, 'test-results'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['html', { outputFolder: reportDirectory, open: 'never' }],
    ['junit', { outputFile: path.join(reportDirectory, 'results.xml') }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    headless: false,
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'auth-setup',
      testDir: './tests/e2e/auth',
      testMatch: '**/auth.setup.js',
      use: {
        ...devices['Desktop Chrome'],
        screenshot: 'off',
        video: 'off',
        trace: 'off',
      },
    },
    {
      name: 'claimant',
      testDir: './tests/e2e/claimant',
      testMatch: '**/*.spec.js',
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDirectory, 'claimant.json'),
      },
    },
    {
      name: 'admin',
      testDir: './tests/e2e/admin',
      testMatch: '**/*.spec.js',
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDirectory, 'admin.json'),
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: '**/*.pw.js',
      use: {},
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 3001',
    cwd: uiDirectory,
    url: 'http://localhost:3001',
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      BFF_INTERNAL_URL: 'http://localhost:8090',
      NEXT_PUBLIC_BFF_URL: 'http://localhost:8090',
    },
  },
});

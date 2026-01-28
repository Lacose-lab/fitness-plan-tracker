import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    // Ensure E2E always has a server (works with qa-fleet runner).
    command: 'npm run build && npm run preview:ci',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iPhone 15 Pro Max (WebKit)',
      // closest available device profile in Playwright; if missing, fallback to iPhone 14 Pro Max.
      use: { ...(devices['iPhone 15 Pro Max'] ?? devices['iPhone 14 Pro Max'] ?? devices['iPhone 13']) },
    },
  ],
})

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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
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

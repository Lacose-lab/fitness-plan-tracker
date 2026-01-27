import { test, expect } from '@playwright/test'

async function gotoApp(page: any) {
  await page.goto('/')
  // wait for app bar to render
  await page.getByText('Today').first().waitFor({ state: 'visible' })
}

test.describe('UI smoke + safe-area', () => {
  test('Top bar is not clipped', async ({ page }) => {
    await gotoApp(page)

    const appBar = page.locator('.appBar')
    await expect(appBar).toBeVisible()

    const box = await appBar.boundingBox()
    expect(box).not.toBeNull()
    // The bar should start at/near the top; not negative (clipped).
    expect(box!.y).toBeGreaterThanOrEqual(0)
  })

  test('Bottom nav is anchored to bottom', async ({ page }) => {
    await gotoApp(page)

    const nav = page.locator('.bottomNav')
    await expect(nav).toBeVisible()

    const navBox = await nav.boundingBox()
    expect(navBox).not.toBeNull()

    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()

    // nav bottom should be within 2px of viewport bottom
    const navBottom = navBox!.y + navBox!.height
    expect(Math.abs(navBottom - viewport!.height)).toBeLessThanOrEqual(2)
  })

  test('Tabs render + screenshots', async ({ page }, testInfo) => {
    await gotoApp(page)

    // Today
    await page.screenshot({ path: testInfo.outputPath('today.png'), fullPage: true })

    // Log
    await page.getByRole('button', { name: /Log/i }).click()
    await expect(page.getByText('Quick log')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('log.png'), fullPage: true })

    // Plan
    await page.getByRole('button', { name: /Plan/i }).click()
    await expect(page.getByText('Weekly plan')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('plan.png'), fullPage: true })

    // Progress
    await page.getByRole('button', { name: /Progress/i }).click()
    await expect(page.getByText('Progress')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('progress.png'), fullPage: true })

    // Settings
    await page.getByRole('button', { name: /Settings/i }).click()
    await expect(page.getByText('Settings')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('settings.png'), fullPage: true })
  })
})

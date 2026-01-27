import { test, expect } from '@playwright/test'

async function gotoApp(page: any) {
  await page.goto('/')
  // wait for app bar to render
  await page.locator('.appBar').waitFor({ state: 'visible' })
}

test.describe('UI smoke + safe-area', () => {
  test('Top bar is not clipped + content starts below it', async ({ page }) => {
    await gotoApp(page)

    const appBar = page.locator('.appBar')
    const spacer = page.locator('.appBarSpacer')
    await expect(appBar).toBeVisible()
    await expect(spacer).toBeVisible()

    const barBox = await appBar.boundingBox()
    expect(barBox).not.toBeNull()
    expect(barBox!.y).toBeGreaterThanOrEqual(0)

    const paddingTop = await appBar.evaluate((el) => getComputedStyle(el).paddingTop)
    expect(parseFloat(paddingTop)).toBeGreaterThanOrEqual(10)

    // First card should start below the app bar bottom.
    const firstCard = page.locator('.main .card').first()
    await expect(firstCard).toBeVisible()
    const cardBox = await firstCard.boundingBox()
    expect(cardBox).not.toBeNull()
    const barBottom = barBox!.y + barBox!.height
    expect(cardBox!.y).toBeGreaterThanOrEqual(barBottom - 2)

    // Spacer should be at least the visible bar height.
    const spacerBox = await spacer.boundingBox()
    expect(spacerBox).not.toBeNull()
    expect(spacerBox!.height).toBeGreaterThanOrEqual(barBox!.height - 2)
  })

  test('Bottom nav is anchored to bottom', async ({ page }) => {
    await gotoApp(page)

    const nav = page.locator('.bottomNav')
    await expect(nav).toBeVisible()

    const navBox = await nav.boundingBox()
    expect(navBox).not.toBeNull()

    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()

    // nav bottom should be close to viewport bottom
    const navBottom = navBox!.y + navBox!.height
    expect(Math.abs(navBottom - viewport!.height)).toBeLessThanOrEqual(6)
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

import { test, expect } from '@playwright/test'

async function gotoApp(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.locator('.appBar').waitFor({ state: 'visible' })
}

test.describe('UI smoke + safe-area', () => {
  test('Top bar is fixed + content starts below it', async ({ page }) => {
    await gotoApp(page)

    const appBar = page.locator('.appBar')
    const spacer = page.locator('.appBarSpacer')
    await expect(appBar).toBeVisible()
    await expect(spacer).toBeVisible()

    const barBox = await appBar.boundingBox()
    expect(barBox).not.toBeNull()
    expect(barBox!.y).toBeGreaterThanOrEqual(0)

    const paddingTop = await appBar.evaluate((el) => getComputedStyle(el).paddingTop)
    expect(parseFloat(paddingTop)).toBeGreaterThanOrEqual(8)

    const spacerBox = await spacer.boundingBox()
    expect(spacerBox).not.toBeNull()
    expect(spacerBox!.height).toBeGreaterThanOrEqual(barBox!.height - 2)

    const firstCard = page.locator('.main .card').first()
    await expect(firstCard).toBeVisible()
    const cardBox = await firstCard.boundingBox()
    expect(cardBox).not.toBeNull()
    const barBottom = barBox!.y + barBox!.height
    expect(cardBox!.y).toBeGreaterThanOrEqual(barBottom - 2)
  })

  test('Bottom nav is anchored to bottom', async ({ page }) => {
    await gotoApp(page)

    const nav = page.locator('.bottomNav')
    await expect(nav).toBeVisible()

    const navBox = await nav.boundingBox()
    expect(navBox).not.toBeNull()

    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()

    const navBottom = navBox!.y + navBox!.height
    expect(Math.abs(navBottom - viewport!.height)).toBeLessThanOrEqual(6)
  })

  test('Tabs render + screenshots', async ({ page }, testInfo) => {
    await gotoApp(page)

    await page.screenshot({ path: testInfo.outputPath('today.png'), fullPage: true })

    await page.getByRole('button', { name: /Log/i }).click()
    await expect(page.getByText('Quick log')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('log.png'), fullPage: true })

    await page.getByRole('button', { name: /Plan/i }).click()
    await expect(page.getByText('Weekly plan')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('plan.png'), fullPage: true })

    await page.getByRole('button', { name: /Progress/i }).click()
    await expect(page.getByText('Progress')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('progress.png'), fullPage: true })

    await page.getByRole('button', { name: /Settings/i }).click()
    await expect(page.getByText('Settings')).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('settings.png'), fullPage: true })
  })
})

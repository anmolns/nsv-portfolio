import { launchTourBrowser } from './tour-screenshot.mjs'

export const YOUTUBE_WAIT_MS = 10_000

async function dismissYoutubeConsent(page) {
  const selectors = [
    'button:has-text("Accept all")',
    'button:has-text("Reject all")',
    '[aria-label*="Accept the use of cookies"]',
    'ytd-button-renderer:has-text("Accept all")',
  ]

  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(500)
      return
    }
  }
}

export async function screenshotYoutubeToBuffer(page, url, options = {}) {
  const waitMs = options.waitMs ?? YOUTUBE_WAIT_MS

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await dismissYoutubeConsent(page)

  const playButton = page.locator(
    '.ytp-large-play-button, button.ytp-large-play-button, button[aria-label="Play"]',
  )
  await playButton.click({ timeout: 15000 }).catch(() => {})

  await page.waitForTimeout(1200)

  const fullscreenButton = page.locator(
    '.ytp-fullscreen-button, button.ytp-fullscreen-button, button[aria-label="Full screen"]',
  )
  await fullscreenButton.click({ timeout: 10000 }).catch(() => {})

  await page.waitForTimeout(waitMs)

  return page.screenshot({
    type: 'jpeg',
    quality: 82,
    fullPage: false,
  })
}

export { launchTourBrowser }

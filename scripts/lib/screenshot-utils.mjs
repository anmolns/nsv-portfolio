export const SCREENSHOT_VIEWPORT = { width: 1920, height: 1080 }
export const SCREENSHOT_JPEG_QUALITY = 88

export function screenshotJpegOptions(overrides = {}) {
  return {
    type: 'jpeg',
    quality: SCREENSHOT_JPEG_QUALITY,
    fullPage: false,
    ...overrides,
  }
}

/**
 * Prefer the largest on-page media surface (video/canvas) for a full-width frame.
 */
export async function screenshotBestMediaSurface(page, fallbackOptions = {}) {
  const candidates = page.locator('video, canvas')
  const count = await candidates.count()

  let best = null
  let bestArea = 0

  for (let i = 0; i < count; i++) {
    const el = candidates.nth(i)
    const visible = await el.isVisible().catch(() => false)
    if (!visible) continue

    const box = await el.boundingBox().catch(() => null)
    if (!box) continue

    const area = box.width * box.height
    if (box.width >= 640 && area > bestArea) {
      bestArea = area
      best = el
    }
  }

  if (best) {
    return best.screenshot(screenshotJpegOptions())
  }

  return page.screenshot(screenshotJpegOptions(fallbackOptions))
}

export async function tryClickFullscreen(page) {
  const selectors = [
    'button[aria-label="Full screen"]',
    'button[aria-label="Fullscreen"]',
    '.ytp-fullscreen-button',
    'button.ytp-fullscreen-button',
    '[title="Fullscreen"]',
    '[title="Full screen"]',
    '.fullscreen-button',
    '.vr-fullscreen',
    'button:has-text("Fullscreen")',
  ]

  for (const selector of selectors) {
    const btn = page.locator(selector).first()
    if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.click({ timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(600)
      return true
    }
  }

  return false
}

export async function tryTheaterMode(page) {
  const theater = page.locator(
    '.ytp-size-button, button.ytp-size-button, button[aria-label="Theater mode"]',
  )
  if (await theater.isVisible({ timeout: 1500 }).catch(() => false)) {
    await theater.click({ timeout: 3000 }).catch(() => {})
    await page.waitForTimeout(500)
  }
}

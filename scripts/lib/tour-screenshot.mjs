import { chromium } from 'playwright'

export const DEFAULT_SCREENSHOT_OPTIONS = {
  waitMs: 12000,
  panPx: 160,
  scrollDelta: 120,
  settleMs: 1500,
  noPan: false,
}

async function nudgeTourView(page, options) {
  const { panPx, scrollDelta, settleMs } = options
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 }
  const cx = width / 2
  const cy = height / 2

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx, cy - panPx, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(400)
  await page.mouse.move(cx, cy)
  await page.mouse.wheel(0, scrollDelta)
  await page.waitForTimeout(settleMs)
}

export async function launchTourBrowser() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  return { browser, page }
}

export async function screenshotTourToBuffer(page, url, options = {}) {
  const opts = { ...DEFAULT_SCREENSHOT_OPTIONS, ...options }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(opts.waitMs)

  if (!opts.noPan) {
    await nudgeTourView(page, opts)
  }

  return page.screenshot({
    type: 'jpeg',
    quality: 82,
    fullPage: false,
  })
}

export async function screenshotTourToFile(page, url, outPath, options = {}) {
  const buffer = await screenshotTourToBuffer(page, url, options)
  const { writeFileSync } = await import('node:fs')
  writeFileSync(outPath, buffer)
}

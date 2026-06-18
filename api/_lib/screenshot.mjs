const WAIT_MS = Number(process.env.IMPORT_WAIT_MS ?? 8000)
const PAN_PX = Number(process.env.IMPORT_PAN_PX ?? 160)
const SCROLL_DELTA = Number(process.env.IMPORT_SCROLL_DELTA ?? 120)
const SETTLE_MS = Number(process.env.IMPORT_SETTLE_MS ?? 1200)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function nudgeTourView(page) {
  const viewport = page.viewport() ?? { width: 1280, height: 720 }
  const cx = viewport.width / 2
  const cy = viewport.height / 2

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx, cy - PAN_PX, { steps: 12 })
  await page.mouse.up()
  await sleep(400)
  await page.mouse.move(cx, cy)
  await page.mouse.wheel({ deltaY: SCROLL_DELTA })
  await sleep(SETTLE_MS)
}

/** Serverless (Vercel) — puppeteer + bundled chromium */
async function screenshotWithPuppeteer(url) {
  const chromium = (await import('@sparticuz/chromium')).default
  const puppeteer = await import('puppeteer-core')

  const browser = await puppeteer.default.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  })

  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
    await sleep(WAIT_MS)
    await nudgeTourView(page)
    return page.screenshot({ type: 'jpeg', quality: 82, fullPage: false })
  } finally {
    await browser.close()
  }
}

/** Local dev — playwright (already in devDependencies) */
async function screenshotWithPlaywright(url) {
  const { launchTourBrowser, screenshotTourToBuffer } = await import(
    '../../scripts/lib/tour-screenshot.mjs'
  )
  const { browser, page } = await launchTourBrowser()
  try {
    return screenshotTourToBuffer(page, url, {
      waitMs: WAIT_MS,
      panPx: PAN_PX,
      scrollDelta: SCROLL_DELTA,
      settleMs: SETTLE_MS,
    })
  } finally {
    await browser.close()
  }
}

export async function screenshotTourToBuffer(url) {
  if (process.env.VERCEL) {
    return screenshotWithPuppeteer(url)
  }
  return screenshotWithPlaywright(url)
}

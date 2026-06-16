/**
 * Import virtual tours from a CSV sheet + auto-generate thumbnails.
 *
 * Setup (once):
 *   npm install
 *   npx playwright install chromium
 *
 * Usage:
 *   1. Export your sheet as CSV → save as data/tours.csv
 *      Columns: link (required), city (required), name (optional)
 *   2. npm run import:tours
 *
 * Output:
 *   - public/tour-thumbs/*.jpg
 *   - src/data/imported-tours.json
 */

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const CSV_PATH = process.argv.find((a) => a.startsWith('--csv='))?.slice(6) ?? join(ROOT, 'data/tours.csv')
const SKIP_SCREENSHOTS = process.argv.includes('--skip-screenshots')
const WAIT_MS = Number(process.argv.find((a) => a.startsWith('--wait='))?.slice(7) ?? 12000)
const PAN_PX = Number(process.argv.find((a) => a.startsWith('--pan='))?.slice(6) ?? 160)
const SCROLL_DELTA = Number(process.argv.find((a) => a.startsWith('--scroll='))?.slice(9) ?? 120)
const SETTLE_MS = Number(process.argv.find((a) => a.startsWith('--settle='))?.slice(9) ?? 1500)
const NO_PAN = process.argv.includes('--no-pan')

const THUMB_DIR = join(ROOT, 'public/tour-thumbs')
const OUT_JSON = join(ROOT, 'src/data/imported-tours.json')

function parseCsvLine(line) {
  const cols = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  cols.push(cur.trim())
  return cols
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const linkIdx = headers.indexOf('link')
  const cityIdx = headers.indexOf('city')
  const nameIdx = headers.indexOf('name')

  if (linkIdx === -1) {
    throw new Error('CSV must have a "link" column')
  }

  return lines.slice(1).map((line, i) => {
    const cols = parseCsvLine(line)
    const link = cols[linkIdx]?.replace(/^"|"$/g, '')
    if (!link?.startsWith('http')) {
      throw new Error(`Row ${i + 2}: invalid link "${link}"`)
    }
    return {
      link,
      city: cityIdx >= 0 ? (cols[cityIdx] || 'Unknown').replace(/^"|"$/g, '') : 'Unknown',
      name: nameIdx >= 0 ? (cols[nameIdx] || '').replace(/^"|"$/g, '') : '',
    }
  })
}

function slugFromUrl(url) {
  const path = new URL(url).pathname.replace(/^\/|\/$/g, '')
  return path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function nameFromSlug(slug) {
  return slug
    .replace(/-nsv$/i, '')
    .replace(/\d{1,2}(january|february|march|april|may|june|july|august|september|october|november|december)\d{0,4}$/i, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Nudge the 360 viewer (drag + wheel) so the frame isn't the default loading angle */
async function nudgeTourView(page) {
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 }
  const cx = width / 2
  const cy = height / 2

  await page.mouse.move(cx, cy)
  await page.mouse.down()

  // Drag vertically — tilts/pans most WebGL tour viewers
  await page.mouse.move(cx, cy - PAN_PX, { steps: 12 })
  await page.mouse.up()

  await page.waitForTimeout(400)

  // Small scroll wheel — slight zoom on many viewers
  await page.mouse.move(cx, cy)
  await page.mouse.wheel(0, SCROLL_DELTA)

  await page.waitForTimeout(SETTLE_MS)
}

async function screenshotTour(page, url, outPath) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 })
  await page.waitForTimeout(WAIT_MS)

  if (!NO_PAN) {
    await nudgeTourView(page)
  }

  await page.screenshot({
    path: outPath,
    type: 'jpeg',
    quality: 82,
    fullPage: false,
  })
}

async function main() {
  if (!existsSync(CSV_PATH)) {
    console.error(`\nMissing CSV: ${CSV_PATH}`)
    console.error('Export your sheet as CSV with columns: link, city, name')
    console.error('Copy data/tours.csv.example → data/tours.csv and fill it in.\n')
    process.exit(1)
  }

  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'))
  console.log(`Found ${rows.length} tours in ${CSV_PATH}`)

  mkdirSync(THUMB_DIR, { recursive: true })

  const entries = rows.map((row) => {
    const id = slugFromUrl(row.link)
    const thumbFile = `${id}.jpg`
    return {
      id,
      name: row.name || nameFromSlug(id),
      link: row.link,
      thumbnail: `/tour-thumbs/${thumbFile}`,
      city: row.city,
      mediaType: 'virtual-tour',
      _thumbPath: join(THUMB_DIR, thumbFile),
    }
  })

  if (!SKIP_SCREENSHOTS) {
    console.log(
      `\nLaunching browser (wait ${WAIT_MS / 1000}s, then pan down ${PAN_PX}px + scroll before capture)…\n`,
    )
    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      process.stdout.write(`[${i + 1}/${entries.length}] ${entry.name} … `)
      try {
        await screenshotTour(page, entry.link, entry._thumbPath)
        console.log('ok')
      } catch (err) {
        console.log('failed —', err.message)
        entry.thumbnail = null
      }
    }

    await browser.close()
  } else {
    console.log('Skipping screenshots (--skip-screenshots)')
  }

  const output = entries.map(({ _thumbPath, ...rest }) => rest)
  writeFileSync(OUT_JSON, JSON.stringify(output, null, 2) + '\n')

  console.log(`\nDone.`)
  console.log(`  Thumbnails: public/tour-thumbs/`)
  console.log(`  Data:       src/data/imported-tours.json`)
  console.log(`\nRestart dev server to see tours in the portfolio.\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

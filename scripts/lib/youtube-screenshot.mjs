import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { youtubeVideoIdFromUrl, youtubeWatchUrl } from './tour-import-utils.mjs'
import { VIDEO_CAPTURE_AT_SECONDS } from './screenshot-utils.mjs'

const execFileAsync = promisify(execFile)

/**
 * YouTube blocks most headless browser playback (Error 150).
 * Use CDN thumbnails + optional yt-dlp frame capture instead of Playwright.
 */
async function fetchYoutubeThumbnailJpeg(videoId) {
  const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault']

  for (const quality of qualities) {
    const res = await fetch(`https://i.ytimg.com/vi/${videoId}/${quality}.jpg`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) continue

    const buffer = Buffer.from(await res.arrayBuffer())
    // YouTube returns a tiny placeholder when maxres is unavailable.
    if (buffer.length > 8000 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      return buffer
    }
  }

  throw new Error('Could not fetch YouTube thumbnail from CDN')
}

async function commandExists(command) {
  try {
    if (process.platform === 'win32') {
      await execFileAsync('where', [command])
    } else {
      await execFileAsync('which', [command])
    }
    return true
  } catch {
    return false
  }
}

/** Optional: frame at N seconds when yt-dlp + ffmpeg are installed locally. */
async function tryYtDlpFrame(url, seconds = VIDEO_CAPTURE_AT_SECONDS) {
  const hasYtDlp = await commandExists('yt-dlp')
  const hasFfmpeg = await commandExists('ffmpeg')
  if (!hasYtDlp || !hasFfmpeg) return null

  const dir = await mkdtemp(join(tmpdir(), 'nsv-yt-frame-'))
  const clipPath = join(dir, 'clip.mp4')
  const framePath = join(dir, 'frame.jpg')

  try {
    await execFileAsync(
      'yt-dlp',
      [
        '-f',
        'bv*[height<=720]/bv*',
        '--no-playlist',
        '--force-keyframes-at-cuts',
        '--download-sections',
        `*${seconds}-${seconds + 2}`,
        '-o',
        clipPath,
        url,
      ],
      { timeout: 120_000 },
    )

    await execFileAsync(
      'ffmpeg',
      ['-y', '-ss', '0.5', '-i', clipPath, '-frames:v', '1', '-q:v', '2', framePath],
      { timeout: 60_000 },
    )

    return await readFile(framePath)
  } catch {
    return null
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

export async function screenshotYoutubeToBuffer(_page, url, options = {}) {
  const videoId = youtubeVideoIdFromUrl(url)
  if (!videoId) {
    throw new Error('Invalid YouTube URL')
  }

  const seconds = options.captureAtSeconds ?? VIDEO_CAPTURE_AT_SECONDS
  const watchUrl = youtubeWatchUrl(url)

  const frame = await tryYtDlpFrame(watchUrl, seconds)
  if (frame) {
    console.log(`[youtube-screenshot] Captured frame at ${seconds}s via yt-dlp for ${videoId}`)
    return frame
  }

  console.log(`[youtube-screenshot] Using YouTube CDN thumbnail for ${videoId}`)
  return fetchYoutubeThumbnailJpeg(videoId)
}

export { launchTourBrowser } from './tour-screenshot.mjs'

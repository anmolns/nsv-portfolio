export function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes('videos.pexels.com')
}

/**
 * Opens portfolio links without embedding heavy iframes.
 * Direct video files play in a lightweight modal; everything else opens in a new tab.
 */
export function openPortfolioEntry(
  entry: { link: string; mediaType: 'video' | 'virtual-tour' },
): 'video-modal' | 'external' | 'missing' {
  if (!entry.link?.trim()) return 'missing'

  if (entry.mediaType === 'video' && isDirectVideoUrl(entry.link)) {
    return 'video-modal'
  }

  window.open(entry.link, '_blank', 'noopener,noreferrer')
  return 'external'
}

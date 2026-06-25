export function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.includes('videos.pexels.com')
}

export function isYoutubeLink(link: string): boolean {
  try {
    const host = new URL(link.trim()).hostname.toLowerCase()
    return host.includes('youtube.com') || host.includes('youtu.be')
  } catch {
    return false
  }
}

export function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.toLowerCase()

    if (host.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null
    }

    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`
      const shorts = u.pathname.match(/\/shorts\/([^/]+)/)
      if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}?autoplay=1`
    }
  } catch {
    // fall through
  }

  return null
}

/** Infer portfolio media type from URL — YouTube links are always videos. */
export function inferMediaTypeFromLink(link: string): 'video' | 'virtual-tour' {
  const trimmed = link.trim()
  if (!trimmed.startsWith('http')) return 'virtual-tour'
  return isYoutubeLink(trimmed) ? 'video' : 'virtual-tour'
}

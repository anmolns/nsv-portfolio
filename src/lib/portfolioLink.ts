export function isYoutubeLink(link: string): boolean {
  try {
    const host = new URL(link.trim()).hostname.toLowerCase()
    return host.includes('youtube.com') || host.includes('youtu.be')
  } catch {
    return false
  }
}

/** Infer portfolio media type from URL — YouTube links are always videos. */
export function inferMediaTypeFromLink(link: string): 'video' | 'virtual-tour' {
  const trimmed = link.trim()
  if (!trimmed.startsWith('http')) return 'virtual-tour'
  return isYoutubeLink(trimmed) ? 'video' : 'virtual-tour'
}

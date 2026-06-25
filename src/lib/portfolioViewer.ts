import { isDirectVideoUrl, isYoutubeLink, youtubeEmbedUrl } from './portfolioLink'

export type PortfolioViewerMode = 'native-video' | 'iframe'

export function getPortfolioViewerSrc(entry: {
  link: string
  mediaType: 'video' | 'virtual-tour'
}): { mode: PortfolioViewerMode; src: string } | null {
  const link = entry.link?.trim()
  if (!link) return null

  if (entry.mediaType === 'video' && isDirectVideoUrl(link)) {
    return { mode: 'native-video', src: link }
  }

  if (entry.mediaType === 'video' && isYoutubeLink(link)) {
    const embed = youtubeEmbedUrl(link)
    if (embed) return { mode: 'iframe', src: embed }
  }

  return { mode: 'iframe', src: link }
}

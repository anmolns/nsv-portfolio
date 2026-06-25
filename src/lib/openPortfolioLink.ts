/** Open in the on-page viewer modal (same tab — no new window). */
export function openPortfolioEntry(entry: {
  link: string
  mediaType: 'video' | 'virtual-tour'
}): 'modal' | 'missing' {
  if (!entry.link?.trim()) return 'missing'
  return 'modal'
}

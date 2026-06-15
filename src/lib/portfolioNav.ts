import type { ProjectMediaType } from '../data/projects'

export function parseMediaFilter(hash: string): ProjectMediaType | 'all' {
  if (hash === '#video') return 'video'
  if (hash === '#virtual-tours') return 'virtual-tour'
  return 'all'
}

export function scrollToPortfolioFilter(filter: 'video' | 'virtual-tour') {
  window.location.hash = filter === 'video' ? 'video' : 'virtual-tours'
  window.dispatchEvent(new CustomEvent('portfolio-filter', { detail: filter }))
  document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
}

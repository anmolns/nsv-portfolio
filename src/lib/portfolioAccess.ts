const STORAGE_KEY = 'nsv-portfolio-access-v2'

export interface PortfolioAccessInfo {
  name: string
  email: string
  phone: string
  validatedAt: string
}

export function readPortfolioAccess(): PortfolioAccessInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PortfolioAccessInfo
    if (!parsed.name?.trim() || !parsed.email?.trim() || !parsed.phone?.trim()) return null
    return parsed
  } catch {
    return null
  }
}

export function hasPortfolioAccess(): boolean {
  return readPortfolioAccess() !== null
}

export function savePortfolioAccess(
  info: Pick<PortfolioAccessInfo, 'name' | 'email' | 'phone'>,
): PortfolioAccessInfo {
  const saved: PortfolioAccessInfo = {
    name: info.name.trim(),
    email: info.email.trim(),
    phone: info.phone.trim(),
    validatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  return saved
}

/** Delay before auto-showing the access gate (ms). */
export const PORTFOLIO_ACCESS_TIMER_MS = 18_000

import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M+`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`
  return `${n}+`
}

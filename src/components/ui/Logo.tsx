import { cn } from '../../lib/utils'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
} as const

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="NS Ventures"
      className={cn(
        sizeClasses[size],
        'w-auto max-w-none shrink-0 object-contain',
        className,
      )}
      width={500}
      height={123}
      decoding="async"
    />
  )
}

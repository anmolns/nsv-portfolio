import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { PortfolioEntry } from '../types/portfolio'
import {
  hasPortfolioAccess,
  PORTFOLIO_ACCESS_TIMER_MS,
} from '../lib/portfolioAccess'

const PortfolioAccessGateModal = lazy(() =>
  import('../components/ui/PortfolioAccessGateModal').then((m) => ({
    default: m.PortfolioAccessGateModal,
  })),
)

const PortfolioVideoModal = lazy(() =>
  import('../components/ui/PortfolioVideoModal').then((m) => ({
    default: m.PortfolioVideoModal,
  })),
)

interface PortfolioAccessContextValue {
  isValidated: boolean
  openPortfolioItem: (entry: PortfolioEntry) => void
}

const PortfolioAccessContext = createContext<PortfolioAccessContextValue | null>(null)

export function PortfolioAccessProvider({ children }: { children: ReactNode }) {
  const [isValidated, setIsValidated] = useState(() => hasPortfolioAccess())
  const [gateOpen, setGateOpen] = useState(false)
  const [pendingEntry, setPendingEntry] = useState<PortfolioEntry | null>(null)
  const [activeEntry, setActiveEntry] = useState<PortfolioEntry | null>(null)
  const timerStartedRef = useRef(false)

  useEffect(() => {
    if (isValidated || timerStartedRef.current) return
    timerStartedRef.current = true

    const timer = window.setTimeout(() => {
      if (hasPortfolioAccess()) {
        setIsValidated(true)
        return
      }
      setGateOpen(true)
    }, PORTFOLIO_ACCESS_TIMER_MS)

    return () => window.clearTimeout(timer)
  }, [isValidated])

  const openPortfolioItem = useCallback(
    (entry: PortfolioEntry) => {
      if (isValidated || hasPortfolioAccess()) {
        setActiveEntry(entry)
        return
      }
      setPendingEntry(entry)
      setGateOpen(true)
    },
    [isValidated],
  )

  const handleValidated = useCallback(() => {
    setIsValidated(true)
    setGateOpen(false)
    if (pendingEntry) {
      setActiveEntry(pendingEntry)
      setPendingEntry(null)
    }
  }, [pendingEntry])

  const closePortfolio = useCallback(() => {
    setActiveEntry(null)
  }, [])

  const pendingProjectName = pendingEntry
    ? (pendingEntry.projectName ?? pendingEntry.name).trim()
    : null

  return (
    <PortfolioAccessContext.Provider value={{ isValidated, openPortfolioItem }}>
      {children}

      {gateOpen && !isValidated && (
        <Suspense fallback={null}>
          <PortfolioAccessGateModal
            pendingProjectName={pendingProjectName}
            onValidated={handleValidated}
          />
        </Suspense>
      )}

      {activeEntry && (
        <Suspense fallback={null}>
          <PortfolioVideoModal entry={activeEntry} onClose={closePortfolio} />
        </Suspense>
      )}
    </PortfolioAccessContext.Provider>
  )
}

export function usePortfolioAccess(): PortfolioAccessContextValue {
  const ctx = useContext(PortfolioAccessContext)
  if (!ctx) {
    throw new Error('usePortfolioAccess must be used within PortfolioAccessProvider')
  }
  return ctx
}

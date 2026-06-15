import { lazy, Suspense } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Hero } from './components/sections/Hero'
import { useLenis } from './hooks/useLenis'

const Portfolio = lazy(() =>
  import('./components/sections/Portfolio').then((m) => ({ default: m.Portfolio })),
)
const Footer = lazy(() =>
  import('./components/layout/Footer').then((m) => ({ default: m.Footer })),
)
const FloatingActions = lazy(() =>
  import('./components/layout/FloatingActions').then((m) => ({ default: m.FloatingActions })),
)
const CursorFollower = lazy(() =>
  import('./components/ui/ProjectModal').then((m) => ({ default: m.CursorFollower })),
)

function App() {
  useLenis()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-cyan focus:text-navy"
      >
        Skip to main content
      </a>
      <Suspense fallback={null}>
        <CursorFollower />
      </Suspense>
      <Navbar />
      <main id="main-content">
        <Hero />
        <Suspense fallback={<div className="min-h-[50vh] bg-off-white" aria-hidden />}>
          <Portfolio />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <FloatingActions />
      </Suspense>
    </>
  )
}

export default App

import { Navbar } from './components/layout/Navbar'
import { FloatingActions } from './components/layout/FloatingActions'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { OffsetCarousel } from './components/sections/OffsetCarousel'
import { WhatWeOffer } from './components/sections/WhatWeOffer'
import { Portfolio } from './components/sections/Portfolio'
import { CursorFollower } from './components/ui/ProjectModal'
import { useLenis } from './hooks/useLenis'

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
      <CursorFollower />
      <Navbar />
      <main id="main-content">
        <Hero />
        <OffsetCarousel />
        <WhatWeOffer />
        <Portfolio />
      </main>
      <Footer />
      <FloatingActions />
    </>
  )
}

export default App

import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import PublicApp from './PublicApp'

const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-navy-deep flex items-center justify-center text-cyan text-sm">
                  Loading admin…
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="/*" element={<PublicApp />} />
      </Routes>
    </BrowserRouter>
  )
}

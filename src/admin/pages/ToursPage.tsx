import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { getPortfolioThumbnail } from '../../lib/portfolioMedia'
import { deleteTour, fetchAdminTours } from '../api/adminPortfolio'
import { AdminCard, AdminPageHeader } from '../components/AdminLayout'
import type { PortfolioItemRow } from '../types'

export function ToursPage() {
  const [tours, setTours] = useState<PortfolioItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetchAdminTours()
      .then(setTours)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tours'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await deleteTour(id)
      setTours((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Portfolio"
        subtitle="Videos and virtual tours shown on the public site"
        action={
          <Link
            to="/admin/tours/new"
            className="inline-flex items-center rounded-full bg-cyan px-6 py-3 text-sm font-bold text-navy shadow-lg shadow-cyan/20 hover:bg-cyan-bright transition-colors"
          >
            + Add tour
          </Link>
        }
      />

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <AdminCard>
        {loading ? (
          <div className="p-12 text-center text-slate text-sm">Loading portfolio…</div>
        ) : tours.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate text-sm">No tours yet.</p>
            <Link
              to="/admin/tours/new"
              className="inline-block mt-4 text-sm font-bold text-cyan hover:text-cyan-bright"
            >
              Add your first tour →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white/80">
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider hidden sm:table-cell">
                    City
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider hidden md:table-cell">
                    Type
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold text-slate text-[10px] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour, i) => (
                  <motion.tr
                    key={tour.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                    className="border-b border-border last:border-0 hover:bg-off-white/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-navy/5">
                        <img
                          src={getPortfolioThumbnail(tour.thumbnail_path)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{tour.name}</p>
                      <p className="text-xs text-slate-light mt-0.5 truncate max-w-[200px]">
                        {tour.link}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate hidden sm:table-cell">
                      {tour.cities?.name ?? '—'}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-navy/5 text-navy">
                        {tour.media_type === 'video' ? 'Video' : 'VR Tour'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          tour.is_published
                            ? 'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700'
                            : 'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate'
                        }
                      >
                        {tour.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/tours/${tour.id}/edit`}
                        className="text-cyan font-semibold hover:text-cyan-bright mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === tour.id}
                        onClick={() => handleDelete(tour.id, tour.name)}
                        className="text-red-500 font-semibold hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === tour.id ? '…' : 'Delete'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  )
}

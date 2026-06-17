import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import {
  createCity,
  fetchAllAdminCities,
  setCityActive,
} from '../api/adminPortfolio'
import { AdminCard, AdminPageHeader } from '../components/AdminLayout'
import type { CityWithCount } from '../types'

export function CitiesPage() {
  const [cities, setCities] = useState<CityWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetchAllAdminCities()
      .then(setCities)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load cities'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name || adding) return

    setAdding(true)
    setError(null)
    try {
      await createCity(name)
      setNewName('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add city')
    } finally {
      setAdding(false)
    }
  }

  const toggleActive = async (city: CityWithCount) => {
    setBusyId(city.id)
    try {
      await setCityActive(city.id, !city.is_active)
      setCities((prev) =>
        prev.map((c) => (c.id === city.id ? { ...c, is_active: !c.is_active } : c)),
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const activeCount = cities.filter((c) => c.is_active).length

  return (
    <>
      <AdminPageHeader
        title="Cities"
        subtitle={`${activeCount} active · Cities stay saved even when tours are deleted`}
      />

      {error && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <AdminCard className="p-6 mb-6">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New city name…"
            className="flex-1 min-w-[200px] rounded-xl border border-border bg-off-white px-4 py-3 text-navy focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="rounded-full bg-cyan px-6 py-3 text-sm font-bold text-navy hover:bg-cyan-bright transition-colors disabled:opacity-60"
          >
            {adding ? 'Adding…' : 'Add city'}
          </button>
        </form>
      </AdminCard>

      <AdminCard>
        {loading ? (
          <div className="p-12 text-center text-slate text-sm">Loading cities…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-off-white/80">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-semibold text-slate">
                    City
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-semibold text-slate">
                    Tours
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-semibold text-slate">
                    Status
                  </th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-wider font-semibold text-slate text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city, i) => (
                  <motion.tr
                    key={city.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold text-navy">{city.name}</td>
                    <td className="px-5 py-4 text-slate">{city.tour_count}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          city.is_active
                            ? 'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700'
                            : 'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate'
                        }
                      >
                        {city.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={busyId === city.id}
                        onClick={() => toggleActive(city)}
                        className="text-cyan font-semibold hover:text-cyan-bright disabled:opacity-50"
                      >
                        {city.is_active ? 'Hide' : 'Activate'}
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

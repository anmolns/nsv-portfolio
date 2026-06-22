import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { cn } from '../../lib/utils'
import { createCity } from '../api/adminPortfolio'
import { canonicalCityName } from '../lib/cityNames'
import type { CityRow } from '../types'

interface CityPickerProps {
  cities: CityRow[]
  value: string
  onChange: (cityId: string) => void
  onCitiesChange: (cities: CityRow[]) => void
  disabled?: boolean
  label?: string
}

export function CityPicker({
  cities,
  value,
  onChange,
  onCitiesChange,
  disabled,
  label = 'City',
}: CityPickerProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const selectedCity = cities.find((c) => c.id === value)

  useEffect(() => {
    if (selectedCity) {
      setQuery(selectedCity.name)
    } else if (!value) {
      setQuery('')
    }
  }, [selectedCity?.id, selectedCity?.name, value])

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cities
    return cities.filter((c) => c.name.toLowerCase().includes(q))
  }, [cities, query])

  const canCreate = useMemo(() => {
    const q = query.trim()
    if (!q) return false
    const canonical = canonicalCityName(q).toLowerCase()
    return !cities.some(
      (c) =>
        c.name.toLowerCase() === q.toLowerCase() || c.name.toLowerCase() === canonical,
    )
  }, [cities, query])

  const handleSelect = (city: CityRow) => {
    onChange(city.id)
    setQuery(city.name)
    setOpen(false)
    setLocalError(null)
  }

  const handleCreate = async () => {
    const name = query.trim()
    if (!name || creating) return

    setCreating(true)
    setLocalError(null)

    try {
      const city = await createCity(name)
      const next = [...cities, city].sort((a, b) => a.name.localeCompare(b.name))
      onCitiesChange(next)
      handleSelect(city)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not add city')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor={`${listId}-input`}
        className="block text-[10px] uppercase tracking-[0.25em] text-slate font-semibold mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${listId}-listbox`}
          autoComplete="off"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return
            setQuery(e.target.value)
            setOpen(true)
            if (!e.target.value.trim()) onChange('')
          }}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          placeholder="Search or add city…"
          className="w-full rounded-xl border border-border bg-off-white px-4 py-3.5 text-navy placeholder:text-slate-light focus:outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20"
        />

        {open && !disabled && (
          <div
            id={`${listId}-listbox`}
            role="listbox"
            className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto hide-scrollbar rounded-xl border border-border bg-white shadow-xl shadow-navy/10 py-1"
          >
            {filtered.length === 0 && !canCreate && (
              <p className="px-4 py-3 text-sm text-slate-light">No cities match your search.</p>
            )}

            {filtered.map((city) => (
              <button
                key={city.id}
                type="button"
                role="option"
                aria-selected={city.id === value}
                onClick={() => handleSelect(city)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors',
                  city.id === value
                    ? 'bg-cyan/10 text-navy font-semibold'
                    : 'text-slate hover:bg-off-white hover:text-navy',
                )}
              >
                {city.name}
              </button>
            ))}

            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="w-full text-left px-4 py-3 text-sm font-semibold text-cyan border-t border-border hover:bg-cyan/5 disabled:opacity-60"
              >
                {creating ? 'Adding city…' : `+ Add "${query.trim()}" as new city`}
              </button>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-light">
        Search pre-seeded cities or type a new name to add it.
      </p>

      {localError && <p className="mt-2 text-xs text-red-600">{localError}</p>}
    </div>
  )
}

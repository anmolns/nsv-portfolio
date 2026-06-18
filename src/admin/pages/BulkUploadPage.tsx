import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

import { fetchAdminCities } from '../api/adminPortfolio'
import { CityPicker } from '../components/CityPicker'
import { AdminCard, AdminPageHeader } from '../components/AdminLayout'
import { useAdminAuthContext } from '../context/AdminAuthContext'
import {
  checkBulkImportServer,
  runBulkImport,
  type BulkImportCompleteEvent,
  type BulkImportItemEvent,
} from '../lib/bulkImport'
import {
  batchIsReady,
  createEmptyBatch,
  totalBatchRows,
  type BulkBatch,
} from '../lib/bulkBatches'
import {
  clearBulkUploadDraft,
  hasBulkUploadDraftContent,
  readBulkUploadDraft,
  writeBulkUploadDraft,
} from '../lib/bulkUploadDraft'
import { parseBulkFile } from '../lib/parseBulkSheet'
import type { CityRow } from '../types'
import { cn } from '../../lib/utils'

const STATUS_LABEL: Record<string, string> = {
  checking: 'Checking…',
  screenshot: 'Capturing thumbnail…',
  saving: 'Saving to database…',
  done: 'Done',
  skipped: 'Skipped',
  error: 'Failed',
}

interface LogEntry extends BulkImportItemEvent {
  batchLabel: string
  globalIndex: number
}

export function BulkUploadPage() {
  const { session } = useAdminAuthContext()
  const skipNextSave = useRef(true)

  const [cities, setCities] = useState<CityRow[]>([])
  const [batches, setBatches] = useState<BulkBatch[]>(() => {
    const draft = readBulkUploadDraft()
    if (draft?.batches.length) return draft.batches
    return [createEmptyBatch()]
  })
  const [skipExisting, setSkipExisting] = useState(
    () => readBulkUploadDraft()?.skipExisting ?? true,
  )
  const [serverReady, setServerReady] = useState<boolean | null>(null)
  const [loadingCities, setLoadingCities] = useState(true)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [parsingBatchId, setParsingBatchId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [total, setTotal] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [fatalError, setFatalError] = useState<string | null>(null)

  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    const draft = { batches, skipExisting }
    if (!hasBulkUploadDraftContent(draft)) {
      clearBulkUploadDraft()
      return
    }
    writeBulkUploadDraft(draft)
  }, [batches, skipExisting])

  useEffect(() => {
    const persist = () => {
      const draft = { batches, skipExisting }
      if (!hasBulkUploadDraftContent(draft)) return
      writeBulkUploadDraft(draft)
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist()
    }

    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [batches, skipExisting])

  useEffect(() => {
    fetchAdminCities()
      .then(setCities)
      .catch(() => setParseError('Could not load cities'))
      .finally(() => setLoadingCities(false))

    checkBulkImportServer().then(setServerReady)
  }, [])

  const readyBatches = batches.filter(batchIsReady)
  const totalRows = totalBatchRows(readyBatches)

  const updateBatch = (batchId: string, patch: Partial<BulkBatch>) => {
    setBatches((prev) => prev.map((b) => (b.id === batchId ? { ...b, ...patch } : b)))
  }

  const handleSlotFile = async (batchId: string, file: File | null) => {
    if (!file || importing) return

    setParseError(null)
    setSummary(null)
    setFatalError(null)
    setParsingBatchId(batchId)

    try {
      const rows = await parseBulkFile(file)
      updateBatch(batchId, { fileName: file.name, rows })
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not parse file')
      updateBatch(batchId, { fileName: null, rows: [] })
    } finally {
      setParsingBatchId(null)
    }
  }

  const addSheet = () => {
    if (importing) return
    setBatches((prev) => [...prev, createEmptyBatch()])
  }

  const removeBatch = (batchId: string) => {
    if (importing) return
    setBatches((prev) => {
      const next = prev.filter((b) => b.id !== batchId)
      return next.length > 0 ? next : [createEmptyBatch()]
    })
  }

  const clearBatches = () => {
    if (importing) return
    setBatches([createEmptyBatch()])
    setLog([])
    setProgress(0)
    setTotal(0)
    setSummary(null)
    setParseError(null)
    setFatalError(null)
    clearBulkUploadDraft()
  }

  const handleImport = async () => {
    if (!session?.access_token || readyBatches.length === 0 || importing) return

    setImporting(true)
    setParseError(null)
    setSummary(null)
    setFatalError(null)
    setLog([])
    setProgress(0)
    setTotal(totalRows)

    const totals: BulkImportCompleteEvent = { success: 0, failed: 0, skipped: 0, total: totalRows }
    let batchOffset = 0

    try {
      for (const batch of readyBatches) {
        const cityName = cities.find((c) => c.id === batch.cityId)?.name ?? 'Unknown'
        const batchLabel = `${batch.fileName} · ${cityName}`

        await runBulkImport(session.access_token, batch.cityId, batch.rows, skipExisting, {
          onItem: (event) => {
            const globalIndex = batchOffset + event.index
            const isFinished = event.status === 'done' || event.status === 'skipped' || event.status === 'error'

            setLog((prev) => {
              const next = [...prev]
              next[globalIndex - 1] = { ...event, batchLabel, globalIndex }
              return next
            })

            if (isFinished) {
              setProgress(globalIndex)
            }
          },
          onComplete: (result) => {
            totals.success += result.success
            totals.failed += result.failed
            totals.skipped += result.skipped
          },
          onFatal: (message) => setFatalError(message),
        })

        batchOffset += batch.rows.length
      }

      setSummary(
        `Imported ${totals.success} tour${totals.success === 1 ? '' : 's'} · ${totals.skipped} skipped · ${totals.failed} failed across ${readyBatches.length} sheet${readyBatches.length === 1 ? '' : 's'}`,
      )
      clearBulkUploadDraft()
      setBatches([createEmptyBatch()])
    } catch (err) {
      setFatalError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const pct = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0
  const filledSlots = batches.filter((b) => b.fileName).length

  return (
    <>
      <AdminPageHeader
        title="Bulk upload"
        subtitle="Add sheets one by one — pick a location for each, then import all together"
        action={
          <Link
            to="/admin/tours"
            className="text-sm font-semibold text-cyan hover:text-cyan-bright"
          >
            View portfolio →
          </Link>
        }
      />

      {serverReady === false && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Import server not running</p>
          <p className="mt-1 text-amber-800/90">
            Run <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run dev:all</code> so
            Playwright can capture thumbnails locally.
          </p>
        </div>
      )}

      {fatalError && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {fatalError}
        </p>
      )}

      {parseError && (
        <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {parseError}
        </p>
      )}

      {summary && (
        <p className="mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {summary}
        </p>
      )}

      <AdminCard className="p-6 mb-6 space-y-5">
        <p className="text-xs text-slate">
          For each sheet: choose a <strong>location</strong> (search existing or type a new one),
          then attach the CSV/Excel file. Add as many sheets as you need before starting import.
          Your work is saved automatically if you switch tabs or minimize the browser.
        </p>

        <div className="space-y-4">
          {batches.map((batch, index) => {
            const isParsing = parsingBatchId === batch.id
            const locationMissing = batch.fileName && !batch.cityId
            const fileMissing = batch.cityId && !batch.fileName

            return (
              <div
                key={batch.id}
                className={cn(
                  'rounded-xl border p-4 sm:p-5 space-y-4',
                  batchIsReady(batch)
                    ? 'border-cyan/30 bg-cyan/[0.03]'
                    : 'border-border bg-off-white/60',
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate">
                    Sheet {index + 1}
                  </p>
                  {batches.length > 1 && (
                    <button
                      type="button"
                      disabled={importing}
                      onClick={() => removeBatch(batch.id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CityPicker
                    label="Location"
                    cities={cities}
                    value={batch.cityId}
                    disabled={importing || loadingCities}
                    onChange={(cityId) => updateBatch(batch.id, { cityId })}
                    onCitiesChange={setCities}
                  />

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.25em] text-slate font-semibold mb-2">
                      Sheet file
                    </label>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      disabled={importing || isParsing}
                      onChange={(e) => void handleSlotFile(batch.id, e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-slate file:mr-3 file:rounded-full file:border-0 file:bg-cyan file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-cyan-bright disabled:opacity-50"
                    />
                    {isParsing && (
                      <p className="mt-2 text-xs text-slate">Reading file…</p>
                    )}
                    {batch.fileName && !isParsing && (
                      <p className="mt-2 text-xs text-navy font-medium">
                        {batch.fileName} · {batch.rows.length} tour
                        {batch.rows.length === 1 ? '' : 's'}
                      </p>
                    )}
                    {!batch.fileName && !isParsing && (
                      <p className="mt-2 text-xs text-slate-light">Name + Link columns</p>
                    )}
                  </div>
                </div>

                {locationMissing && (
                  <p className="text-xs text-amber-700">Select or create a location for this sheet.</p>
                )}
                {fileMissing && (
                  <p className="text-xs text-amber-700">Attach a sheet file for this location.</p>
                )}
              </div>
            )
          })}
        </div>

        <button
          type="button"
          disabled={importing || loadingCities}
          onClick={addSheet}
          className={cn(
            'w-full rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-cyan',
            'hover:border-cyan hover:bg-cyan/5 transition-colors disabled:opacity-50',
          )}
        >
          + Add another sheet
        </button>

        <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
          <input
            type="checkbox"
            checked={skipExisting}
            disabled={importing}
            onChange={(e) => setSkipExisting(e.target.checked)}
            className="rounded border-border text-cyan focus:ring-cyan"
          />
          Skip tours that already exist (same link)
        </label>

        {filledSlots > 0 && (
          <p className="text-sm text-navy font-medium">
            {readyBatches.length} of {batches.length} sheet{batches.length === 1 ? '' : 's'} ready ·{' '}
            {totalRows} tour{totalRows === 1 ? '' : 's'} total
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={
              importing ||
              readyBatches.length === 0 ||
              !session?.access_token ||
              serverReady === false
            }
            onClick={() => void handleImport()}
            className={cn(
              'rounded-full px-8 py-3 text-sm font-bold tracking-wide transition-all',
              'bg-navy text-white hover:bg-navy-light shadow-lg shadow-navy/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {importing ? `Importing… ${pct}%` : 'Start import'}
          </button>

          {filledSlots > 0 && (
            <button
              type="button"
              disabled={importing}
              onClick={clearBatches}
              className="rounded-full px-6 py-3 text-sm font-semibold text-slate border border-border hover:border-slate disabled:opacity-50"
            >
              Clear all
            </button>
          )}
        </div>
      </AdminCard>

      {(importing || log.length > 0) && (
        <AdminCard className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display text-lg font-bold text-navy">Progress</h2>
            <span className="text-sm text-slate tabular-nums">
              {progress} / {total || totalRows}
            </span>
          </div>

          <div className="h-2 rounded-full bg-off-white overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan to-cyan-bright"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          <ul className="max-h-80 overflow-y-auto space-y-2 text-sm">
            {log.filter(Boolean).map((item) => (
              <li
                key={`${item.globalIndex}-${item.id ?? item.name}`}
                className={cn(
                  'rounded-lg px-3 py-2',
                  item.status === 'done' && 'bg-emerald-50 text-emerald-800',
                  item.status === 'skipped' && 'bg-slate-50 text-slate',
                  item.status === 'error' && 'bg-red-50 text-red-700',
                  (item.status === 'screenshot' ||
                    item.status === 'saving' ||
                    item.status === 'checking') &&
                    'bg-cyan/5 text-navy',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium truncate">{item.name}</span>
                  <span className="shrink-0 text-xs">
                    {STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate mt-0.5 truncate">{item.batchLabel}</p>
                {item.message && (
                  <p className="text-[11px] mt-0.5 opacity-80">{item.message}</p>
                )}
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      {readyBatches.length > 0 && !importing && log.length === 0 && (
        <AdminCard className="overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display text-lg font-bold text-navy">Preview</h2>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {readyBatches.map((batch) => {
              const cityName = cities.find((c) => c.id === batch.cityId)?.name ?? '—'
              return (
                <div key={batch.id} className="p-4 sm:px-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate mb-2">
                    {cityName} ← {batch.fileName}
                  </p>
                  <ul className="space-y-1 text-sm">
                    {batch.rows.slice(0, 5).map((row) => (
                      <li key={row.link} className="flex gap-3 truncate">
                        <span className="font-medium text-navy shrink-0 max-w-[40%] truncate">
                          {row.name}
                        </span>
                        <span className="text-slate truncate">{row.link}</span>
                      </li>
                    ))}
                    {batch.rows.length > 5 && (
                      <li className="text-xs text-slate pt-1">+ {batch.rows.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )
            })}
          </div>
        </AdminCard>
      )}
    </>
  )
}

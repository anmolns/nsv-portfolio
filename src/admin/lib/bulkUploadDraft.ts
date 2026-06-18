import type { BulkBatch } from './bulkBatches'
import type { BulkRow } from './parseBulkSheet'

const DRAFT_KEY = 'admin-bulk-upload:draft'

export interface BulkUploadDraft {
  batches: BulkBatch[]
  skipExisting: boolean
}

function isBulkRow(value: unknown): value is BulkRow {
  if (!value || typeof value !== 'object') return false
  const row = value as BulkRow
  return typeof row.name === 'string' && typeof row.link === 'string'
}

function isBulkBatch(value: unknown): value is BulkBatch {
  if (!value || typeof value !== 'object') return false
  const batch = value as BulkBatch
  return (
    typeof batch.id === 'string' &&
    (batch.fileName === null || typeof batch.fileName === 'string') &&
    typeof batch.cityId === 'string' &&
    Array.isArray(batch.rows) &&
    batch.rows.every(isBulkRow)
  )
}

export function readBulkUploadDraft(): BulkUploadDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<BulkUploadDraft>
    if (!parsed || !Array.isArray(parsed.batches) || !parsed.batches.every(isBulkBatch)) {
      return null
    }

    return {
      batches: parsed.batches,
      skipExisting: parsed.skipExisting ?? true,
    }
  } catch {
    return null
  }
}

export function writeBulkUploadDraft(draft: BulkUploadDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // ignore quota / private mode
  }
}

export function clearBulkUploadDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}

export function hasBulkUploadDraftContent(draft: BulkUploadDraft): boolean {
  return draft.batches.some(
    (b) => Boolean(b.cityId || b.fileName || b.rows.length > 0),
  )
}

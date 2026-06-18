import type { BulkRow } from './parseBulkSheet'

export interface BulkBatch {
  id: string
  fileName: string | null
  cityId: string
  rows: BulkRow[]
}

export function createEmptyBatch(): BulkBatch {
  return {
    id: crypto.randomUUID(),
    fileName: null,
    cityId: '',
    rows: [],
  }
}

export function totalBatchRows(batches: BulkBatch[]): number {
  return batches.reduce((sum, b) => sum + b.rows.length, 0)
}

export function batchIsReady(batch: BulkBatch): boolean {
  return Boolean(batch.cityId && batch.fileName && batch.rows.length > 0)
}

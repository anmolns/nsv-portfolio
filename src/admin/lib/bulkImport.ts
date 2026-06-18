import type { BulkRow } from './parseBulkSheet'

export type BulkItemStatus =
  | 'checking'
  | 'screenshot'
  | 'saving'
  | 'done'
  | 'skipped'
  | 'error'

export interface BulkImportItemEvent {
  index: number
  total: number
  name: string
  status: BulkItemStatus
  message?: string
  id?: string
}

export interface BulkImportCompleteEvent {
  success: number
  failed: number
  skipped: number
  total: number
}

export interface ImportHealth {
  configured: boolean
  runtime?: string
}

type BulkImportHandler = {
  onStart?: (total: number) => void
  onItem?: (event: BulkImportItemEvent) => void
  onComplete?: (event: BulkImportCompleteEvent) => void
}

interface ImportTourResponse {
  status: 'done' | 'skipped' | 'error'
  id?: string
  name: string
  message?: string
}

export async function checkBulkImportServer(): Promise<ImportHealth> {
  try {
    const res = await fetch('/api/bulk-import/health')
    if (!res.ok) return { configured: false }
    const data = (await res.json()) as { configured?: boolean; runtime?: string }
    return { configured: Boolean(data.configured), runtime: data.runtime }
  } catch {
    return { configured: false }
  }
}

async function importTourItem(
  accessToken: string,
  cityId: string,
  row: BulkRow,
  skipExisting: boolean,
): Promise<ImportTourResponse> {
  const res = await fetch('/api/import-tour', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      cityId,
      name: row.name,
      link: row.link,
      skipExisting,
    }),
  })

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(err?.error ?? `Import failed (${res.status})`)
  }

  return (await res.json()) as ImportTourResponse
}

/** Import rows one-by-one — works on Vercel and local dev. */
export async function runBulkImport(
  accessToken: string,
  cityId: string,
  rows: BulkRow[],
  skipExisting: boolean,
  handlers: BulkImportHandler,
): Promise<BulkImportCompleteEvent> {
  const total = rows.length
  handlers.onStart?.(total)

  const result: BulkImportCompleteEvent = { success: 0, failed: 0, skipped: 0, total }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const index = i + 1

    handlers.onItem?.({
      index,
      total,
      name: row.name,
      status: 'checking',
    })

    handlers.onItem?.({
      index,
      total,
      name: row.name,
      status: 'screenshot',
    })

    const item = await importTourItem(accessToken, cityId, row, skipExisting)

    if (item.status === 'done') {
      result.success++
      handlers.onItem?.({
        index,
        total,
        name: item.name,
        status: 'done',
        id: item.id,
      })
    } else if (item.status === 'skipped') {
      result.skipped++
      handlers.onItem?.({
        index,
        total,
        name: item.name,
        status: 'skipped',
        message: item.message,
        id: item.id,
      })
    } else {
      result.failed++
      handlers.onItem?.({
        index,
        total,
        name: item.name,
        status: 'error',
        message: item.message,
        id: item.id,
      })
    }
  }

  handlers.onComplete?.(result)
  return result
}

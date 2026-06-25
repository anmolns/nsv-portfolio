import { isYoutubeLink } from '../../lib/portfolioLink'

export interface BulkRow {
  name: string
  link: string
  category?: string | null
}

export type BulkSheetKind = 'tour' | 'video'

function parseCsvLine(line: string): string[] {
  const cols: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      cols.push(cur.trim())
      cur = ''
    } else {
      cur += ch
    }
  }
  cols.push(cur.trim())
  return cols
}

function normalizeLink(raw: string): string | null {
  const trimmed = raw.trim().replace(/^"|"$/g, '')
  if (!trimmed.startsWith('http')) return null
  try {
    const u = new URL(trimmed)
    return u.toString().replace(/\/$/, '') + '/'
  } catch {
    return null
  }
}

function nameFromLink(link: string): string {
  const path = new URL(link).pathname.replace(/^\/|\/$/g, '')
  return path
    .replace(/[-_]?nsv$/i, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function resolveColumns(headers: string[]) {
  const lower = headers.map((h) => h.trim().toLowerCase())

  const hasHeader =
    lower.includes('link') ||
    lower.includes('name') ||
    lower.includes('url') ||
    lower.includes('title') ||
    lower.some((h) => h.includes('youtube')) ||
    lower.some((h) => h.includes('category') || h.includes('catgor'))

  let nameIdx = lower.indexOf('name')
  if (nameIdx === -1) nameIdx = lower.indexOf('title')

  let linkIdx = lower.indexOf('link')
  if (linkIdx === -1) linkIdx = lower.indexOf('url')
  if (linkIdx === -1) linkIdx = lower.findIndex((h) => h.includes('youtube'))

  const categoryIdx = lower.findIndex(
    (h) => h.includes('category') || h.includes('catgor'),
  )

  return { hasHeader, nameIdx, linkIdx, categoryIdx }
}

function rowsFromTable(
  dataRows: string[][],
  nameIdx: number,
  linkIdx: number,
  kind: BulkSheetKind,
  categoryIdx = -1,
): BulkRow[] {
  if (linkIdx === -1) {
    throw new Error(
      kind === 'video'
        ? 'Sheet must have a "Youtube Link" (or Link) column.'
        : 'Sheet must have a "Link" column (or Name in A, Link in B with no header).',
    )
  }

  const rows: BulkRow[] = []
  for (const cols of dataRows) {
    const link = normalizeLink(cols[linkIdx] ?? '')
    if (!link) continue
    if (kind === 'video' && !isYoutubeLink(link)) continue

    const nameRaw = nameIdx >= 0 ? (cols[nameIdx] ?? '').replace(/^"|"$/g, '').trim() : ''
    const categoryRaw =
      categoryIdx >= 0 ? (cols[categoryIdx] ?? '').replace(/^"|"$/g, '').trim() : ''

    rows.push({
      name: nameRaw || nameFromLink(link),
      link,
      category: categoryRaw || null,
    })
  }

  if (rows.length === 0) {
    throw new Error(
      kind === 'video'
        ? 'No valid YouTube links found in the file.'
        : 'No valid tour links found in the file.',
    )
  }

  return rows
}

export function parseBulkCsv(text: string, kind: BulkSheetKind = 'tour'): BulkRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  const firstCols = parseCsvLine(lines[0])
  const { hasHeader, nameIdx, linkIdx, categoryIdx } = resolveColumns(firstCols)
  const dataLines = hasHeader ? lines.slice(1) : lines

  let resolvedNameIdx = nameIdx
  let resolvedLinkIdx = linkIdx
  let resolvedCategoryIdx = categoryIdx

  if (!hasHeader) {
    if (kind === 'video') {
      resolvedCategoryIdx = 0
      resolvedNameIdx = 1
      resolvedLinkIdx = 2
    } else {
      resolvedNameIdx = 0
      resolvedLinkIdx = 1
      resolvedCategoryIdx = -1
    }
  }

  const dataRows = dataLines.map((line) => parseCsvLine(line))
  return rowsFromTable(
    dataRows,
    resolvedNameIdx,
    resolvedLinkIdx,
    kind,
    resolvedCategoryIdx,
  )
}

export async function parseBulkFile(file: File, kind: BulkSheetKind = 'tour'): Promise<BulkRow[]> {
  const lower = file.name.toLowerCase()

  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) throw new Error('Excel file has no sheets')

    const sheet = workbook.Sheets[sheetName]
    const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' }) as string[][]

    if (matrix.length === 0) throw new Error('Sheet is empty')

    const headerRow = matrix[0].map((c) => String(c))
    const { hasHeader, nameIdx, linkIdx, categoryIdx } = resolveColumns(headerRow)
    const dataRows = hasHeader ? matrix.slice(1) : matrix

    let resolvedNameIdx = nameIdx
    let resolvedLinkIdx = linkIdx
    let resolvedCategoryIdx = categoryIdx

    if (!hasHeader) {
      if (kind === 'video') {
        resolvedCategoryIdx = 0
        resolvedNameIdx = 1
        resolvedLinkIdx = 2
      } else {
        resolvedNameIdx = 0
        resolvedLinkIdx = 1
        resolvedCategoryIdx = -1
      }
    }

    return rowsFromTable(
      dataRows.map((row) => row.map((c) => String(c))),
      resolvedNameIdx,
      resolvedLinkIdx,
      kind,
      resolvedCategoryIdx,
    )
  }

  return parseBulkCsv(await file.text(), kind)
}

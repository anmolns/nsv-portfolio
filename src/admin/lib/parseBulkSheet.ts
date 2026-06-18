export interface BulkRow {
  name: string
  link: string
}

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

export function parseBulkCsv(text: string): BulkRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  const firstCols = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const hasHeader =
    firstCols.includes('link') || firstCols.includes('name') || firstCols.includes('url')

  let nameIdx = firstCols.indexOf('name')
  let linkIdx = firstCols.indexOf('link')
  if (linkIdx === -1) linkIdx = firstCols.indexOf('url')

  const dataLines = hasHeader ? lines.slice(1) : lines

  if (!hasHeader) {
    nameIdx = 0
    linkIdx = 1
  }

  if (linkIdx === -1) {
    throw new Error('Sheet must have a "Link" column (or Name in A, Link in B with no header).')
  }

  const rows: BulkRow[] = []
  for (const line of dataLines) {
    const cols = parseCsvLine(line)
    const link = normalizeLink(cols[linkIdx] ?? '')
    if (!link) continue

    const nameRaw = nameIdx >= 0 ? (cols[nameIdx] ?? '').replace(/^"|"$/g, '').trim() : ''
    rows.push({
      name: nameRaw || nameFromLink(link),
      link,
    })
  }

  if (rows.length === 0) {
    throw new Error('No valid tour links found in the file.')
  }

  return rows
}

export async function parseBulkFile(file: File): Promise<BulkRow[]> {
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

    const headerRow = matrix[0].map((c) => String(c).trim().toLowerCase())
    const hasHeader =
      headerRow.includes('link') || headerRow.includes('name') || headerRow.includes('url')

    let nameIdx = headerRow.indexOf('name')
    let linkIdx = headerRow.indexOf('link')
    if (linkIdx === -1) linkIdx = headerRow.indexOf('url')

    const dataRows = hasHeader ? matrix.slice(1) : matrix

    if (!hasHeader) {
      nameIdx = 0
      linkIdx = 1
    }

    if (linkIdx === -1) {
      throw new Error('Sheet must have Name (column A) and Link (column B).')
    }

    const rows: BulkRow[] = []
    for (const row of dataRows) {
      const link = normalizeLink(String(row[linkIdx] ?? ''))
      if (!link) continue
      const nameRaw = nameIdx >= 0 ? String(row[nameIdx] ?? '').trim() : ''
      rows.push({ name: nameRaw || nameFromLink(link), link })
    }

    if (rows.length === 0) throw new Error('No valid tour links found in the sheet.')
    return rows
  }

  return parseBulkCsv(await file.text())
}

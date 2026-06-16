import { useEffect, useState } from 'react'

const QUERIES = [
  { minWidth: 1280, columns: 6 },
  { minWidth: 1024, columns: 5 },
  { minWidth: 768, columns: 4 },
  { minWidth: 640, columns: 3 },
  { minWidth: 0, columns: 2 },
] as const

export function useGridColumns() {
  const [columns, setColumns] = useState(2)

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      const match = QUERIES.find((q) => width >= q.minWidth)
      setColumns(match?.columns ?? 2)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return columns
}

'use client'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

const PAGE_SIZE = 10

export function ResultsTable({ data }: { data: Record<string, unknown>[] }) {
  const [page, setPage]       = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  if (!data.length) return null
  const columns = Object.keys(data[0])

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const cmp = String(a[sortKey]) < String(b[sortKey]) ? -1 : 1
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border-base)]">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="bg-[var(--color-surface-2)]">
              {columns.map(col => (
                <th key={col} onClick={() => toggleSort(col)}
                  className="px-3 py-2 text-left text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)] cursor-pointer hover:text-[var(--color-ink-1)] whitespace-nowrap select-none border-b border-[var(--color-border-strong)] transition-colors">
                  <div className="flex items-center gap-1">
                    {col}
                    {sortKey === col
                      ? sortDir === 'asc' ? <ChevronUp size={9}/> : <ChevronDown size={9}/>
                      : <ChevronUp size={9} className="opacity-20"/>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i}
                className="border-t border-[var(--color-border-soft)] hover:bg-[var(--color-surface-2)] transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-3 py-2 font-mono text-[var(--color-ink-1)] whitespace-nowrap">
                    {renderCell(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--color-ink-3)]">
          <span>page {page + 1} / {totalPages}</span>
          <div className="flex gap-1">
            {(['prev', 'next'] as const).map(dir => (
              <button key={dir}
                onClick={() => setPage(p => dir === 'prev' ? Math.max(0, p - 1) : Math.min(totalPages - 1, p + 1))}
                disabled={(dir === 'prev' && page === 0) || (dir === 'next' && page >= totalPages - 1)}
                className="px-2 py-1 rounded-md bg-[var(--color-surface-3)] border border-[var(--color-border-base)] hover:border-[var(--color-border-strong)] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                {dir}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function renderCell(v: unknown) {
  if (v == null) return <span className="opacity-30">—</span>
  if (typeof v === 'boolean') return (
    <span className={v ? 'text-[var(--color-ok)]' : 'text-[var(--color-bad)]'}>{String(v)}</span>
  )
  return String(v)
}
'use client'
import { useQueryStore } from '@/app/store/queryStore'
import { RotateCcw }     from 'lucide-react'

export function QueryHistory() {
  const { history, loadFromHistory } = useQueryStore()

  return (
    <div className="flex flex-col h-full">

      {/* Header strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-base)] shrink-0">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
          History
        </span>
        <span className="text-[10px] font-mono text-[var(--color-ink-3)] bg-[var(--color-surface-3)] px-2 py-0.5 rounded-full border border-[var(--color-border-base)]">
          {history.length}/20
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-28 gap-2">
            <span className="text-2xl opacity-10">◎</span>
            <p className="text-[10px] font-mono text-[var(--color-ink-3)] text-center">
              run a query to see history
            </p>
          </div>
        ) : (
          history.map((entry, i) => (
            <button
              key={entry.id}
              onClick={() => loadFromHistory(entry.id)}
              className="w-full text-left px-4 py-3 border-b border-[var(--color-border-soft)] hover:bg-[var(--color-surface-2)] transition-colors group animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] text-[var(--color-ink-1)] line-clamp-2 flex-1 leading-snug">
                  {entry.label}
                </span>
                <RotateCcw
                  size={9}
                  className="text-[var(--color-ink-3)] group-hover:text-[var(--color-accent)] transition-colors mt-0.5 shrink-0"
                />
              </div>
              <span className="text-[9px] font-mono text-[var(--color-ink-3)] mt-1 block">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

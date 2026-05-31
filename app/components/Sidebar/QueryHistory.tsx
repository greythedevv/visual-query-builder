'use client'
import { useQueryStore } from '@/app/store/queryStore'
import { History, RotateCcw } from 'lucide-react'

export function QueryHistory() {
  const { history, loadFromHistory } = useQueryStore()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <History size={14} className="text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Query History</span>
        <span className="ml-auto text-xs text-zinc-400">{history.length}/20</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-zinc-400">
            No history yet — run a query to start
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {history.map(entry => (
              <li key={entry.id}>
                <button
                  onClick={() => loadFromHistory(entry.id)}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-2 flex-1">
                      {entry.label}
                    </span>
                    <RotateCcw
                      size={11}
                      className="text-zinc-300 group-hover:text-violet-500 transition-colors mt-0.5 shrink-0"
                    />
                  </div>
                  <span className="text-xs text-zinc-400 mt-1 block">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
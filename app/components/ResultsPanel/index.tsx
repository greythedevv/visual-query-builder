'use client'
import { ResultsTable } from './ResultsTable'
import { Play, Loader2, SearchX, Clock } from 'lucide-react'

interface Props {
  results: Record<string, unknown>[]
  isExecuting: boolean
  executionTime: number | null
  hasExecuted: boolean
  hasErrors: boolean
  hasSchema: boolean
  onExecute: () => void
}

export function ResultsPanel({
  results, isExecuting, executionTime,
  hasExecuted, hasErrors, hasSchema, onExecute,
}: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Results</span>
          {hasExecuted && !isExecuting && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
              {results.length} row{results.length !== 1 ? 's' : ''}
            </span>
          )}
          {executionTime !== null && (
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock size={10} />
              {executionTime}ms
            </span>
          )}
        </div>

        <button
          onClick={onExecute}
          disabled={isExecuting || hasErrors || !hasSchema}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            hasErrors || !hasSchema
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md active:scale-95'
          }`}
          aria-label="Execute query (Ctrl+Enter)"
        >
          {isExecuting
            ? <Loader2 size={14} className="animate-spin" />
            : <Play size={14} />
          }
          {isExecuting ? 'Running...' : 'Run Query'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!hasSchema && (
          <div className="flex flex-col items-center justify-center h-32 text-sm text-zinc-400">
            Select a data source to run queries
          </div>
        )}

        {hasSchema && !hasExecuted && !isExecuting && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-zinc-400">
              Click <span className="font-medium text-violet-500">Run Query</span> or press{' '}
              <kbd className="px-1.5 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 font-mono">Ctrl+Enter</kbd>
            </p>
          </div>
        )}

        {isExecuting && (
          <div className="flex items-center justify-center h-32 gap-2 text-sm text-zinc-400">
            <Loader2 size={16} className="animate-spin" />
            Executing query...
          </div>
        )}

        {hasExecuted && !isExecuting && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
            <SearchX size={24} className="text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">No records match your query</p>
          </div>
        )}

        {hasExecuted && !isExecuting && results.length > 0 && (
          <ResultsTable data={results} />
        )}
      </div>
    </div>
  )
}
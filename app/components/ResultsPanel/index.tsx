'use client'
import { ResultsTable } from './ResultsTable'
import { Play, Loader2, SearchX, Clock, Zap } from 'lucide-react'

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
  const canRun = !isExecuting && !hasErrors && hasSchema

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-1)]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border-base)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
            Results
          </span>
          {hasExecuted && !isExecuting && (
            <span className={[
              'text-[10px] font-mono px-2 py-0.5 rounded-full border',
              results.length > 0
                ? 'bg-emerald-500/10 text-[var(--color-ok)] border-emerald-500/20'
                : 'bg-[var(--color-surface-3)] text-[var(--color-ink-3)] border-[var(--color-border-base)]',
            ].join(' ')}>
              {results.length} row{results.length !== 1 ? 's' : ''}
            </span>
          )}
          {executionTime !== null && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-ink-3)]">
              <Clock size={9} />
              {executionTime}ms
            </span>
          )}
        </div>

        <button
          onClick={onExecute}
          disabled={!canRun}
          className={[
            'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all',
            canRun
              ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-sm'
              : 'bg-[var(--color-surface-3)] text-[var(--color-ink-3)] cursor-not-allowed opacity-60',
          ].join(' ')}
        >
          {isExecuting
            ? <Loader2 size={11} className="animate-spin" />
            : <Play size={11} />}
          {isExecuting ? 'Running…' : 'Run Query'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5">
        {!hasSchema && <Empty text="Select a data source to run queries" />}
        {hasSchema && !hasExecuted && !isExecuting && (
          <Empty
            icon={<Zap size={18} className="opacity-20" />}
            text={
              <>
                press{' '}
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--color-surface-3)] border border-[var(--color-border-strong)]">
                  Ctrl+Enter
                </kbd>
                {' '}to run
              </>
            }
          />
        )}
        {isExecuting && (
          <Empty icon={<Loader2 size={18} className="animate-spin opacity-30" />} text="Executing query…" />
        )}
        {hasExecuted && !isExecuting && results.length === 0 && (
          <Empty icon={<SearchX size={18} className="opacity-25" />} text="No records match your query" />
        )}
        {hasExecuted && !isExecuting && results.length > 0 && (
          <ResultsTable data={results} />
        )}
      </div>
    </div>
  )
}

function Empty({ icon, text }: { icon?: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-32 gap-2.5 text-center">
      {icon && <div className="text-[var(--color-ink-3)]">{icon}</div>}
      <p className="text-[11px] font-mono text-[var(--color-ink-3)]">{text}</p>
    </div>
  )
}

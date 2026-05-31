'use client'
import { useState, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import { QueryBuilder } from '@/app/components/QueryBuilder'
import { QueryPreview } from '@/app/components/QueryPreview'
import { ResultsPanel } from '@/app/components/ResultsPanel'
import { QueryHistory } from '@/app/components/Sidebar/QueryHistory'
import { SavedPresets } from '@/app/components/Sidebar/SavedPresets'
import { useQueryBuilder } from '@/app/hooks/useQueryBuilder'
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts'
import { useQueryStore } from '@/app/store/queryStore'
import {
  Sun, Moon, Download, Upload, RotateCcw,
  History, Bookmark, ChevronLeft, ChevronRight,
} from 'lucide-react'

type SidebarTab = 'history' | 'presets'

export default function Home() {
  const { theme, setTheme } = useTheme()
  const { schema, reset } = useQueryStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('history')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    sql, mongo, errors,
    results, isExecuting, executionTime, hasExecuted,
    importError,
    execute, exportQuery, importQuery,
  } = useQueryBuilder()

  const toggleHistory = useCallback(() => {
    setSidebarTab('history')
    setSidebarOpen(o => !o)
  }, [])

  useKeyboardShortcuts({
    onExecute: execute,
    onExport:  exportQuery,
    onReset:   reset,
    onToggleHistory: toggleHistory,
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Top nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">
            Visual Query Builder
          </span>
          {schema && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
              {schema.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Keyboard shortcut hint */}
          <span className="text-xs text-zinc-400 hidden md:block">
            <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs">Ctrl+Enter</kbd> to run
          </span>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />

          {/* Reset */}
          <button
            onClick={reset}
            title="Reset query (Ctrl+R)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          {/* Export */}
          <button
            onClick={exportQuery}
            title="Export query JSON (Ctrl+Shift+E)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download size={15} />
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import query JSON"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Upload size={15} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) importQuery(file)
              e.target.value = ''
            }}
          />

          {/* Theme */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle dark mode"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {importError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs border-b border-red-200 dark:border-red-800">
          Import error: {importError}
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <aside className={`flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-64' : 'w-10'}`}>
          {sidebarOpen ? (
            <>
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setSidebarTab('history')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    sidebarTab === 'history'
                      ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <History size={12} /> History
                </button>
                <button
                  onClick={() => setSidebarTab('presets')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    sidebarTab === 'presets'
                      ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  <Bookmark size={12} /> Presets
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="px-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {sidebarTab === 'history' ? <QueryHistory /> : <SavedPresets />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-3 gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => { setSidebarTab('history'); setSidebarOpen(true) }}
                className="text-zinc-400 hover:text-violet-500 transition-colors"
                title="Query history"
              >
                <History size={15} />
              </button>
              <button
                onClick={() => { setSidebarTab('presets'); setSidebarOpen(true) }}
                className="text-zinc-400 hover:text-violet-500 transition-colors"
                title="Saved presets"
              >
                <Bookmark size={15} />
              </button>
            </div>
          )}
        </aside>

        {/* Query builder (center) */}
        <main className="flex-1 overflow-hidden flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <QueryBuilder errors={errors} />
        </main>

        {/* Right panel: preview + results stacked */}
        <aside className="w-[420px] shrink-0 flex flex-col overflow-hidden">
          {/* Preview (top half) */}
          <div className="flex-1 overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Query Preview
              </span>
            </div>
            <div className="h-[calc(100%-40px)] overflow-hidden">
              <QueryPreview sql={sql} mongo={mongo} />
            </div>
          </div>

          {/* Results (bottom half) */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-zinc-900">
            <ResultsPanel
              results={results}
              isExecuting={isExecuting}
              executionTime={executionTime}
              hasExecuted={hasExecuted}
              hasErrors={errors.length > 0}
              hasSchema={!!schema}
              onExecute={execute}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
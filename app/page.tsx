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
  History, Bookmark, X, Menu,
} from 'lucide-react'

type SidebarTab = 'history' | 'presets'
type MobileTab  = 'builder' | 'preview' | 'results'

export default function Home() {
  const { theme, setTheme }             = useTheme()
  const { schema, reset }               = useQueryStore()
  const [sidebarTab, setSidebarTab]     = useState<SidebarTab>('history')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [mobileTab, setMobileTab]       = useState<MobileTab>('builder')
  const fileInputRef                    = useRef<HTMLInputElement>(null)

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
    onExecute:       execute,
    onExport:        exportQuery,
    onReset:         reset,
    onToggleHistory: toggleHistory,
  })

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">

      {/* ── Top Nav ── */}
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 hidden sm:block">
            Visual Query Builder
          </span>
          <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 sm:hidden">
            VQB
          </span>
          {schema && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
              {schema.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-zinc-400 hidden lg:block mr-2">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-zinc-600 dark:text-zinc-400">
              Ctrl+Enter
            </kbd>{' '}to run
          </span>

          <button
            onClick={reset}
            title="Reset (Ctrl+R)"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={exportQuery}
            title="Export JSON"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download size={15} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            title="Menu"
            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
          >
            <Menu size={15} />
          </button>
        </div>
      </header>

      {/* Import error */}
      {importError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs border-b border-red-200 dark:border-red-800 shrink-0">
          Import error: {importError}
        </div>
      )}

      {/* ── Mobile Tab Bar ── */}
      <div className="flex lg:hidden shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {(['builder', 'preview', 'results'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize border-b-2 transition-colors ${
              mobileTab === tab
                ? 'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside className={`
          fixed top-0 left-0 h-full w-72 z-40 flex flex-col
          bg-white dark:bg-zinc-900
          border-r border-zinc-200 dark:border-zinc-800
          transition-transform duration-300 ease-in-out
          lg:relative lg:w-56 lg:shrink-0 lg:z-auto lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            {(['history', 'presets'] as SidebarTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  sidebarTab === tab
                    ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {tab === 'history' ? <History size={12} /> : <Bookmark size={12} />}
                {tab}
              </button>
            ))}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'history' ? <QueryHistory /> : <SavedPresets />}
          </div>
        </aside>

        {/* ── Desktop: 3 panels ── */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <QueryBuilder errors={errors} />
          </main>

          <aside className="w-[400px] shrink-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
              <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Query Preview
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <QueryPreview sql={sql} mongo={mongo} />
              </div>
            </div>
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

        {/* ── Mobile: one tab at a time ── */}
        <div className="flex lg:hidden flex-1 overflow-hidden">
          {mobileTab === 'builder' && (
            <main className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-zinc-900">
              <QueryBuilder errors={errors} />
            </main>
          )}
          {mobileTab === 'preview' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-zinc-900">
              <div className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Query Preview
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <QueryPreview sql={sql} mongo={mongo} />
              </div>
            </div>
          )}
          {mobileTab === 'results' && (
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
          )}
        </div>

      </div>
    </div>
  )
}
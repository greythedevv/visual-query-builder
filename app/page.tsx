'use client'
import { useState, useCallback, useRef } from 'react'
import { useTheme } from 'next-themes'
import { QueryBuilder }         from '@/app/components/QueryBuilder'
import { QueryPreview }         from '@/app/components/QueryPreview'
import { ResultsPanel }         from '@/app/components/ResultsPanel'
import { QueryHistory }         from '@/app/components/Sidebar/QueryHistory'
import { SavedPresets }         from '@/app/components/Sidebar/SavedPresets'
import { useQueryBuilder }      from '@/app/hooks/useQueryBuilder'
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts'
import { useQueryStore }        from '@/app/store/queryStore'
import { Sun, Moon, Download, Upload, RotateCcw, History, Bookmark, X, Play, Menu } from 'lucide-react'

type SidebarTab = 'history' | 'presets'
type MobileTab  = 'builder' | 'preview' | 'results'

export default function Home() {
  const { theme, setTheme }           = useTheme()
  const { schema, reset }             = useQueryStore()
  const [sidebarTab, setSidebarTab]   = useState<SidebarTab>('history')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileTab, setMobileTab]     = useState<MobileTab>('builder')
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  const {
    sql, mongo, errors,
    results, isExecuting, executionTime, hasExecuted,
    importError, execute, exportQuery, importQuery,
  } = useQueryBuilder()

  const toggleHistory = useCallback(() => {
    setSidebarTab('history')
    setSidebarOpen(o => !o)
  }, [])

  useKeyboardShortcuts({ onExecute: execute, onExport: exportQuery, onReset: reset, onToggleHistory: toggleHistory })

  const canRun = !isExecuting && errors.length === 0 && !!schema

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-surface-0)]">

      {/* ── Nav ── */}
      <header className="flex items-center justify-between px-4 h-14 shrink-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border-base)] z-20">

        {/* Left: logo + name */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.5" fill="white" fillOpacity=".95"/>
              <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.5" fill="white" fillOpacity=".55"/>
              <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.5" fill="white" fillOpacity=".55"/>
              <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.5" fill="white" fillOpacity=".25"/>
            </svg>
          </div>
          {/* Desktop: full name. Mobile: "QF" abbreviation */}
          <span className="hidden sm:block font-semibold text-sm tracking-tight text-[var(--color-ink-1)]">
            QueryForge
          </span>
          <span className="sm:hidden font-semibold text-sm tracking-tight text-[var(--color-ink-1)]">
            QF
          </span>
          {/* Schema badge — desktop only */}
          {schema && (
            <span className="sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-ring)]">
              {schema.name}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono text-[var(--color-ink-3)] mr-2 hidden xl:block">
            ctrl+enter to run
          </span>

          {/* Hide reset/export/import on mobile to save space */}
          <NavIconBtn onClick={reset} title="Reset (Ctrl+R)" className="hidden sm:flex">
            <RotateCcw size={14} />
          </NavIconBtn>
          <NavIconBtn onClick={exportQuery} title="Export JSON" className="hidden sm:flex">
            <Download size={14} />
          </NavIconBtn>
          <NavIconBtn onClick={() => fileInputRef.current?.click()} title="Import JSON" className="hidden sm:flex">
            <Upload size={14} />
          </NavIconBtn>
          <input
            ref={fileInputRef} type="file" accept=".json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) importQuery(f); e.target.value = '' }}
          />

          <div className="hidden sm:block w-px h-5 bg-[var(--color-border-strong)] mx-1" />

          <button
            onClick={execute}
            disabled={!canRun}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
              canRun
                ? 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white'
                : 'bg-[var(--color-surface-3)] text-[var(--color-ink-3)] cursor-not-allowed',
            ].join(' ')}
          >
            <Play size={11} />
            <span className="hidden sm:inline">Run</span>
          </button>

          <NavIconBtn onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </NavIconBtn>

          {/* Mobile sidebar toggle — uses Menu icon, not History */}
          <NavIconBtn
            onClick={() => setSidebarOpen(o => !o)}
            title="Open sidebar"
            className="lg:hidden"
          >
            <Menu size={14} />
          </NavIconBtn>
        </div>
      </header>

      {importError && (
        <div className="px-4 py-2 text-xs font-mono bg-red-950/30 text-[var(--color-bad)] border-b border-red-900/30 shrink-0">
          Import error: {importError}
        </div>
      )}

      {/* Mobile tab bar */}
      <div className="flex lg:hidden shrink-0 bg-[var(--color-surface-1)] border-b border-[var(--color-border-base)]">
        {(['builder', 'preview', 'results'] as MobileTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={[
              'flex-1 py-2.5 text-[10px] font-semibold tracking-widest uppercase transition-colors border-b-2',
              mobileTab === tab
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)]',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={[
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'w-56 shrink-0',
          'border-r border-[var(--color-border-base)]',
          'bg-[var(--color-surface-1)]',
          'transition-transform duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}>

          {/* Sidebar tab switcher */}
          <div className="flex items-center gap-1.5 px-3 py-3 border-b border-[var(--color-border-base)] shrink-0">
            <button
              onClick={() => setSidebarTab('history')}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all',
                sidebarTab === 'history'
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-ring)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)]',
              ].join(' ')}
            >
              <History size={11} />
              History
            </button>
            <button
              onClick={() => setSidebarTab('presets')}
              className={[
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all',
                sidebarTab === 'presets'
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-ring)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)]',
              ].join(' ')}
            >
              <Bookmark size={11} />
              Presets
            </button>
            {/* Close — mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-md text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)] transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {sidebarTab === 'history' ? <QueryHistory /> : <SavedPresets />}
          </div>
        </aside>

        {/* ── Desktop 3-panel ── */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-hidden flex flex-col border-r border-[var(--color-border-base)] bg-[var(--color-surface-1)]">
            <QueryBuilder errors={errors} />
          </main>
          <aside className="w-[420px] shrink-0 flex flex-col overflow-hidden bg-[var(--color-surface-0)]">
            <div className="flex-1 overflow-hidden border-b border-[var(--color-border-base)] flex flex-col">
              <PanelLabel>Query preview</PanelLabel>
              <div className="flex-1 overflow-hidden">
                <QueryPreview sql={sql} mongo={mongo} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
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

        {/* ── Mobile single panel ── */}
        <div className="flex lg:hidden flex-1 overflow-hidden">
          {mobileTab === 'builder' && (
            <main className="flex-1 overflow-hidden flex flex-col bg-[var(--color-surface-1)]">
              <QueryBuilder errors={errors} />
            </main>
          )}
          {mobileTab === 'preview' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-[var(--color-surface-1)]">
              <PanelLabel>Query preview</PanelLabel>
              <div className="flex-1 overflow-hidden">
                <QueryPreview sql={sql} mongo={mongo} />
              </div>
            </div>
          )}
          {mobileTab === 'results' && (
            <div className="flex-1 overflow-hidden bg-[var(--color-surface-1)]">
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

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-3 border-b border-[var(--color-border-base)] shrink-0">
      <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
        {children}
      </span>
    </div>
  )
}

function NavIconBtn({
  onClick, title, children, className = '',
}: {
  onClick?: () => void
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-lg',
        'text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)]',
        'hover:bg-[var(--color-surface-3)] transition-all',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}

'use client'
import { useState }        from 'react'
import { SyntaxHighlight } from './SyntaxHighlight'
import { useQueryStore }   from '@/app/store/queryStore'
import { Copy, Check }     from 'lucide-react'

type Tab = 'sql' | 'mongo' | 'json'

const TABS: { id: Tab; label: string; icon: string; filename: string }[] = [
  { id: 'sql',   label: 'SQL',       icon: '⌗',  filename: 'query.sql'  },
  { id: 'mongo', label: 'MongoDB',   icon: '◈',  filename: 'filter.js'  },
  { id: 'json',  label: 'JSON Tree', icon: '{}', filename: 'tree.json'  },
]

export function QueryPreview({ sql, mongo }: { sql: string; mongo: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('sql')
  const [copied, setCopied]       = useState(false)
  const { rootGroup }             = useQueryStore()

  const jsonContent = JSON.stringify(rootGroup, null, 2)
  const content     = activeTab === 'sql' ? sql : activeTab === 'mongo' ? mongo : jsonContent
  const lang        = activeTab === 'sql' ? 'sql' : 'json'
  const activeFile  = TABS.find(t => t.id === activeTab)!.filename
  const isEmpty     = !sql && !mongo

  async function copy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-0)]">

      {/* Tab bar */}
      <div className="flex items-stretch border-b border-[var(--color-border-base)] bg-[var(--color-surface-2)] shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'relative flex items-center gap-2 px-4 py-2.5 text-[11px] font-mono border-r border-[var(--color-border-base)] transition-all',
              activeTab === tab.id
                ? 'bg-[var(--color-surface-0)] text-[var(--color-ink-1)]'
                : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] hover:bg-[var(--color-surface-3)]',
            ].join(' ')}
          >
            {activeTab === tab.id && (
              <span className="absolute top-0 inset-x-0 h-[2px] bg-[var(--color-accent)] rounded-b" />
            )}
            <span className={activeTab === tab.id ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink-3)]'}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}

        {/* Copy button */}
        <div className="ml-auto flex items-center px-3">
          {!isEmpty && (
            <button
              onClick={copy}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all',
                copied
                  ? 'text-[var(--color-ok)] bg-[var(--color-ok)]/10'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)]',
              ].join(' ')}
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
              {copied ? 'copied!' : 'copy'}
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-[var(--color-surface-2)] border-b border-[var(--color-border-soft)] shrink-0">
        <span className="text-[10px] font-mono text-[var(--color-ink-3)]">query</span>
        <span className="text-[10px] font-mono text-[var(--color-ink-3)]">/</span>
        <span className="text-[10px] font-mono text-[var(--color-ink-2)]">{activeFile}</span>
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto py-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-3xl font-mono text-[var(--color-ink-3)] opacity-30 select-none">
              {activeTab === 'sql' ? 'SELECT' : activeTab === 'mongo' ? '{ }' : '[ ]'}
            </span>
            <p className="text-[11px] font-mono text-[var(--color-ink-3)]">
              select a schema and add conditions
            </p>
          </div>
        ) : (
          <SyntaxHighlight
            code={
              activeTab === 'sql'   ? (sql   || '-- add conditions to generate SQL') :
              activeTab === 'mongo' ? (mongo || '{}') :
              jsonContent
            }
            language={lang}
          />
        )}
      </div>

      {/* Status bar */}
      {!isEmpty && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-[var(--color-accent)] shrink-0">
          <span className="text-[10px] font-mono text-white/80 tracking-widest uppercase">
            {activeTab}
          </span>
          <span className="text-[10px] font-mono text-white/70">
            {content.split('\n').length} lines · {content.length} chars
          </span>
        </div>
      )}
    </div>
  )
}

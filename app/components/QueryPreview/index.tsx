'use client'
import { useState } from 'react'
import { SyntaxHighlight } from './SyntaxHighlight'
import { useQueryStore } from '@/app/store/queryStore'
import { Copy, Check } from 'lucide-react'

interface Props {
  sql: string
  mongo: string
}

type Tab = 'sql' | 'mongo' | 'json'

const TABS: { id: Tab; label: string }[] = [
  { id: 'sql',   label: 'SQL' },
  { id: 'mongo', label: 'MongoDB' },
  { id: 'json',  label: 'JSON Tree' },
]

export function QueryPreview({ sql, mongo }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('sql')
  const [copied, setCopied]       = useState(false)
  const { rootGroup }             = useQueryStore()

  const jsonContent = JSON.stringify(rootGroup, null, 2)
  const content = activeTab === 'sql' ? sql : activeTab === 'mongo' ? mongo : jsonContent

  async function copy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!sql && !mongo) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
        Select a schema and add conditions to see preview
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Copy to clipboard"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-zinc-50 dark:bg-zinc-900/50">
        {activeTab === 'sql' && (
          <SyntaxHighlight code={sql || '-- Add conditions to generate SQL'} language="sql" />
        )}
        {activeTab === 'mongo' && (
          <SyntaxHighlight code={mongo || '{}'} language="json" />
        )}
        {activeTab === 'json' && (
          <SyntaxHighlight code={jsonContent} language="json" />
        )}
      </div>
    </div>
  )
}
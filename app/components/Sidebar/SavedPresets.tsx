'use client'
import { useState } from 'react'
import { useQueryStore } from '@/app/store/queryStore'
import { Bookmark, Trash2, Download } from 'lucide-react'

export function SavedPresets() {
  const { presets, savePreset, loadPreset } = useQueryStore()
  const [name, setName] = useState('')

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    savePreset(trimmed)
    setName('')
  }

  function exportPresets() {
    const json = JSON.stringify(presets, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'query-presets.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <Bookmark size={14} className="text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Saved Presets</span>
        {presets.length > 0 && (
          <button
            onClick={exportPresets}
            className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Export all presets"
          >
            <Download size={13} />
          </button>
        )}
      </div>

      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Preset name..."
            className="flex-1 text-xs px-2 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-700 dark:text-zinc-300"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-xs px-2 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {presets.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-zinc-400">
            No saved presets yet
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {presets.map(preset => (
              <li key={preset.id} className="flex items-center group">
                <button
                  onClick={() => loadPreset(preset.id)}
                  className="flex-1 text-left px-4 py-3 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors truncate"
                >
                  {preset.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
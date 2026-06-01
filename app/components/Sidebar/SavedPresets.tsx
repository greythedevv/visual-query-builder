'use client'
import { useState }       from 'react'
import { useQueryStore }  from '@/app/store/queryStore'
import { Trash2, Download } from 'lucide-react'

export function SavedPresets() {
  const { presets, savePreset, loadPreset, deletePreset } = useQueryStore()
  const [name, setName] = useState('')

  function handleSave() {
    const t = name.trim()
    if (!t) return
    savePreset(t)
    setName('')
  }

  function exportPresets() {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = 'presets.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-base)] shrink-0">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-ink-3)]">
          Saved Presets
        </span>
        {presets.length > 0 && (
          <button
            onClick={exportPresets}
            aria-label="Export presets"
            className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors p-0.5"
          >
            <Download size={12} />
          </button>
        )}
      </div>

      {/* Save input — uses surface-0 bg so it's always visible against surface-1 sidebar */}
      <div className="border-b border-[var(--color-border-base)] shrink-0">
        <div className="flex gap-1 w-full">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Preset name…"
            className="flex-1 text-[11px] font-mono px-1 py-0.5 rounded-lg bg-[var(--color-surface-0)] text-[var(--color-ink-1)] border border-[var(--color-border-strong)] outline-none focus:ring-2 focus:ring-[var(--color-accent-ring)] focus:border-[var(--color-accent)] placeholder:text-[var(--color-ink-3)] transition-all"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="text-[11px] font-semibold px-3 py-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
          >
            Save
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {presets.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <p className="text-[10px] font-mono text-[var(--color-ink-3)]">no saved presets yet</p>
          </div>
        ) : (
          presets.map((preset, i) => (
            <div
              key={preset.id}
              className="flex items-center border-b border-[var(--color-border-soft)] group animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <button
                onClick={() => loadPreset(preset.id)}
                className="flex-1 text-left px-4 py-3 text-[11px] text-[var(--color-ink-1)] hover:bg-[var(--color-surface-2)] transition-colors truncate"
              >
                {preset.name}
              </button>
              <button
                onClick={() => deletePreset(preset.id)}
                aria-label="Delete preset"
                className="px-3 py-3 text-[var(--color-ink-3)] hover:text-[var(--color-bad)] hover:bg-red-500/10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

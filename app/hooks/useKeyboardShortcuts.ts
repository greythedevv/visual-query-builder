import { useEffect } from 'react'
import { useQueryStore } from '@/app/store/queryStore'

interface Shortcuts {
  onExecute: () => void
  onExport:  () => void
  onReset:   () => void
  onToggleHistory: () => void
}

export function useKeyboardShortcuts({
  onExecute,
  onExport,
  onReset,
  onToggleHistory,
}: Shortcuts) {
  const { reset } = useQueryStore()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key === 'Enter') {
        e.preventDefault()
        onExecute()
      }
      if (ctrl && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        onExport()
      }
      if (ctrl && e.key === 'r') {
        e.preventDefault()
        onReset()
        reset()
      }
      if (ctrl && e.key === 'h') {
        e.preventDefault()
        onToggleHistory()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onExecute, onExport, onReset, onToggleHistory, reset])
}
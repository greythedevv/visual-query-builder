'use client'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      title="Toggle theme"
      aria-label="Toggle theme"
      className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--color-ink-2)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)] transition-all"
    >
      <span suppressHydrationWarning>
        {mounted
          ? resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />
          : <Moon size={14} />
        }
      </span>
    </button>
  )
}
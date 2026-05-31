import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/app/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Visual Query Builder',
  description: 'Build complex database queries visually without writing raw SQL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
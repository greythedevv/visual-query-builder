'use client'
import { useQueryStore } from '@/app/store/queryStore'
import { SCHEMAS } from '@/app/lib/schema/schemas'
import { Database } from 'lucide-react'

export function SchemaSelector() {
  const { schema, setSchema } = useQueryStore()

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 shrink-0 border-b border-[var(--color-border-base)] bg-[var(--color-surface-1)]">

      {/* Label — hidden on very small screens */}
      <div className=" flex items-center gap-2 shrink-0">
        <Database size={13} className="text-[var(--color-accent)]" />
        <span className="text-[10px] hidden sm:block font-semibold uppercase tracking-widest text-[var(--color-ink-3)] whitespace-nowrap">
          Data source
        </span>
      </div>

      {/* Schema buttons */}
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {SCHEMAS.map(s => (
          <button
            key={s.id}
            onClick={() => setSchema(s)}
            className={[
              // Smaller on mobile, normal on sm+
              'px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-medium transition-all border whitespace-nowrap',
              schema?.id === s.id
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-transparent text-[var(--color-ink-2)] border-[var(--color-border-strong)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink-1)]',
            ].join(' ')}
          >
            {s.name}
          </button>
        ))}
      </div>

      {schema && (
        <span className="ml-auto text-[10px] font-mono text-[var(--color-ink-3)] shrink-0 ">
          {schema.fields.length} fields
        </span>
      )}
    </div>
  )
}

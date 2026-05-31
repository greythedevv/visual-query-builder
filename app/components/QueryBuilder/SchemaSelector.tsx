'use client'
import { useQueryStore } from '@/app/store/queryStore'
import { SCHEMAS } from '@/app/lib/schema/schemas'
import { Database } from 'lucide-react'

export function SchemaSelector() {
  const { schema, setSchema } = useQueryStore()

  return (
    <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
      <Database size={16} className="text-violet-500 shrink-0" />
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Data source</span>
      <div className="flex gap-2 ml-2 flex-wrap">
        {SCHEMAS.map(s => (
          <button
            key={s.id}
            onClick={() => setSchema(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              schema?.id === s.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      {schema && (
        <span className="ml-auto text-xs text-zinc-400">
          {schema.fields.length} fields
        </span>
      )}
    </div>
  )
}
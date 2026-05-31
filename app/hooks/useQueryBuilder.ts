import { useCallback, useMemo, useState } from 'react'
import { useQueryStore } from '@/app/store/queryStore'
import { buildSQL, buildMongo } from '@/app/lib/queryEngine/builders'
import { executeQuery } from '@/app/lib/queryEngine/executor'
import { validateTree } from '@/app/lib/queryEngine/validator'
import { MOCK_DATA } from '@/app/lib/mockData/index'
import { validateImport } from '@/app/lib/queryEngine/importValidator'

export function useQueryBuilder() {
  const { schema, rootGroup, saveToHistory, importTree } = useQueryStore()

  const [results,       setResults]       = useState<Record<string, unknown>[]>([])
  const [isExecuting,   setIsExecuting]   = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [hasExecuted,   setHasExecuted]   = useState(false)
  const [importError,   setImportError]   = useState<string | null>(null)

  const sql    = useMemo(() => schema ? buildSQL(rootGroup, schema.id)  : '', [schema, rootGroup])
  const mongo  = useMemo(() => schema ? buildMongo(rootGroup)            : '', [schema, rootGroup])
  const errors = useMemo(() => schema ? validateTree(rootGroup, schema)  : [], [schema, rootGroup])

  const execute = useCallback(async () => {
    if (!schema || errors.length > 0) return
    setIsExecuting(true)
    const start = performance.now()
    await new Promise(r => setTimeout(r, 300))
    const data    = MOCK_DATA[schema.id] ?? []
    const matched = executeQuery(data, rootGroup)
    const elapsed = performance.now() - start
    setResults(matched)
    setExecutionTime(Math.round(elapsed))
    setHasExecuted(true)
    setIsExecuting(false)
    saveToHistory(`Query on ${schema.name} — ${matched.length} results`)
  }, [schema, rootGroup, errors, saveToHistory])

  const exportQuery = useCallback(() => {
    const json = JSON.stringify(rootGroup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'query.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [rootGroup])

  const importQuery = useCallback((file: File) => {
    setImportError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw  = JSON.parse(e.target?.result as string)
        const tree = validateImport(raw)
        importTree(tree)
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid file')
      }
    }
    reader.readAsText(file)
  }, [importTree])

  return {
    sql, mongo, errors,
    results, isExecuting, executionTime, hasExecuted,
    importError,
    execute, exportQuery, importQuery,
  }
}
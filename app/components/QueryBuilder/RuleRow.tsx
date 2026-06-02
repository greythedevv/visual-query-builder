'use client'

import { memo } from 'react'
import { QueryRule } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/app/lib/schema/operators'
import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'



/* Single source-of-truth for every input / select */
const INPUT =
  'h-9 w-full rounded-lg border border-[var(--color-border-base)] bg-[var(--color-surface-3)] px-3 text-xs text-[var(--color-ink-1)] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-ring)] placeholder:text-[var(--color-ink-3)]'

export const RuleRow = memo(({ rule, hasError }: { rule: QueryRule; hasError?: boolean }) => {
  const { schema, updateRule, removeNode } = useQueryStore()

  const field     = schema?.fields.find(f => f.key === rule.field)
  const operators = field ? OPERATORS_BY_TYPE[field.type] : []

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  /* ── Value input ── */
  const renderValue = () => {
    if (['is_null', 'is_not_null'].includes(rule.operator) || !field) return null

    if (field.type === 'enum' && rule.operator === 'in_array') {
      return (
        <select
          multiple
          className={`${INPUT} min-h-[80px] py-2`}
          value={rule.value as string[]}
          onChange={e =>
            updateRule(rule.id, { value: Array.from(e.target.selectedOptions, o => o.value) })
          }
        >
          {field.enumValues?.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'enum') {
      return (
        <select
          className={INPUT}
          value={rule.value as string}
          onChange={e => updateRule(rule.id, { value: e.target.value })}
        >
          <option value="">Select value…</option>
          {field.enumValues?.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'number' && rule.operator === 'between') {
      const [a, b] = (rule.value as [number, number]) || [0, 0]
      return (
        <div className="flex gap-2 max-w-sm">
          <input
            type="number"
            className={INPUT}
            value={a}
            placeholder="Min"
            onChange={e => updateRule(rule.id, { value: [Number(e.target.value), b] })}
          />
          <input
            type="number"
            className={INPUT}
            value={b}
            placeholder="Max"
            onChange={e => updateRule(rule.id, { value: [a, Number(e.target.value)] })}
          />
        </div>
      )
    }

    if (field.type === 'date' && rule.operator === 'between') {
      const [a, b] = (rule.value as [string, string]) || ['', '']
      return (
        <div className="flex gap-2 max-w-sm">
          <input
            type="date"
            className={INPUT}
            value={a}
            onChange={e => updateRule(rule.id, { value: [e.target.value, b] })}
          />
          <input
            type="date"
            className={INPUT}
            value={b}
            onChange={e => updateRule(rule.id, { value: [a, e.target.value] })}
          />
        </div>
      )
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          className={`${INPUT} max-w-xs`}
          value={rule.value as string}
          onChange={e => updateRule(rule.id, { value: e.target.value })}
        />
      )
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          className={`${INPUT} max-w-xs`}
          value={rule.value as number}
          onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
        />
      )
    }

    if (field.type === 'boolean') {
  return (
    <select
      className={INPUT}
      value={String(rule.value ?? '')}
      onChange={e => updateRule(rule.id, { value: e.target.value === 'true' })}
    >
      <option value="">Select value…</option>
      <option value="true">True</option>
      <option value="false">False</option>
    </select>
  )
}

    return (
      <input
        type="text"
        className={`${INPUT} max-w-md`}
        value={rule.value as string}
        placeholder="Enter value…"
        onChange={e => updateRule(rule.id, { value: e.target.value })}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'rounded-xl border p-3 bg-[var(--color-surface-1)] transition-all animate-fade-in',
        hasError
          ? 'border-[var(--color-bad)]/40 ring-1 ring-[var(--color-bad)]/20'
          : 'border-[var(--color-border-base)] hover:border-[var(--color-border-strong)]',
        isDragging ? 'opacity-50 shadow-lg' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label="Drag rule"
          className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-ink-3)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-ink-1)] transition-colors"
        >
          <GripVertical size={12} />
        </button>

        {/* Field + Operator selects */}
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <select
            className={INPUT}
            value={rule.field}
            onChange={e => updateRule(rule.id, { field: e.target.value, operator: 'equals', value: '' })}
          >
            {schema?.fields.map(f => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          <select
            className={INPUT}
            value={rule.operator}
            onChange={e =>
              updateRule(rule.id, { operator: e.target.value as QueryRule['operator'], value: '' })
            }
          >
            {operators.map(op => (
              <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
            ))}
          </select>
        </div>

        {/* Delete */}
        <button
          onClick={() => removeNode(rule.id)}
          aria-label="Delete rule"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-ink-3)] transition-all hover:bg-red-500/10 hover:text-[var(--color-bad)]"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Value row */}
      {!['is_null', 'is_not_null'].includes(rule.operator) && field && (
        <div className="mt-2.5 pl-9">
          {renderValue()}
        </div>
      )}
    </div>
  )
})

RuleRow.displayName = 'RuleRow'
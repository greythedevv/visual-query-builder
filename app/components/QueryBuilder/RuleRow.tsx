'use client'
import { memo } from 'react'
import { QueryRule } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/app/lib/schema/operators'
import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const RuleRow = memo(({ rule, hasError }: { rule: QueryRule; hasError?: boolean }) => {
  const { schema, updateRule, removeNode } = useQueryStore()
  const field = schema?.fields.find(f => f.key === rule.field)
  const operators = field ? OPERATORS_BY_TYPE[field.type] : []

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  const selectClass =
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 w-full min-w-0'

  const inputClass =
    'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 w-full min-w-0 placeholder:text-zinc-400 dark:placeholder:text-zinc-500'

  const renderValueInput = () => {
    if (['is_null', 'is_not_null'].includes(rule.operator)) return null
    if (!field) return null

    if (field.type === 'enum' && rule.operator === 'in_array') {
      return (
        <select
          multiple
          className={selectClass + ' min-h-[60px]'}
          value={rule.value as string[]}
          onChange={e =>
            updateRule(rule.id, {
              value: Array.from(e.target.selectedOptions, o => o.value),
            })
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
          className={selectClass}
          value={rule.value as string}
          onChange={e => updateRule(rule.id, { value: e.target.value })}
        >
          <option value="">Select...</option>
          {field.enumValues?.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      )
    }

    if (field.type === 'number' && rule.operator === 'between') {
      const [a, b] = (rule.value as [number, number]) || [0, 0]
      return (
        <div className="flex items-center gap-1 w-full min-w-0">
          <input
            type="number"
            className={inputClass}
            value={a}
            placeholder="min"
            onChange={e => updateRule(rule.id, { value: [Number(e.target.value), b] })}
          />
          <span className="text-xs text-zinc-400 shrink-0">—</span>
          <input
            type="number"
            className={inputClass}
            value={b}
            placeholder="max"
            onChange={e => updateRule(rule.id, { value: [a, Number(e.target.value)] })}
          />
        </div>
      )
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          className={inputClass}
          value={rule.value as string}
          onChange={e => updateRule(rule.id, { value: e.target.value })}
        />
      )
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          className={inputClass}
          value={rule.value as number}
          onChange={e => updateRule(rule.id, { value: Number(e.target.value) })}
        />
      )
    }

    return (
      <input
        type="text"
        className={inputClass}
        value={rule.value as string}
        onChange={e => updateRule(rule.id, { value: e.target.value })}
        placeholder="value..."
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`
        flex flex-col gap-2 p-2 rounded-md
        bg-zinc-50 dark:bg-zinc-800/50
        border dark:border-zinc-700
        ${hasError ? 'border-red-300 dark:border-red-700' : 'border-zinc-200'}
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
      `}
    >
      {/* Row 1: drag + field + operator + delete */}
      <div className="flex items-center gap-1.5 min-w-0 w-full">
        <button
          {...attributes}
          {...listeners}
          className="text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={13} />
        </button>

        <select
          className={selectClass}
          value={rule.field}
          onChange={e =>
            updateRule(rule.id, { field: e.target.value, operator: 'equals', value: '' })
          }
        >
          {schema?.fields.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>

        <select
          className={selectClass}
          value={rule.operator}
          onChange={e =>
            updateRule(rule.id, { operator: e.target.value as QueryRule['operator'], value: '' })
          }
        >
          {operators.map(op => (
            <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
          ))}
        </select>

        <button
          onClick={() => removeNode(rule.id)}
          className="shrink-0 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-0.5"
          aria-label="Remove rule"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Row 2: value input — full width, never overflows */}
      {!['is_null', 'is_not_null'].includes(rule.operator) && field && (
        <div className="pl-5 w-full min-w-0">
          {renderValueInput()}
        </div>
      )}
    </div>
  )
})

RuleRow.displayName = 'RuleRow'
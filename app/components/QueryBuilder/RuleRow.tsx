'use client'
import { memo } from 'react'
import { QueryRule } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/app/lib/schema/operators'
import { GripVertical, Trash2 } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export const RuleRow = memo(({ rule }: { rule: QueryRule }) => {
  const { schema, updateRule, removeNode } = useQueryStore()
  const field = schema?.fields.find(f => f.key === rule.field)
  const operators = field ? OPERATORS_BY_TYPE[field.type] : []

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rule.id })

  const inputClass = "bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"

  const renderValueInput = () => {
    if (['is_null','is_not_null'].includes(rule.operator)) return null
    if (!field) return null

    if (field.type === 'enum' && rule.operator === 'in_array') {
      return (
        <select multiple className={inputClass} value={rule.value as string[]}
          onChange={e => updateRule(rule.id, { value: Array.from(e.target.selectedOptions, o => o.value) })}>
          {field.enumValues?.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      )
    }
    if (field.type === 'enum') {
      return (
        <select className={inputClass} value={rule.value as string}
          onChange={e => updateRule(rule.id, { value: e.target.value })}>
          <option value="">Select...</option>
          {field.enumValues?.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      )
    }
    if (field.type === 'number' && rule.operator === 'between') {
      const [a, b] = (rule.value as [number, number]) || [0, 0]
      return (
        <div className="flex items-center gap-1">
          <input type="number" className={inputClass + ' w-20'} value={a}
            onChange={e => updateRule(rule.id, { value: [Number(e.target.value), b] })} />
          <span className="text-xs text-zinc-400">and</span>
          <input type="number" className={inputClass + ' w-20'} value={b}
            onChange={e => updateRule(rule.id, { value: [a, Number(e.target.value)] })} />
        </div>
      )
    }
    if (field.type === 'date') {
      return <input type="date" className={inputClass} value={rule.value as string}
        onChange={e => updateRule(rule.id, { value: e.target.value })} />
    }
    if (field.type === 'number') {
      return <input type="number" className={inputClass + ' w-24'} value={rule.value as number}
        onChange={e => updateRule(rule.id, { value: Number(e.target.value) })} />
    }
    return <input type="text" className={inputClass + ' w-40'} value={rule.value as string}
      onChange={e => updateRule(rule.id, { value: e.target.value })} placeholder="value..." />
  }

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 p-2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button {...attributes} {...listeners} className="text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} />
      </button>

      {/* Field selector */}
      <select className={inputClass} value={rule.field}
        onChange={e => updateRule(rule.id, { field: e.target.value, operator: 'equals', value: '' })}>
        {schema?.fields.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
      </select>

      {/* Operator selector — restricted by field type */}
      <select className={inputClass} value={rule.operator}
        onChange={e => updateRule(rule.id, { operator: e.target.value as QueryRule['operator'], value: '' })}>
        {operators.map(op => <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>)}
      </select>

      {renderValueInput()}

      <button onClick={() => removeNode(rule.id)}
        className="ml-auto text-zinc-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  )
})

RuleRow.displayName = 'RuleRow'
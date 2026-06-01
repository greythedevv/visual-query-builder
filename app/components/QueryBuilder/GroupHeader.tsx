'use client'
import { QueryGroup } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { ChevronDown, ChevronRight, Plus, Layers, Trash2, GripVertical } from 'lucide-react'

interface Props {
  group: QueryGroup
  isRoot: boolean
  dragHandleProps?: Record<string, unknown>
}

export function GroupHeader({ group, isRoot, dragHandleProps }: Props) {
  const { addRule, addGroup, removeNode, toggleLogic, toggleCollapse } = useQueryStore()
  const isAnd = group.logic === 'AND'

  return (
    <div className="flex items-center gap-2 w-full">

      {/* Drag handle (non-root only) */}
      {!isRoot && (
        <button
          {...dragHandleProps}
          aria-label="Drag to reorder group"
          className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-2)] cursor-grab active:cursor-grabbing transition-colors p-0.5 shrink-0"
        >
          <GripVertical size={13} />
        </button>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => toggleCollapse(group.id)}
        aria-label={group.collapsed ? 'Expand group' : 'Collapse group'}
        className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] transition-colors p-0.5 shrink-0"
      >
        {group.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* AND / OR pill */}
      <button
        onClick={() => toggleLogic(group.id)}
        aria-label={`Logic: ${group.logic}. Click to toggle.`}
        className={[
          'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest transition-all border shrink-0',
          isAnd
            ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent-ring)]'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        ].join(' ')}
      >
        {group.logic}
      </button>

      {/* Condition count */}
      <span className="text-[10px] font-mono text-[var(--color-ink-3)] shrink-0">
        {group.children.length} cond{group.children.length !== 1 ? 's' : ''}
      </span>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-0.5 shrink-0">
        {/* + Rule */}
        <button
          onClick={() => addRule(group.id)}
          aria-label="Add condition rule"
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-border-base)] transition-all"
        >
          <Plus size={11} />
          <span className="hidden sm:inline">Rule</span>
        </button>

        {/* + Group — Layers icon is much clearer for "nested group" */}
        <button
          onClick={() => addGroup(group.id)}
          aria-label="Add nested group"
          title="Add nested condition group"
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] hover:bg-[var(--color-surface-3)] border border-transparent hover:border-[var(--color-border-base)] transition-all"
        >
          <Layers size={11} />
          <span className="hidden sm:inline">Group</span>
        </button>

        {/* Delete group */}
        {!isRoot && (
          <button
            onClick={() => removeNode(group.id)}
            aria-label="Remove group"
            className="p-1.5 rounded-md text-[var(--color-ink-3)] hover:text-[var(--color-bad)] hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>
    </div>
  )
}

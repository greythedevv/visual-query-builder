'use client'
import { QueryGroup } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { ChevronDown, ChevronRight, Plus, PlusSquare, Trash2, GripVertical } from 'lucide-react'

interface Props {
  group: QueryGroup
  isRoot: boolean
  dragHandleProps?: Record<string, unknown>
}

export function GroupHeader({ group, isRoot, dragHandleProps }: Props) {
  const { addRule, addGroup, removeNode, toggleLogic, toggleCollapse } = useQueryStore()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!isRoot && (
        <button
          {...dragHandleProps}
          className="text-zinc-300 hover:text-zinc-500 dark:hover:text-zinc-400 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder group"
        >
          <GripVertical size={14} />
        </button>
      )}

      <button
        onClick={() => toggleCollapse(group.id)}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        aria-label={group.collapsed ? 'Expand group' : 'Collapse group'}
      >
        {group.collapsed
          ? <ChevronRight size={16} />
          : <ChevronDown size={16} />
        }
      </button>

      <button
        onClick={() => toggleLogic(group.id)}
        className={`px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider transition-all ${
          group.logic === 'AND'
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/60'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
        }`}
        aria-label={`Logic operator: ${group.logic}. Click to toggle.`}
      >
        {group.logic}
      </button>

      <span className="text-xs text-zinc-400 dark:text-zinc-500">
        {group.children.length} condition{group.children.length !== 1 ? 's' : ''}
      </span>

      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={() => addRule(group.id)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          aria-label="Add condition rule"
        >
          <Plus size={12} />
          <span className="hidden sm:inline">Rule</span>
        </button>

        <button
          onClick={() => addGroup(group.id)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          aria-label="Add nested group"
        >
          <PlusSquare size={12} />
          <span className="hidden sm:inline">Group</span>
        </button>

        {!isRoot && (
          <button
            onClick={() => removeNode(group.id)}
            className="text-xs px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
            aria-label="Remove group"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
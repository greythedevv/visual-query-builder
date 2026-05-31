'use client'
import { memo, useCallback } from 'react'
import { QueryGroup, QueryNode } from '@/app/lib/queryEngine/types'
import { useQueryStore } from '@/app/store/queryStore'
import { RuleRow } from './RuleRow'
import { ChevronDown, ChevronRight, Plus, PlusSquare, Trash2 } from 'lucide-react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  group: QueryGroup
  depth: number
  isRoot?: boolean
}

// This component renders itself recursively for nested groups
export const ConditionGroup = memo(({ group, depth, isRoot = false }: Props) => {
  const { addRule, addGroup, removeNode, toggleLogic, toggleCollapse } = useQueryStore()

  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
    disabled: isRoot,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const borderColors = ['border-violet-500', 'border-teal-500', 'border-amber-500', 'border-pink-500']
  const borderColor = borderColors[depth % borderColors.length]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border-l-2 ${borderColor} bg-white dark:bg-zinc-900 p-3 space-y-2 transition-all`}
    >
      {/* Group header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleCollapse(group.id)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          {group.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* AND/OR toggle */}
        <button
          onClick={() => toggleLogic(group.id)}
          className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-colors
            ${group.logic === 'AND'
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            }`}
        >
          {group.logic}
        </button>

        <span className="text-xs text-zinc-400">
          {group.children.length} condition{group.children.length !== 1 ? 's' : ''}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => addRule(group.id)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <Plus size={12} /> Rule
          </button>
          <button
            onClick={() => addGroup(group.id)}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <PlusSquare size={12} /> Group
          </button>
          {!isRoot && (
            <button
              onClick={() => removeNode(group.id)}
              className="text-xs px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Children — recursion happens here */}
      {!group.collapsed && (
        <SortableContext items={group.children.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 ml-4">
            {group.children.map(child => (
              child.type === 'rule'
                ? <RuleRow key={child.id} rule={child} />
                : <ConditionGroup key={child.id} group={child} depth={depth + 1} />  // ← RECURSION
            ))}
          </div>
        </SortableContext>
      )}

      {group.children.length === 0 && !group.collapsed && (
        <div className="ml-4 text-xs text-zinc-400 italic py-2">
          No conditions — add a rule or nested group
        </div>
      )}
    </div>
  )
})

ConditionGroup.displayName = 'ConditionGroup'
'use client'
import { memo } from 'react'
import { QueryGroup } from '@/app/lib/queryEngine/types'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RuleRow } from './RuleRow'
import { GroupHeader } from './GroupHeader'

interface Props {
  group: QueryGroup
  depth: number
  isRoot?: boolean
  errorNodeIds?: Set<string>
}

const BORDER_COLORS = [
  'border-violet-400 dark:border-violet-600',
  'border-teal-400 dark:border-teal-600',
  'border-amber-400 dark:border-amber-600',
  'border-pink-400 dark:border-pink-600',
]

const BG_COLORS = [
  'bg-violet-50/50 dark:bg-violet-950/20',
  'bg-teal-50/50 dark:bg-teal-950/20',
  'bg-amber-50/50 dark:bg-amber-950/20',
  'bg-pink-50/50 dark:bg-pink-950/20',
]

export const ConditionGroup = memo(({
  group, depth, isRoot = false, errorNodeIds = new Set()
}: Props) => {
  const {
    setNodeRef, attributes, listeners,
    transform, transition, isDragging,
  } = useSortable({ id: group.id, disabled: isRoot })

  const borderColor = BORDER_COLORS[depth % BORDER_COLORS.length]
  const bgColor     = BG_COLORS[depth % BG_COLORS.length]
  const hasError    = errorNodeIds.has(group.id)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`
        rounded-xl border-l-2 p-3 space-y-2 animate-fade-in
        ${hasError ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20' : `${borderColor} ${bgColor}`}
        ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : ''}
      `}
    >
      <GroupHeader
        group={group}
        isRoot={isRoot}
        dragHandleProps={{ ...attributes, ...listeners }}
      />

      {!group.collapsed && (
        <SortableContext
          items={group.children.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 ml-3 pl-3 border-l border-zinc-200 dark:border-zinc-700">
            {group.children.map(child =>
              child.type === 'rule' ? (
                <RuleRow
                  key={child.id}
                  rule={child}
                />
              ) : (
                // ← RECURSION: renders another ConditionGroup for nested groups
                <ConditionGroup
                  key={child.id}
                  group={child}
                  depth={depth + 1}
                  errorNodeIds={errorNodeIds}
                />
              )
            )}

            {group.children.length === 0 && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-2 px-1">
                Empty group — add a rule or nested group above
              </p>
            )}
          </div>
        </SortableContext>
      )}

      {group.collapsed && group.children.length > 0 && (
        <p className="text-xs text-zinc-400 ml-3 italic">
          {group.children.length} hidden condition{group.children.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
})

ConditionGroup.displayName = 'ConditionGroup'
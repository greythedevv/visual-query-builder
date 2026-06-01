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

const DEPTH_ACCENT = [
  'border-l-[var(--color-accent)]',
  'border-l-sky-500',
  'border-l-emerald-500',
  'border-l-amber-500',
]

export const ConditionGroup = memo(({
  group, depth, isRoot = false, errorNodeIds = new Set(),
}: Props) => {
  const {
    setNodeRef, attributes, listeners,
    transform, transition, isDragging,
  } = useSortable({ id: group.id, disabled: isRoot })

  const accentBorder = DEPTH_ACCENT[depth % DEPTH_ACCENT.length]
  const hasError = errorNodeIds.has(group.id)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        'rounded-xl border-l-2 border border-[var(--color-border-base)]',
        'bg-[var(--color-surface-2)]',
        hasError ? 'border-l-[var(--color-bad)] bg-red-950/10' : accentBorder,
        isDragging ? 'opacity-40 shadow-2xl' : '',
        depth > 0 ? 'ml-4' : '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center px-3 py-2.5 border-b border-[var(--color-border-soft)]">
        <GroupHeader
          group={group}
          isRoot={isRoot}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      </div>

      {/* Children */}
      {!group.collapsed && (
        <div className="p-3 space-y-2">
          <SortableContext
            items={group.children.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {group.children.map(child =>
              child.type === 'rule' ? (
                <RuleRow
                  key={child.id}
                  rule={child}
                  hasError={errorNodeIds.has(child.id)}
                />
              ) : (
                <ConditionGroup
                  key={child.id}
                  group={child}
                  depth={depth + 1}
                  errorNodeIds={errorNodeIds}
                />
              )
            )}
          </SortableContext>

          {group.children.length === 0 && (
            <div data-testid="empty-group" className="flex items-center justify-center  py-8 rounded-lg border border-dashed border-[var(--color-border-strong)]">
              <p className="text-xs text-[var(--color-ink-3)]">
                Click <span className="text-[var(--color-accent)] font-semibold">+ Rule</span> to add a condition
              </p>
            </div>
          )}
        </div>
      )}

      {group.collapsed && group.children.length > 0 && (
        <div className="px-3 py-2.5">
          <span className="text-xs text-[var(--color-ink-3)] italic">
            {group.children.length} hidden condition{group.children.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
})

ConditionGroup.displayName = 'ConditionGroup'

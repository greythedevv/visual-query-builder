'use client'
import {
  DndContext, DragEndEvent,
  PointerSensor, KeyboardSensor,
  useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useQueryStore }  from '@/app/store/queryStore'
import { SchemaSelector } from './SchemaSelector'
import { ConditionGroup } from './ConditionGroup'
import { AlertCircle }    from 'lucide-react'
import { QueryGroup, QueryNode } from '@/app/lib/queryEngine/types'

interface Props {
  errors: { nodeId: string; message: string }[]
}

function findParentGroup(group: QueryGroup, nodeId: string): QueryGroup | null {
  for (const child of group.children) {
    if (child.id === nodeId) return group
    if (child.type === 'group') {
      const found = findParentGroup(child, nodeId)
      if (found) return found
    }
  }
  return null
}

function findNode(group: QueryGroup, nodeId: string): QueryNode | null {
  for (const child of group.children) {
    if (child.id === nodeId) return child
    if (child.type === 'group') {
      const found = findNode(child, nodeId)
      if (found) return found
    }
  }
  return null
}

export function QueryBuilder({ errors }: Props) {
  const { rootGroup, schema, moveNode } = useQueryStore()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeParent = findParentGroup(rootGroup, String(active.id))
    const overParent   = findParentGroup(rootGroup, String(over.id))
    if (!activeParent || !overParent) return

    if (activeParent.id === overParent.id) {
      const newIndex = overParent.children.findIndex(c => c.id === over.id)
      if (newIndex === -1) return
      moveNode(String(active.id), activeParent.id, newIndex)
    } else {
      const newIndex = overParent.children.findIndex(c => c.id === over.id)
      moveNode(String(active.id), overParent.id, newIndex === -1 ? overParent.children.length : newIndex)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SchemaSelector />

      {!schema ? (
        <div className="flex flex-col items-center justify-center flex-1 p-10 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-subtle)] border border-[var(--color-accent-ring)] flex items-center justify-center">
            <span className="text-2xl">🗄️</span>
          </div>
          <p className="text-sm text-[var(--color-ink-3)] max-w-xs leading-relaxed">
            Select a data source above to start building your query
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">

          {errors.length > 0 && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 animate-fade-in">
              <AlertCircle size={14} className="text-[var(--color-bad)] mt-0.5 shrink-0" />
              <div className="space-y-1">
                {errors.map(err => (
                  <p key={err.nodeId} className="text-xs text-[var(--color-bad)]">
                    {err.message}
                  </p>
                ))}
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <ConditionGroup
              group={rootGroup}
              depth={0}
              isRoot
              errorNodeIds={new Set(errors.map(e => e.nodeId))}
            />
          </DndContext>
        </div>
      )}
    </div>
  )
}

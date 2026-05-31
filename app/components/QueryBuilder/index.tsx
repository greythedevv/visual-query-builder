'use client'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useQueryStore } from '@/app/store/queryStore'
import { SchemaSelector } from './SchemaSelector'
import { ConditionGroup } from './ConditionGroup'
import { AlertCircle } from 'lucide-react'
import { QueryGroup, QueryNode } from '@/app/lib/queryEngine/types'

interface Props {
  errors: { nodeId: string; message: string }[]
}

// Returns the group that directly contains nodeId, plus the over-item's parent
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

// Finds the node by id anywhere in the tree
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
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeParent = findParentGroup(rootGroup, String(active.id))
    const overParent   = findParentGroup(rootGroup, String(over.id))

    if (!activeParent || !overParent) return

    if (activeParent.id === overParent.id) {
      // Same group — simple reorder
      const newIndex = overParent.children.findIndex(c => c.id === over.id)
      if (newIndex === -1) return
      moveNode(String(active.id), activeParent.id, newIndex)
    } else {
      // Cross-group move: insert after the over item in its parent
      const newIndex = overParent.children.findIndex(c => c.id === over.id)
      moveNode(String(active.id), overParent.id, newIndex === -1 ? overParent.children.length : newIndex)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SchemaSelector />

      {!schema ? (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
            <span className="text-3xl">🗄️</span>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Select a data source above to start building your query
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {errors.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                {errors.map(err => (
                  <p key={err.nodeId} className="text-xs text-red-600 dark:text-red-400">
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
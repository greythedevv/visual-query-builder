import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QueryGroup, QueryNode, QueryRule, Schema, QueryState } from '@/app/lib/queryEngine/types'
import { nanoid } from 'nanoid'

function makeDefaultGroup(): QueryGroup {
  return { id: nanoid(), type: 'group', logic: 'AND', collapsed: false, children: [] }
}

interface QueryStore extends QueryState {
  setSchema: (schema: Schema) => void
  addRule: (parentId: string) => void
  addGroup: (parentId: string) => void
  updateRule: (id: string, patch: Partial<QueryRule>) => void
  removeNode: (id: string) => void
  toggleLogic: (groupId: string) => void
  toggleCollapse: (groupId: string) => void
  moveNode: (nodeId: string, targetGroupId: string, index: number) => void
  saveToHistory: (label: string) => void
  loadFromHistory: (id: string) => void
  savePreset: (name: string) => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
  importTree: (tree: QueryGroup) => void
  reset: () => void
}

function findAndUpdate(group: QueryGroup, id: string, updater: (n: QueryNode) => QueryNode): QueryGroup {
  return {
    ...group,
    children: group.children.map(child => {
      if (child.id === id) return updater(child)
      if (child.type === 'group') return findAndUpdate(child, id, updater)
      return child
    }),
  }
}

function findAndRemove(group: QueryGroup, id: string): QueryGroup {
  return {
    ...group,
    children: group.children
      .filter(c => c.id !== id)
      .map(c => c.type === 'group' ? findAndRemove(c, id) : c),
  }
}

function findAndAddChild(group: QueryGroup, parentId: string, child: QueryNode): QueryGroup {
  if (group.id === parentId) return { ...group, children: [...group.children, child] }
  return {
    ...group,
    children: group.children.map(c =>
      c.type === 'group' ? findAndAddChild(c, parentId, child) : c
    ),
  }
}

export const useQueryStore = create<QueryStore>()(
  persist(
    (set, get) => ({
      schema: null,
      rootGroup: makeDefaultGroup(),
      history: [],
      presets: [],

      setSchema: (schema) => set({ schema, rootGroup: makeDefaultGroup() }),

      addRule: (parentId) => {
        const { schema } = get()
        const firstField = schema?.fields[0]
        const rule: QueryRule = {
          id: nanoid(), type: 'rule',
          field: firstField?.key ?? '',
          operator: 'equals',
          value: '',
        }
        set(s => ({ rootGroup: findAndAddChild(s.rootGroup, parentId, rule) }))
      },

      addGroup: (parentId) => {
        const group = makeDefaultGroup()
        set(s => ({ rootGroup: findAndAddChild(s.rootGroup, parentId, group) }))
      },

      updateRule: (id, patch) => {
        set(s => ({
          rootGroup: findAndUpdate(s.rootGroup, id, node =>
            node.type === 'rule' ? { ...node, ...patch } : node
          ),
        }))
      },

      removeNode: (id) => set(s => ({ rootGroup: findAndRemove(s.rootGroup, id) })),

      toggleLogic: (groupId) => {
        set(s => ({
          rootGroup: findAndUpdate(s.rootGroup, groupId, node =>
            node.type === 'group'
              ? { ...node, logic: node.logic === 'AND' ? 'OR' : 'AND' }
              : node
          ),
        }))
      },

      toggleCollapse: (groupId) => {
        set(s => ({
          rootGroup: findAndUpdate(s.rootGroup, groupId, node =>
            node.type === 'group' ? { ...node, collapsed: !node.collapsed } : node
          ),
        }))
      },

      moveNode: (nodeId, targetGroupId, index) => {
        const state = get()
        let movedNode: QueryNode | null = null
        function extract(group: QueryGroup): QueryGroup {
          return {
            ...group,
            children: group.children
              .filter(c => { if (c.id === nodeId) { movedNode = c; return false } return true })
              .map(c => c.type === 'group' ? extract(c) : c),
          }
        }
        const newRoot = extract(state.rootGroup)
        if (!movedNode) return
        function insertAt(group: QueryGroup): QueryGroup {
          if (group.id === targetGroupId) {
            const children = [...group.children]
            children.splice(index, 0, movedNode!)
            return { ...group, children }
          }
          return { ...group, children: group.children.map(c => c.type === 'group' ? insertAt(c) : c) }
        }
        set({ rootGroup: insertAt(newRoot) })
      },

      saveToHistory: (label) => {
        const { rootGroup, history } = get()
        set({
          history: [
            { id: nanoid(), tree: rootGroup, timestamp: Date.now(), label },
            ...history.slice(0, 19),
          ],
        })
      },

      loadFromHistory: (id) => {
        const entry = get().history.find(h => h.id === id)
        if (entry) set({ rootGroup: entry.tree })
      },

      savePreset: (name) => {
        const { rootGroup, presets } = get()
        set({ presets: [...presets, { id: nanoid(), name, tree: rootGroup }] })
      },

      loadPreset: (id) => {
        const preset = get().presets.find(p => p.id === id)
        if (preset) set({ rootGroup: preset.tree })
      },

      deletePreset: (id) => {
        set(s => ({ presets: s.presets.filter(p => p.id !== id) }))
      },

      importTree: (tree) => set({ rootGroup: tree }),

      reset: () => set({ rootGroup: makeDefaultGroup() }),
    }),
    {
      name: 'vqb-store',           // localStorage key
      partialize: (state) => ({    // only persist history + presets, not ephemeral schema
        history: state.history,
        presets: state.presets,
      }),
    }
  )
)
import { describe, it, expect, beforeEach } from 'vitest'
import { useQueryStore } from '@/app/store/queryStore'
import { SCHEMAS } from '@/app/lib/schema/schemas'

// Reset store state between every test
beforeEach(() => {
  useQueryStore.getState().reset()
  useQueryStore.setState({ schema: null, history: [], presets: [] })
})

const schema = SCHEMAS[0] // users

describe('setSchema', () => {
  it('sets schema and resets rootGroup', () => {
    useQueryStore.getState().setSchema(schema)
    const state = useQueryStore.getState()
    expect(state.schema?.id).toBe('users')
    expect(state.rootGroup.children).toHaveLength(0)
  })
})

describe('addRule', () => {
  it('adds a rule to the root group', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule } = useQueryStore.getState()
    addRule(rootGroup.id)
    const updated = useQueryStore.getState().rootGroup
    expect(updated.children).toHaveLength(1)
    expect(updated.children[0].type).toBe('rule')
  })

  it('uses first schema field as default', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule } = useQueryStore.getState()
    addRule(rootGroup.id)
    const rule = useQueryStore.getState().rootGroup.children[0]
    expect(rule.type === 'rule' && rule.field).toBe(schema.fields[0].key)
  })
})

describe('addGroup', () => {
  it('adds a nested group to root', () => {
    const { rootGroup, addGroup } = useQueryStore.getState()
    addGroup(rootGroup.id)
    const updated = useQueryStore.getState().rootGroup
    expect(updated.children).toHaveLength(1)
    expect(updated.children[0].type).toBe('group')
  })

  it('can nest a group inside a nested group', () => {
    const { rootGroup, addGroup } = useQueryStore.getState()
    addGroup(rootGroup.id)
    const child = useQueryStore.getState().rootGroup.children[0]
    addGroup(child.id)
    const nested = useQueryStore.getState().rootGroup.children[0]
    expect(nested.type === 'group' && nested.children).toHaveLength(1)
  })
})

describe('updateRule', () => {
  it('updates a rule field', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule, updateRule } = useQueryStore.getState()
    addRule(rootGroup.id)
    const rule = useQueryStore.getState().rootGroup.children[0]
    updateRule(rule.id, { value: 'Nigeria' })
    const updated = useQueryStore.getState().rootGroup.children[0]
    expect(updated.type === 'rule' && updated.value).toBe('Nigeria')
  })
})

describe('removeNode', () => {
  it('removes a rule from root', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule, removeNode } = useQueryStore.getState()
    addRule(rootGroup.id)
    const rule = useQueryStore.getState().rootGroup.children[0]
    removeNode(rule.id)
    expect(useQueryStore.getState().rootGroup.children).toHaveLength(0)
  })

  it('removes a nested group', () => {
    const { rootGroup, addGroup, removeNode } = useQueryStore.getState()
    addGroup(rootGroup.id)
    const child = useQueryStore.getState().rootGroup.children[0]
    removeNode(child.id)
    expect(useQueryStore.getState().rootGroup.children).toHaveLength(0)
  })
})

describe('toggleLogic', () => {
  it('toggles root group from AND to OR', () => {
    const { rootGroup, toggleLogic } = useQueryStore.getState()
    expect(rootGroup.logic).toBe('AND')
    toggleLogic(rootGroup.id)
    expect(useQueryStore.getState().rootGroup.logic).toBe('OR')
  })

  it('toggles back to AND', () => {
    const { rootGroup, toggleLogic } = useQueryStore.getState()
    toggleLogic(rootGroup.id)
    toggleLogic(rootGroup.id)
    expect(useQueryStore.getState().rootGroup.logic).toBe('AND')
  })
})

describe('toggleCollapse', () => {
  it('collapses and expands root group', () => {
    const { rootGroup, toggleCollapse } = useQueryStore.getState()
    expect(rootGroup.collapsed).toBe(false)
    toggleCollapse(rootGroup.id)
    expect(useQueryStore.getState().rootGroup.collapsed).toBe(true)
    toggleCollapse(rootGroup.id)
    expect(useQueryStore.getState().rootGroup.collapsed).toBe(false)
  })
})

describe('moveNode', () => {
  it('reorders two rules within the same group', () => {
    useQueryStore.getState().setSchema(schema)
    const state = useQueryStore.getState()
    state.addRule(state.rootGroup.id)
    state.addRule(state.rootGroup.id)
    const children = useQueryStore.getState().rootGroup.children
    const firstId  = children[0].id
    const secondId = children[1].id
    // Move first item to index 1
    useQueryStore.getState().moveNode(firstId, state.rootGroup.id, 1)
    const reordered = useQueryStore.getState().rootGroup.children
    expect(reordered[1].id).toBe(firstId)
    expect(reordered[0].id).toBe(secondId)
  })
})

describe('saveToHistory / loadFromHistory', () => {
  it('saves to history and can reload', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule } = useQueryStore.getState()
    addRule(rootGroup.id)
    useQueryStore.getState().saveToHistory('test snapshot')
    const { history } = useQueryStore.getState()
    expect(history).toHaveLength(1)
    expect(history[0].label).toBe('test snapshot')

    // Reset tree then reload
    useQueryStore.getState().reset()
    expect(useQueryStore.getState().rootGroup.children).toHaveLength(0)
    useQueryStore.getState().loadFromHistory(history[0].id)
    expect(useQueryStore.getState().rootGroup.children).toHaveLength(1)
  })

  it('caps history at 20 entries', () => {
    for (let i = 0; i < 25; i++) {
      useQueryStore.getState().saveToHistory(`entry ${i}`)
    }
    expect(useQueryStore.getState().history).toHaveLength(20)
  })
})

describe('savePreset / loadPreset / deletePreset', () => {
  it('saves and loads a preset', () => {
    useQueryStore.getState().setSchema(schema)
    const { rootGroup, addRule } = useQueryStore.getState()
    addRule(rootGroup.id)
    useQueryStore.getState().savePreset('my preset')
    const { presets } = useQueryStore.getState()
    expect(presets).toHaveLength(1)
    useQueryStore.getState().reset()
    useQueryStore.getState().loadPreset(presets[0].id)
    expect(useQueryStore.getState().rootGroup.children).toHaveLength(1)
  })

  it('deletes a preset', () => {
    useQueryStore.getState().savePreset('to delete')
    const { presets } = useQueryStore.getState()
    useQueryStore.getState().deletePreset(presets[0].id)
    expect(useQueryStore.getState().presets).toHaveLength(0)
  })
})

describe('importTree', () => {
  it('replaces rootGroup with imported tree', () => {
    const imported = {
      id: 'imported-root', type: 'group' as const,
      logic: 'OR' as const, collapsed: false,
      children: [
        { id: 'r1', type: 'rule' as const, field: 'age', operator: 'equals' as const, value: 30 }
      ],
    }
    useQueryStore.getState().importTree(imported)
    const state = useQueryStore.getState()
    expect(state.rootGroup.id).toBe('imported-root')
    expect(state.rootGroup.logic).toBe('OR')
    expect(state.rootGroup.children).toHaveLength(1)
  })
})
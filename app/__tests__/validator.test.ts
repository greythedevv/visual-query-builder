import { describe, it, expect } from 'vitest'
import { validateTree } from '@/app/lib/queryEngine/validator'
import { QueryGroup } from '@/app/lib/queryEngine/types'
import { SCHEMAS } from '@/app/lib/schema/schemas'

const schema = SCHEMAS[0] // users schema

function group(children: QueryGroup['children'] = []): QueryGroup {
  return { id: 'root', type: 'group', logic: 'AND', collapsed: false, children }
}

describe('validateTree', () => {
  it('returns no errors for valid single rule', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: 'name', operator: 'equals', value: 'Alice' }
    ])
    expect(validateTree(tree, schema)).toHaveLength(0)
  })

  it('catches missing field', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: '', operator: 'equals', value: 'x' }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'r1')).toBe(true)
  })

  it('catches missing value', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: 'name', operator: 'equals', value: '' }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'r1')).toBe(true)
  })

  it('does not require value for is_null', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: 'name', operator: 'is_null', value: null }
    ])
    expect(validateTree(tree, schema)).toHaveLength(0)
  })

  it('does not require value for is_not_null', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: 'name', operator: 'is_not_null', value: null }
    ])
    expect(validateTree(tree, schema)).toHaveLength(0)
  })

  it('catches operator incompatible with field type', () => {
    // "contains" is not valid for number field "age"
    const tree = group([
      { id: 'r1', type: 'rule', field: 'age', operator: 'contains', value: '5' }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'r1')).toBe(true)
  })

  it('catches empty nested group', () => {
    const tree = group([
      { id: 'g1', type: 'group', logic: 'AND', collapsed: false, children: [] }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'g1')).toBe(true)
  })

  it('catches unknown field key', () => {
    const tree = group([
      { id: 'r1', type: 'rule', field: 'nonexistent_field', operator: 'equals', value: 'x' }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'r1')).toBe(true)
  })

  it('validates recursively into nested groups', () => {
    const tree = group([
      {
        id: 'g1', type: 'group', logic: 'AND', collapsed: false,
        children: [
          { id: 'r1', type: 'rule', field: 'age', operator: 'contains', value: '5' }
        ]
      }
    ])
    const errors = validateTree(tree, schema)
    expect(errors.some(e => e.nodeId === 'r1')).toBe(true)
  })
})
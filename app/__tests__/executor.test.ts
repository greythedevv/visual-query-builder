import { describe, it, expect } from 'vitest'
import { executeQuery } from '@/app/lib/queryEngine/executor'
import { QueryGroup } from '@/app/lib/queryEngine/types'

const data = [
  { name: 'Alice', age: 28, status: 'active',   country: 'Nigeria', purchases: 14 },
  { name: 'Bob',   age: 17, status: 'inactive', country: 'UK',      purchases: 2  },
  { name: 'Carol', age: 34, status: 'active',   country: 'Nigeria', purchases: 22 },
  { name: 'Dan',   age: 41, status: 'pending',  country: 'USA',     purchases: 0  },
  { name: 'Eva',   age: 25, status: 'active',   country: 'Ghana',   purchases: 8  },
]

function group(logic: 'AND' | 'OR', children: QueryGroup['children']): QueryGroup {
  return { id: 'g', type: 'group', logic, collapsed: false, children }
}

it('returns all records for empty group', () => {
  expect(executeQuery(data, group('AND', []))).toHaveLength(5)
})

it('filters with equals', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'status', operator: 'equals', value: 'active' }])
  expect(executeQuery(data, q)).toHaveLength(3)
})

it('filters with greater_than', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'age', operator: 'greater_than', value: 25 }])
  const result = executeQuery(data, q)
  expect(result.every(r => (r.age as number) > 25)).toBe(true)
})

it('filters with less_than', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'age', operator: 'less_than', value: 20 }])
  expect(executeQuery(data, q)).toHaveLength(1)
})

it('filters with contains', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'name', operator: 'contains', value: 'al' }])
  const result = executeQuery(data, q)
  expect(result.map(r => r.name)).toContain('Alice')
})

it('filters with between', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'age', operator: 'between', value: [20, 30] }])
  const result = executeQuery(data, q)
  result.forEach(r => {
    expect((r.age as number)).toBeGreaterThanOrEqual(20)
    expect((r.age as number)).toBeLessThanOrEqual(30)
  })
})

it('filters with in_array', () => {
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'country', operator: 'in_array', value: ['Nigeria', 'Ghana'] }])
  expect(executeQuery(data, q)).toHaveLength(3)
})

it('applies AND logic — all conditions must match', () => {
  const q = group('AND', [
    { id: 'r1', type: 'rule', field: 'status',  operator: 'equals',       value: 'active' },
    { id: 'r2', type: 'rule', field: 'country', operator: 'equals',       value: 'Nigeria' },
    { id: 'r3', type: 'rule', field: 'age',     operator: 'greater_than', value: 20 },
  ])
  const result = executeQuery(data, q)
  expect(result).toHaveLength(2) // Alice and Carol
})

it('applies OR logic — at least one condition must match', () => {
  const q = group('OR', [
    { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'UK' },
    { id: 'r2', type: 'rule', field: 'age',     operator: 'greater_than', value: 40 },
  ])
  const result = executeQuery(data, q)
  expect(result.map(r => r.name)).toContain('Bob')
  expect(result.map(r => r.name)).toContain('Dan')
})

it('handles nested groups', () => {
  const q = group('OR', [
    {
      id: 'g1', type: 'group', logic: 'AND', collapsed: false,
      children: [
        { id: 'r1', type: 'rule', field: 'age',     operator: 'greater_than', value: 18 },
        { id: 'r2', type: 'rule', field: 'country', operator: 'equals',       value: 'Nigeria' },
      ],
    },
    { id: 'r3', type: 'rule', field: 'purchases', operator: 'equals', value: 0 },
  ])
  const result = executeQuery(data, q)
  // Nigeria adults: Alice, Carol. purchases=0: Dan
  expect(result).toHaveLength(3)
})

it('is_null matches empty strings and null', () => {
  const d = [{ name: 'X', email: null }, { name: 'Y', email: '' }, { name: 'Z', email: 'z@z.com' }]
  const q = group('AND', [{ id: 'r', type: 'rule', field: 'email', operator: 'is_null', value: null }])
  expect(executeQuery(d, q)).toHaveLength(2)
})
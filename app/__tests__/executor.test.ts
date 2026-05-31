import { describe, it, expect } from 'vitest'
import { executeQuery } from '@/app/lib/queryEngine/executor'
import { QueryGroup } from '@/app/lib/queryEngine/types'

const data = [
  { name: 'Alice', age: 25, status: 'active', country: 'Nigeria' },
  { name: 'Bob',   age: 17, status: 'inactive', country: 'UK' },
  { name: 'Carol', age: 32, status: 'active', country: 'Nigeria' },
]

it('filters by greater_than', () => {
  const query: QueryGroup = {
    id: 'g', type: 'group', logic: 'AND', collapsed: false,
    children: [{ id: 'r', type: 'rule', field: 'age', operator: 'greater_than', value: 18 }],
  }
  const result = executeQuery(data, query)
  expect(result).toHaveLength(2)
  expect(result.map(r => r.name)).toContain('Alice')
})

it('OR logic returns union', () => {
  const query: QueryGroup = {
    id: 'g', type: 'group', logic: 'OR', collapsed: false,
    children: [
      { id: 'r1', type: 'rule', field: 'country', operator: 'equals', value: 'UK' },
      { id: 'r2', type: 'rule', field: 'age', operator: 'greater_than', value: 30 },
    ],
  }
  const result = executeQuery(data, query)
  expect(result).toHaveLength(2) // Bob (UK) + Carol (age 32)
})
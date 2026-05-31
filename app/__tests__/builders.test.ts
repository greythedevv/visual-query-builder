import { describe, it, expect } from 'vitest'
import { buildSQL, buildMongo } from '@/app/lib/queryEngine/builders'
import { QueryGroup } from '@/app/lib/queryEngine/types'

const mockGroup = (): QueryGroup => ({
  id: 'root', type: 'group', logic: 'AND', collapsed: false,
  children: [
    { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
    { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
  ],
})

describe('buildSQL', () => {
  it('generates correct WHERE clause for AND group', () => {
    const sql = buildSQL(mockGroup())
    expect(sql).toContain("WHERE age > 18 AND status = 'active'")
  })
  it('handles empty group', () => {
    const empty: QueryGroup = { id: 'g', type: 'group', logic: 'AND', collapsed: false, children: [] }
    expect(buildSQL(empty)).toBe('SELECT * FROM records')
  })
})

describe('buildMongo', () => {
  it('generates $gt for greater_than', () => {
    const mongo = JSON.parse(buildMongo(mockGroup()))
    expect(mongo.$and).toBeDefined()
    expect(mongo.$and[0].age.$gt).toBe(18)
  })
})
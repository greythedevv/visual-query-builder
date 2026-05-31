import { describe, it, expect } from 'vitest'
import { buildSQL, buildMongo } from '@/app/lib/queryEngine/builders'
import { QueryGroup } from '@/app/lib/queryEngine/types'

function makeGroup(overrides?: Partial<QueryGroup>): QueryGroup {
  return {
    id: 'root', type: 'group',
    logic: 'AND', collapsed: false,
    children: [], ...overrides,
  }
}

describe('buildSQL', () => {
  it('returns bare SELECT for empty group', () => {
    expect(buildSQL(makeGroup())).toBe('SELECT * FROM records')
  })

  it('generates equals clause', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'status', operator: 'equals', value: 'active' }
    ]})
    expect(buildSQL(g)).toContain("status = 'active'")
  })

  it('generates greater_than clause', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 }
    ]})
    expect(buildSQL(g)).toContain('age > 18')
  })

  it('generates BETWEEN clause', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'between', value: [18, 35] }
    ]})
    expect(buildSQL(g)).toContain('age BETWEEN 18 AND 35')
  })

  it('generates IN clause', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'status', operator: 'in_array', value: ['active', 'pending'] }
    ]})
    expect(buildSQL(g)).toContain("status IN ('active', 'pending')")
  })

  it('generates IS NULL clause', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'email', operator: 'is_null', value: null }
    ]})
    expect(buildSQL(g)).toContain('email IS NULL')
  })

  it('generates LIKE for contains', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'name', operator: 'contains', value: 'john' }
    ]})
    expect(buildSQL(g)).toContain("name LIKE '%john%'")
  })

  it('joins AND conditions correctly', () => {
    const g = makeGroup({ logic: 'AND', children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ]})
    expect(buildSQL(g)).toContain('age > 18 AND')
  })

  it('joins OR conditions correctly', () => {
    const g = makeGroup({ logic: 'OR', children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ]})
    expect(buildSQL(g)).toContain('OR')
  })

  it('wraps nested groups in parentheses', () => {
    const g = makeGroup({ logic: 'OR', children: [
      {
        id: 'g1', type: 'group', logic: 'AND', collapsed: false,
        children: [
          { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
          { id: 'r2', type: 'rule', field: 'country', operator: 'equals', value: 'Nigeria' },
        ],
      },
      { id: 'r3', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ]})
    const sql = buildSQL(g)
    expect(sql).toContain('(')
    expect(sql).toContain('AND')
    expect(sql).toContain('OR')
  })

  it('uses custom table name', () => {
    expect(buildSQL(makeGroup(), 'users')).toContain('FROM users')
  })
})

describe('buildMongo', () => {
  it('returns empty object for empty group', () => {
    expect(JSON.parse(buildMongo(makeGroup()))).toEqual({})
  })

  it('generates $gt for greater_than', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 }
    ]})
    const m = JSON.parse(buildMongo(g))
    expect(m.age.$gt).toBe(18)
  })

  it('generates $and for AND group', () => {
    const g = makeGroup({ logic: 'AND', children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ]})
    const m = JSON.parse(buildMongo(g))
    expect(m.$and).toBeDefined()
    expect(Array.isArray(m.$and)).toBe(true)
  })

  it('generates $or for OR group', () => {
    const g = makeGroup({ logic: 'OR', children: [
      { id: 'r1', type: 'rule', field: 'age', operator: 'greater_than', value: 18 },
      { id: 'r2', type: 'rule', field: 'status', operator: 'equals', value: 'active' },
    ]})
    const m = JSON.parse(buildMongo(g))
    expect(m.$or).toBeDefined()
  })

  it('generates $regex for contains', () => {
    const g = makeGroup({ children: [
      { id: 'r1', type: 'rule', field: 'name', operator: 'contains', value: 'john' }
    ]})
    const m = JSON.parse(buildMongo(g))
    expect(m.name.$regex).toBe('john')
  })
})
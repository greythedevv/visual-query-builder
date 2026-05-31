import { QueryGroup, QueryNode } from './types'

function isValidNode(node: unknown): node is QueryNode {
  if (typeof node !== 'object' || node === null) return false
  const n = node as Record<string, unknown>
  if (typeof n.id !== 'string') return false
  if (n.type === 'rule') {
    return typeof n.field === 'string' && typeof n.operator === 'string'
  }
  if (n.type === 'group') {
    return (
      (n.logic === 'AND' || n.logic === 'OR') &&
      Array.isArray(n.children) &&
      (n.children as unknown[]).every(isValidNode)
    )
  }
  return false
}

export function validateImport(raw: unknown): QueryGroup {
  if (!isValidNode(raw) || raw.type !== 'group') {
    throw new Error('Invalid query JSON: root must be a group node')
  }
  return raw as QueryGroup
}
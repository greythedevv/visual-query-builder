import { QueryGroup, QueryNode, QueryRule } from './types'

function evaluateRule(record: Record<string, unknown>, rule: QueryRule): boolean {
  const val = record[rule.field]
  const { operator, value } = rule

  switch (operator) {
    case 'equals': {
      if (typeof val === 'boolean')
        return val === (value === true || value === 'true')
      if (typeof val === 'string' && typeof value === 'string')
        return val.toLowerCase() === value.toLowerCase()
      return val == value
    }
    case 'not_equals': {
      if (typeof val === 'boolean')
        return val !== (value === true || value === 'true')
      if (typeof val === 'string' && typeof value === 'string')
        return val.toLowerCase() !== value.toLowerCase()
      return val != value
    }
    case 'contains':    return String(val).toLowerCase().includes(String(value).toLowerCase())
    case 'starts_with': return String(val).toLowerCase().startsWith(String(value).toLowerCase())
    case 'greater_than': {
      const isDate = typeof value === 'string' && isNaN(Number(value))
      if (isDate) return String(val) > String(value)
      return Number(val) > Number(value)
    }
    case 'less_than': {
      const isDate = typeof value === 'string' && isNaN(Number(value))
      if (isDate) return String(val) < String(value)
      return Number(val) < Number(value)
    }
    case 'in_array':    return (value as string[]).includes(String(val))
    case 'between': {
      const [a, b] = value as [number | string, number | string]
      if (a === '' || b === '' || a == null || b == null) return true
      const isDate = typeof a === 'string' && isNaN(Number(a))
      if (isDate) {
        const strVal = String(val)
        return strVal >= String(a) && strVal <= String(b)
      }
      const n = Number(val)
      return n >= Number(a) && n <= Number(b)
    }
    case 'is_null':     return val == null || val === ''
    case 'is_not_null': return val != null && val !== ''
    case 'regex':       return new RegExp(String(value), 'i').test(String(val))
    default:            return true
  }
}

function evaluateNode(record: Record<string, unknown>, node: QueryNode): boolean {
  if (node.type === 'rule') return evaluateRule(record, node)
  return evaluateGroup(record, node)
}

function evaluateGroup(record: Record<string, unknown>, group: QueryGroup): boolean {
  if (group.children.length === 0) return true
  if (group.logic === 'AND') return group.children.every(c => evaluateNode(record, c))
  return group.children.some(c => evaluateNode(record, c))
}

export function executeQuery(
  data: Record<string, unknown>[],
  root: QueryGroup
): Record<string, unknown>[] {
  return data.filter(record => evaluateGroup(record, root))
}
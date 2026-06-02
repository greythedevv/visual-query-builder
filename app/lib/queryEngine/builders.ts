import { QueryGroup, QueryNode, QueryRule } from './types'

// Escape single quotes in SQL string values to prevent injection
function escapeSQLString(value: string): string {
  return String(value).replace(/'/g, "''")
}


function escapeSQLLike(value: string): string {
  return escapeSQLString(value).replace(/[\\%_]/g, '\\$&')
}

function ruleToSQL(rule: QueryRule): string {
  const { field, operator, value } = rule
  switch (operator) {
    case 'equals': {
       if (typeof value === 'boolean')
        return `${field} = ${value}`
      return `${field} = '${value}'`
    }
    case 'not_equals': {
      if (typeof value === 'boolean')
        return `${field} != ${value}`
      return `${field} != '${value}'`
    }
    case 'contains':     return `${field} LIKE '%${value}%'`
    case 'starts_with':  return `${field} LIKE '${value}%'`
    case 'greater_than': {
      const isDate = typeof value === 'string' && isNaN(Number(value))
      return isDate ? `${field} > '${value}'` : `${field} > ${value}`
    }
    case 'less_than': {
      const isDate = typeof value === 'string' && isNaN(Number(value))
      return isDate ? `${field} < '${value}'` : `${field} < ${value}`
    }
    case 'in_array':     return `${field} IN (${(value as string[]).map(v => `'${v}'`).join(', ')})`
    case 'between': {
      const [a, b] = value as [number | string, number | string]
      const isDate = typeof a === 'string' && isNaN(Number(a))
      return isDate
        ? `${field} BETWEEN '${a}' AND '${b}'`
        : `${field} BETWEEN ${a} AND ${b}`
    }
    case 'is_null':      return `${field} IS NULL`
    case 'is_not_null':  return `${field} IS NOT NULL`
    case 'regex':        return `${field} ~ '${escapeSQLString(String(value))}'`
    default:             return ''
  }
}

function groupToSQL(group: QueryGroup, depth = 0): string {
  const parts = group.children
    .map(child => nodeToSQL(child, depth + 1))
    .filter(Boolean)
  if (parts.length === 0) return ''
  const joined = parts.join(` ${group.logic} `)
  return depth > 0 ? `(${joined})` : joined
}

function nodeToSQL(node: QueryNode, depth = 0): string {
  return node.type === 'rule' ? ruleToSQL(node) : groupToSQL(node, depth)
}

export function buildSQL(root: QueryGroup, table = 'records'): string {
  const where = groupToSQL(root)
  return where ? `SELECT * FROM ${table}\nWHERE ${where}` : `SELECT * FROM ${table}`
}

function ruleToMongo(rule: QueryRule): object {
  const { field, operator, value } = rule
  switch (operator) {
    case 'equals':       return { [field]: value }
    case 'not_equals':   return { [field]: { $ne: value } }
    case 'contains':     return { [field]: { $regex: value, $options: 'i' } }
    case 'starts_with':  return { [field]: { $regex: `^${value}`, $options: 'i' } }
    case 'greater_than': return { [field]: { $gt: value } }
    case 'less_than':    return { [field]: { $lt: value } }
    case 'in_array':     return { [field]: { $in: value } }
    case 'between': {
      const [a, b] = value as [number | string, number | string]
      return { [field]: { $gte: a, $lte: b } }
    }
    case 'is_null':      return { [field]: null }
    case 'is_not_null':  return { [field]: { $ne: null } }
    case 'regex':        return { [field]: { $regex: value } }
    default:             return {}
  }
}

function groupToMongo(group: QueryGroup): object {
  const parts = group.children.map(c =>
    c.type === 'rule' ? ruleToMongo(c) : groupToMongo(c)
  )
  if (parts.length === 0) return {}
  if (parts.length === 1) return parts[0]
  return { [`$${group.logic.toLowerCase()}`]: parts }
}

export function buildMongo(root: QueryGroup): string {
  return JSON.stringify(groupToMongo(root), null, 2)
}

import { QueryGroup, QueryNode, Schema } from './types'
import { OPERATORS_BY_TYPE } from '../schema/operators'

export interface ValidationError {
  nodeId: string
  message: string
}

function validateNode(node: QueryNode, schema: Schema, errors: ValidationError[]): void {
  if (node.type === 'rule') {
    if (!node.field) {
      errors.push({ nodeId: node.id, message: 'Field is required' })
      return
    }
    const field = schema.fields.find(f => f.key === node.field)
    if (!field) {
      errors.push({ nodeId: node.id, message: `Unknown field: ${node.field}` })
      return
    }
    const allowedOps = OPERATORS_BY_TYPE[field.type]
    if (!allowedOps.includes(node.operator)) {
      errors.push({ nodeId: node.id, message: `Operator "${node.operator}" not valid for ${field.type}` })
      return
    }
    if (['is_null', 'is_not_null'].includes(node.operator)) return

    if (node.operator === 'between') {
      const val = node.value as [number, number] | null
      if (!Array.isArray(val) || val.length !== 2) {
        errors.push({ nodeId: node.id, message: 'Between requires two values' })
      } else if (val[0] > val[1]) {
        errors.push({ nodeId: node.id, message: 'Between: min must be ≤ max' })
      }
      return
    }

    if (node.operator === 'in_array') {
      const val = node.value as string[] | null
      if (!Array.isArray(val) || val.length === 0) {
        errors.push({ nodeId: node.id, message: 'Select at least one value' })
      }
      return
    }

    if (node.value === '' || node.value === null || node.value === undefined) {
      errors.push({ nodeId: node.id, message: 'Value is required' })
    }
  } else {
    if (node.children.length === 0) {
      errors.push({ nodeId: node.id, message: 'Group must have at least one condition' })
    }
    node.children.forEach(c => validateNode(c, schema, errors))
  }
}

export function validateTree(root: QueryGroup, schema: Schema): ValidationError[] {
  const errors: ValidationError[] = []
  validateNode(root, schema, errors)
  return errors
}
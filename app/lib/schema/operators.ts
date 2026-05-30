import { FieldType, Operator } from '../queryEngine/types'

export const OPERATORS_BY_TYPE: Record<FieldType, Operator[]> = {
  string:  ['equals','not_equals','contains','starts_with','is_null','is_not_null','regex'],
  number:  ['equals','not_equals','greater_than','less_than','between','is_null','is_not_null'],
  boolean: ['equals','not_equals'],
  date:    ['equals','not_equals','greater_than','less_than','between','is_null','is_not_null'],
  enum:    ['equals','not_equals','in_array','is_null','is_not_null'],
}

export const OPERATOR_LABELS: Record<Operator, string> = {
  equals:       'equals',
  not_equals:   'does not equal',
  contains:     'contains',
  starts_with:  'starts with',
  greater_than: 'is greater than',
  less_than:    'is less than',
  in_array:     'is one of',
  between:      'is between',
  is_null:      'is empty',
  is_not_null:  'is not empty',
  regex:        'matches regex',
}
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum'

export type Operator =
  | 'equals' | 'not_equals' | 'contains' | 'starts_with'
  | 'greater_than' | 'less_than' | 'in_array' | 'between'
  | 'is_null' | 'is_not_null' | 'regex'

export interface SchemaField {
  key: string
  label: string
  type: FieldType
  enumValues?: string[]
}

export interface Schema {
  id: string
  name: string
  fields: SchemaField[]
}

export type LogicOperator = 'AND' | 'OR'

export interface QueryRule {
  id: string
  type: 'rule'
  field: string
  operator: Operator
  value?: string | number | boolean | string[] | [number, number] | [string, string] | null
}

export interface QueryGroup {
  id: string
  type: 'group'
  logic: LogicOperator
  collapsed: boolean
  children: QueryNode[]
}

export type QueryNode = QueryRule | QueryGroup

export interface QueryState {
  schema: Schema | null
  rootGroup: QueryGroup
  history: { id: string; tree: QueryGroup; timestamp: number; label: string }[]
  presets: { id: string; name: string; tree: QueryGroup }[]
}
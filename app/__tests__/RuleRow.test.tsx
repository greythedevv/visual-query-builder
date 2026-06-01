import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RuleRow } from '@/app/components/QueryBuilder/RuleRow'
import { QueryRule } from '@/app/lib/queryEngine/types'
import * as store from '@/app/store/queryStore'
import { SCHEMAS } from '@/app/lib/schema/schemas'

vi.mock('@/app/store/queryStore', () => ({
  useQueryStore: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

const schema = SCHEMAS[0]

const mockStore = {
  schema,
  updateRule: vi.fn(),
  removeNode: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(store.useQueryStore).mockReturnValue(mockStore as unknown)
})

function makeRule(overrides?: Partial<QueryRule>): QueryRule {
  return {
    id: 'r1', type: 'rule',
    field: 'name', operator: 'equals', value: 'Alice',
    ...overrides,
  }
}

describe('RuleRow', () => {
  it('renders field selector with correct value', () => {
    render(<RuleRow rule={makeRule()} />)
    const selects = screen.getAllByRole('combobox')
    expect((selects[0] as HTMLSelectElement).value).toBe('name')
  })

  it('renders operator selector with correct value', () => {
    render(<RuleRow rule={makeRule()} />)
    const selects = screen.getAllByRole('combobox')
    expect((selects[1] as HTMLSelectElement).value).toBe('equals')
  })

  it('renders value text input for string field', () => {
    render(<RuleRow rule={makeRule()} />)
    const input = screen.getByDisplayValue('Alice')
    expect(input).toBeTruthy()
  })

  it('calls updateRule when field changes', () => {
    render(<RuleRow rule={makeRule()} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'email' } })
    expect(mockStore.updateRule).toHaveBeenCalledWith('r1', expect.objectContaining({ field: 'email' }))
  })

  it('calls updateRule when operator changes', () => {
    render(<RuleRow rule={makeRule()} />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'contains' } })
    expect(mockStore.updateRule).toHaveBeenCalledWith('r1', expect.objectContaining({ operator: 'contains' }))
  })

  it('calls updateRule when value input changes', () => {
    render(<RuleRow rule={makeRule()} />)
    const input = screen.getByDisplayValue('Alice')
    fireEvent.change(input, { target: { value: 'Bob' } })
    expect(mockStore.updateRule).toHaveBeenCalledWith('r1', { value: 'Bob' })
  })

  it('calls removeNode when delete button clicked', () => {
    render(<RuleRow rule={makeRule()} />)
    fireEvent.click(screen.getByLabelText('Delete rule'))
    expect(mockStore.removeNode).toHaveBeenCalledWith('r1')
  })

  it('hides value input for is_null operator', () => {
    render(<RuleRow rule={makeRule({ operator: 'is_null', value: null })} />)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('renders number input for number field', () => {
    render(<RuleRow rule={makeRule({ field: 'age', operator: 'equals', value: 25 })} />)
    const input = screen.getByDisplayValue('25')
    expect((input as HTMLInputElement).type).toBe('number')
  })

  it('renders date input for date field', () => {
    render(<RuleRow rule={makeRule({ field: 'createdAt', operator: 'equals', value: '2024-01-01' })} />)
    const input = screen.getByDisplayValue('2024-01-01')
    expect((input as HTMLInputElement).type).toBe('date')
  })

  it('renders enum dropdown for enum field', () => {
    render(<RuleRow rule={makeRule({ field: 'status', operator: 'equals', value: 'active' })} />)
    const selects = screen.getAllByRole('combobox')
    // 3 selects: field, operator, enum value
    expect(selects.length).toBe(3)
  })

  it('renders two number inputs for between operator', () => {
    render(<RuleRow rule={makeRule({ field: 'age', operator: 'between', value: [18, 35] })} />)
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs.length).toBe(2)
  })

  it('applies error border when hasError is true', () => {
    const { container } = render(<RuleRow rule={makeRule()} hasError />)
    // Error state uses the design-system token, not a literal red class
    expect(container.innerHTML).toContain('var(--color-bad)')
  })
})
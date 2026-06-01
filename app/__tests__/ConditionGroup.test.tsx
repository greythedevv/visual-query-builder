import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConditionGroup } from '@/app/components/QueryBuilder/ConditionGroup'
import { QueryGroup } from '@/app/lib/queryEngine/types'
import * as store from '@/app/store/queryStore'

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
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
}))

const mockStore = {
  addRule:        vi.fn(),
  addGroup:       vi.fn(),
  removeNode:     vi.fn(),
  toggleLogic:    vi.fn(),
  toggleCollapse: vi.fn(),
}

const group = (children: QueryGroup['children'] = []): QueryGroup => ({
  id: 'g1', type: 'group',
  logic: 'AND', collapsed: false, children,
})

beforeEach(() => {
  vi.mocked(store.useQueryStore).mockReturnValue(mockStore as unknown)
})

describe('ConditionGroup', () => {
  it('renders AND logic button', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    expect(screen.getByText('AND')).toBeTruthy()
  })

  it('clicking logic button calls toggleLogic', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    fireEvent.click(screen.getByText('AND'))
    expect(mockStore.toggleLogic).toHaveBeenCalledWith('g1')
  })

  it('shows Add Rule button', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    expect(screen.getByLabelText('Add condition rule')).toBeTruthy()
  })

  it('clicking Add Rule calls addRule with group id', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    fireEvent.click(screen.getByLabelText('Add condition rule'))
    expect(mockStore.addRule).toHaveBeenCalledWith('g1')
  })

  it('clicking Add Group calls addGroup with group id', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    fireEvent.click(screen.getByLabelText('Add nested group'))
    expect(mockStore.addGroup).toHaveBeenCalledWith('g1')
  })

  it('does not render Remove button on root group', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    expect(screen.queryByLabelText('Remove group')).toBeNull()
  })

  it('renders Remove button on non-root group', () => {
    render(<ConditionGroup group={group()} depth={1} isRoot={false} />)
    expect(screen.getByLabelText('Remove group')).toBeTruthy()
  })

  it('shows empty state message when no children', () => {
    render(<ConditionGroup group={group()} depth={0} isRoot />)
    expect(screen.getByTestId('empty-group')).toBeTruthy()
  })

  it('hides children when collapsed', () => {
    const collapsed = { ...group(), collapsed: true, children: [
      { id: 'r1', type: 'rule' as const, field: 'name', operator: 'equals' as const, value: 'x' }
    ]}
    render(<ConditionGroup group={collapsed} depth={0} isRoot />)
    expect(screen.queryByText(/empty group/i)).toBeNull()
  })
})
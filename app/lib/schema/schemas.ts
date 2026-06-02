import { Schema } from '../queryEngine/types'

export const SCHEMAS: Schema[] = [
  {
    id: 'users',
    name: 'Users',
    fields: [
      { key: 'name',      label: 'Name',      type: 'string' },
      { key: 'email',     label: 'Email',      type: 'string' },
      { key: 'age',       label: 'Age',        type: 'number' },
      { key: 'country',   label: 'Country',    type: 'string' },
      { key: 'status',    label: 'Status',     type: 'enum', enumValues: ['active', 'inactive', 'pending'] },
      { key: 'purchases', label: 'Purchases',  type: 'number' },
      { key: 'createdAt', label: 'Created At', type: 'date' },
    ],
  },
  {
    id: 'orders',
    name: 'Orders',
    fields: [
      { key: 'orderId', label: 'Order ID', type: 'string' },
      { key: 'amount',  label: 'Amount',   type: 'number' },
      { key: 'status',  label: 'Status',   type: 'enum', enumValues: ['pending', 'shipped', 'delivered', 'cancelled'] },
      { key: 'date',    label: 'Date',     type: 'date' },
      { key: 'country', label: 'Country',  type: 'string' },
    ],
  },
  {
    id: 'products',
    name: 'Products',
    fields: [
      { key: 'name',      label: 'Name',      type: 'string' },
      { key: 'category',  label: 'Category',  type: 'enum', enumValues: ['electronics', 'sports', 'kitchen'] },
      { key: 'price',     label: 'Price',     type: 'number' },
      { key: 'inventory', label: 'Inventory', type: 'number' },
      { key: 'inStock',   label: 'In Stock',  type: 'boolean' },
    ],
  },
]
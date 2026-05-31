import { usersData } from './users'
import { ordersData } from './orders'
import { productsData } from './products'

export const MOCK_DATA: Record<string, Record<string, unknown>[]> = {
  users:    usersData,
  orders:   ordersData,
  products: productsData,
}
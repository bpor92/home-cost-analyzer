export * from './database'

export interface User {
  id: string
  email?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface FilterOptions {
  dateFrom?: string
  dateTo?: string
  category?: string
  minAmount?: number
  maxAmount?: number
}

export interface MenuItem {
  name: string
  path: string
  icon: string
  badge?: number
}
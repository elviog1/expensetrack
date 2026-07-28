export interface Wallet {
  id: string
  name: string
  balance: number
  color: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Expense {
  id: string
  walletId: string
  categoryId: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface Deposit {
  id: string
  walletId: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Movement {
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  createdAt: string
  walletId: string
  walletName: string
  walletColor: string
  categoryName?: string
  categoryIcon?: string
}
import type { Wallet, Category, Expense, Deposit } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Error: ${res.status}`)
  return res.json()
}

export const api = {
  wallets: {
    getAll: () => request<Wallet[]>('/wallets'),
    getById: (id: string) => request<Wallet>(`/wallets/${id}`),
    create: (data: Omit<Wallet, 'id'>) =>
      request<Wallet>('/wallets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Wallet>) =>
      request<Wallet>(`/wallets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/wallets/${id}`, { method: 'DELETE' }),
  },
  categories: {
    getAll: () => request<Category[]>('/categories'),
  },
  expenses: {
    getAll: () => request<Expense[]>('/expenses'),
    create: (data: Omit<Expense, 'id'>) =>
      request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Expense>) =>
      request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/expenses/${id}`, { method: 'DELETE' }),
  },
  deposits: {
    getAll: () => request<Deposit[]>('/deposits'),
    create: (data: Omit<Deposit, 'id'>) =>
      request<Deposit>('/deposits', { method: 'POST', body: JSON.stringify(data) }),
  },
}
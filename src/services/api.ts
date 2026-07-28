import type { Wallet, Expense, Deposit } from '../types'
import { getCollection, setCollection } from './localDb'

function generateId(): string {
  return crypto.randomUUID().slice(0, 8)
}

export const api = {
  wallets: {
    getAll: () => Promise.resolve(getCollection('wallets')),
    getById: (id: string) =>
      Promise.resolve(getCollection('wallets').find((w) => w.id === id)!),
    create: (data: Omit<Wallet, 'id'>) => {
      const wallets = getCollection('wallets')
      const wallet: Wallet = { ...data, id: generateId() }
      setCollection('wallets', [...wallets, wallet])
      return Promise.resolve(wallet)
    },
    update: (id: string, data: Partial<Wallet>) => {
      const wallets = getCollection('wallets')
      const idx = wallets.findIndex((w) => w.id === id)
      if (idx === -1) throw new Error('Wallet not found')
      wallets[idx] = { ...wallets[idx], ...data }
      setCollection('wallets', [...wallets])
      return Promise.resolve(wallets[idx])
    },
    delete: (id: string) => {
      const wallets = getCollection('wallets').filter((w) => w.id !== id)
      setCollection('wallets', wallets)
      return Promise.resolve()
    },
  },
  categories: {
    getAll: () => Promise.resolve(getCollection('categories')),
  },
  expenses: {
    getAll: () => Promise.resolve(getCollection('expenses')),
    create: (data: Omit<Expense, 'id'>) => {
      const expenses = getCollection('expenses')
      const expense: Expense = { ...data, id: generateId() }
      setCollection('expenses', [...expenses, expense])
      return Promise.resolve(expense)
    },
    update: (id: string, data: Partial<Expense>) => {
      const expenses = getCollection('expenses')
      const idx = expenses.findIndex((e) => e.id === id)
      if (idx === -1) throw new Error('Expense not found')
      expenses[idx] = { ...expenses[idx], ...data }
      setCollection('expenses', [...expenses])
      return Promise.resolve(expenses[idx])
    },
    delete: (id: string) => {
      const expenses = getCollection('expenses').filter((e) => e.id !== id)
      setCollection('expenses', expenses)
      return Promise.resolve()
    },
  },
  deposits: {
    getAll: () => Promise.resolve(getCollection('deposits')),
    create: (data: Omit<Deposit, 'id'>) => {
      const deposits = getCollection('deposits')
      const deposit: Deposit = { ...data, id: generateId() }
      setCollection('deposits', [...deposits, deposit])
      return Promise.resolve(deposit)
    },
  },
}

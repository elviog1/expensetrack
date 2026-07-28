import { create } from 'zustand'
import { api } from '../services/api'
import { getLocalDateString } from '../utils/helpers'
import type { Wallet, Category, Expense, Deposit, Period, Movement } from '../types'

interface AppState {
  wallets: Wallet[]
  categories: Category[]
  expenses: Expense[]
  deposits: Deposit[]
  loaded: boolean
  error: string | null

  loadData: () => Promise<void>
  addWallet: (data: Omit<Wallet, 'id'>) => Promise<void>
  updateWallet: (id: string, data: Partial<Wallet>) => Promise<void>
  deleteWallet: (id: string) => Promise<void>
  depositToWallet: (id: string, amount: number, description?: string) => Promise<void>

  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>

  getWalletBalance: (walletId: string) => number
  totalBalance: () => number
  totalExpenses: () => number
  expensesByPeriod: (period: Period, walletId?: string, month?: string) => Expense[]
  expensesByCategory: () => { name: string; icon: string; total: number }[]
  expensesByWallet: () => { name: string; color: string; total: number }[]
  allMovements: () => Movement[]
}


export const useStore = create<AppState>((set, get) => ({
  wallets: [],
  categories: [],
  expenses: [],
  deposits: [],
  loaded: false,
  error: null,

  loadData: async () => {
    try {
      const [wallets, categories, expenses, deposits] = await Promise.all([
        api.wallets.getAll(),
        api.categories.getAll(),
        api.expenses.getAll(),
        api.deposits.getAll(),
      ])
      set({ wallets, categories, expenses, deposits, loaded: true, error: null })
    } catch (err) {
      console.error('Error cargando datos:', err)
      set({ loaded: true, error: 'No se pudo conectar al servidor. Verifica que json-server este corriendo.' })
    }
  },

  addWallet: async (data) => {
    await api.wallets.create(data)
    const wallets = await api.wallets.getAll()
    set({ wallets })
  },

  updateWallet: async (id, data) => {
    await api.wallets.update(id, data)
    const wallets = await api.wallets.getAll()
    set({ wallets })
  },

  deleteWallet: async (id) => {
    await api.wallets.delete(id)
    const wallets = await api.wallets.getAll()
    set({ wallets })
  },

  depositToWallet: async (id, amount, description) => {
    const wallet = get().wallets.find((w) => String(w.id) === String(id))
    if (!wallet || !wallet.name) return
    await api.wallets.update(String(id), { balance: wallet.balance + amount })
    await api.deposits.create({
      walletId: String(id),
      amount,
      description: description || 'Ingreso',
      date: getLocalDateString(),
      createdAt: new Date().toISOString(),
    })
    const [wallets, deposits] = await Promise.all([
      api.wallets.getAll(),
      api.deposits.getAll(),
    ])
    set({ wallets, deposits })
  },

  addExpense: async (data) => {
    await api.expenses.create({ ...data, createdAt: new Date().toISOString() })
    const expenses = await api.expenses.getAll()
    set({ expenses })
  },

  deleteExpense: async (id) => {
    await api.expenses.delete(id)
    const expenses = await api.expenses.getAll()
    set({ expenses })
  },

  getWalletBalance: (walletId) => {
    const { wallets, expenses } = get()
    const wid = String(walletId)
    const wallet = wallets.find((w) => String(w.id) === wid)
    if (!wallet) return 0
    const spent = expenses
      .filter((e) => String(e.walletId) === wid)
      .reduce((sum, e) => sum + e.amount, 0)
    return wallet.balance - spent
  },

  totalBalance: () => {
    const { wallets, expenses } = get()
    return wallets.reduce((sum, w) => {
      const spent = expenses
        .filter((e) => String(e.walletId) === String(w.id))
        .reduce((s, e) => s + e.amount, 0)
      return sum + (w.balance - spent)
    }, 0)
  },

  totalExpenses: () => {
    return get().expenses.reduce((sum, e) => sum + e.amount, 0)
  },

  expensesByPeriod: (period, walletId, month) => {
    const { expenses } = get()

    let filtered: Expense[]
    if (period === 'daily') {
      const today = getLocalDateString()
      filtered = expenses.filter((e) => e.date === today)
    } else if (period === 'weekly') {
      const now = new Date()
      const dayOfWeek = (now.getDay() + 6) % 7
      const monday = new Date(now)
      monday.setDate(now.getDate() - dayOfWeek)
      const y = monday.getFullYear()
      const m = String(monday.getMonth() + 1).padStart(2, '0')
      const day = String(monday.getDate()).padStart(2, '0')
      const startDate = `${y}-${m}-${day}`
      filtered = expenses.filter((e) => e.date >= startDate)
    } else {
      const monthPrefix = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      filtered = expenses.filter((e) => e.date.startsWith(monthPrefix))
    }

    return filtered
      .filter((e) => !walletId || walletId === 'all' || e.walletId === walletId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  expensesByCategory: () => {
    const { categories, expenses } = get()
    return categories
      .map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        total: expenses
          .filter((e) => e.categoryId === cat.id)
          .reduce((s, e) => s + e.amount, 0),
      }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
  },

  expensesByWallet: () => {
    const { wallets, expenses } = get()
    return wallets.map((w) => ({
      name: w.name,
      color: w.color,
      total: expenses
        .filter((e) => String(e.walletId) === String(w.id))
        .reduce((s, e) => s + e.amount, 0),
    }))
  },

  allMovements: () => {
    const { deposits, expenses, wallets, categories } = get()

    const incomeMovements: Movement[] = deposits.map((d) => {
      const wallet = wallets.find((w) => String(w.id) === String(d.walletId))
      return {
        type: 'income' as const,
        amount: d.amount,
        description: d.description,
        date: d.date,
        createdAt: d.createdAt,
        walletId: d.walletId,
        walletName: wallet?.name ?? 'N/A',
        walletColor: wallet?.color ?? '#888',
      }
    })

    const expenseMovements: Movement[] = expenses.map((e) => {
      const wallet = wallets.find((w) => String(w.id) === String(e.walletId))
      const category = categories.find((c) => c.id === e.categoryId)
      return {
        type: 'expense' as const,
        amount: e.amount,
        description: e.description,
        date: e.date,
        createdAt: e.createdAt,
        walletId: e.walletId,
        walletName: wallet?.name ?? 'N/A',
        walletColor: wallet?.color ?? '#888',
        categoryName: category?.name,
        categoryIcon: category?.icon,
      }
    })

    return [...incomeMovements, ...expenseMovements]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
}))
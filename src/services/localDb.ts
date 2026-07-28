const STORAGE_KEY = 'expensetrack_db'

interface SeedWallet { id: string; name: string; balance: number; color: string; createdAt: string }
interface SeedCategory { id: string; name: string; icon: string }
interface SeedExpense { id: string; walletId: string; categoryId: string; amount: number; description: string; date: string; createdAt: string }
interface SeedDeposit { id: string; walletId: string; amount: number; description: string; date: string; createdAt: string }

interface Db {
  wallets: SeedWallet[]
  categories: SeedCategory[]
  expenses: SeedExpense[]
  deposits: SeedDeposit[]
}

const SEED: Db = {
  wallets: [],
  categories: [
    { id: '1', name: 'Alimentacion', icon: '🍔' },
    { id: '2', name: 'Transporte', icon: '🚗' },
    { id: '3', name: 'Entretenimiento', icon: '🎮' },
    { id: '4', name: 'Servicios', icon: '📱' },
    { id: '5', name: 'Salud', icon: '💊' },
    { id: '6', name: 'Educacion', icon: '📚' },
    { id: '7', name: 'Otros', icon: '📦' },
  ],
  expenses: [],
  deposits: [],
}

function load(): Db {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  save(SEED)
  return SEED
}

function save(data: Db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCollection<K extends keyof Db>(name: K): Db[K] {
  return load()[name]
}

export function setCollection<K extends keyof Db>(name: K, data: Db[K]) {
  const db = load()
  db[name] = data
  save(db)
}

export function resetDb() {
  localStorage.removeItem(STORAGE_KEY)
}

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
  wallets: [
    { id: '1', name: 'MercadoPago', balance: 12000, color: '#f8fb46', createdAt: '2026-07-27' },
    { id: '2', name: 'Cuenta DNI', balance: 22000, color: '#3ecc7b', createdAt: '2026-07-27' },
    { id: 'km9sJsQ', name: 'BBVA', balance: 10000, color: '#0004ff', createdAt: '2026-07-28' },
  ],
  categories: [
    { id: '1', name: 'Alimentacion', icon: '🍔' },
    { id: '2', name: 'Transporte', icon: '🚗' },
    { id: '3', name: 'Entretenimiento', icon: '🎮' },
    { id: '4', name: 'Servicios', icon: '📱' },
    { id: '5', name: 'Salud', icon: '💊' },
    { id: '6', name: 'Educacion', icon: '📚' },
    { id: '7', name: 'Otros', icon: '📦' },
  ],
  expenses: [
    { id: '1', walletId: '1', categoryId: '1', amount: 2000, description: 'milanesa', date: '2026-07-21', createdAt: '2026-07-28T04:20:27.656Z' },
    { id: '2', walletId: '1', categoryId: '2', amount: 2000, description: 'sube', date: '2026-07-26', createdAt: '2026-07-28T04:20:58.881Z' },
    { id: '3', walletId: '2', categoryId: '1', amount: 1000, description: 'pollo', date: '2026-07-27', createdAt: '2026-07-28T04:21:21.345Z' },
    { id: '4', walletId: 'km9sJsQ', categoryId: '3', amount: 2000, description: 'IA', date: '2026-07-31', createdAt: '2026-07-28T04:21:50.220Z' },
    { id: '5', walletId: '2', categoryId: '5', amount: 1500, description: 'Paracetamol', date: '2026-08-02', createdAt: '2026-07-28T04:22:23.451Z' },
    { id: '6', walletId: '2', categoryId: '7', amount: 2000, description: 'papel', date: '2026-08-04', createdAt: '2026-07-28T04:23:20.751Z' },
    { id: '7', walletId: 'km9sJsQ', categoryId: '5', amount: 100, description: 'droga', date: '2026-07-28', createdAt: '2026-07-28T04:24:15.461Z' },
    { id: '8', walletId: '1', categoryId: '1', amount: 1000, description: 'papas', date: '2026-07-28', createdAt: '2026-07-28T04:38:23.656Z' },
  ],
  deposits: [
    { id: '1', walletId: '1', amount: 12000, description: 'Saldo inicial', date: '2026-07-27', createdAt: '2026-07-27T08:00:00.000Z' },
    { id: '2', walletId: '2', amount: 20000, description: 'Saldo inicial', date: '2026-07-27', createdAt: '2026-07-27T09:00:00.000Z' },
    { id: 'CvtDKAf', walletId: 'km9sJsQ', amount: 5000, description: 'Ingreso', date: '2026-07-28', createdAt: '2026-07-28T03:44:00.000Z' },
    { id: '2lmue0m', walletId: 'km9sJsQ', amount: 4000, description: 'Pase de saldo', date: '2026-07-28', createdAt: '2026-07-28T03:45:00.000Z' },
    { id: '01Gw8Y9', walletId: 'km9sJsQ', amount: 1000, description: 'Ingreso', date: '2026-07-28', createdAt: '2026-07-28T03:47:39.044Z' },
    { id: 'ROHXy49', walletId: '2', amount: 2000, description: 'chamba', date: '2026-07-28', createdAt: '2026-07-28T03:58:22.893Z' },
  ],
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

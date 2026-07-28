import { useState } from 'react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import { formatCurrency, formatDate, getLocalDateString } from '../utils/helpers'
import type { Period } from '../types'

export default function ExpensesPage() {
  const wallets = useStore((s) => s.wallets)
  const categories = useStore((s) => s.categories)
  const expenses = useStore((s) => s.expenses)
  const expensesByPeriod = useStore((s) => s.expensesByPeriod)
  const addExpense = useStore((s) => s.addExpense)
  const deleteExpense = useStore((s) => s.deleteExpense)

  const [period, setPeriod] = useState<Period>('monthly')
  const [walletFilter, setWalletFilter] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ walletId: '', categoryId: '', amount: '', description: '', date: getLocalDateString() })

  const filtered = expensesByPeriod(period, walletFilter, period === 'monthly' ? selectedMonth : undefined)
  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon || ''
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || ''
  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await addExpense({
      walletId: form.walletId,
      categoryId: form.categoryId,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
      date: form.date,
    })
    setModalOpen(false)
    setForm({ walletId: '', categoryId: '', amount: '', description: '', date: getLocalDateString() })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Eliminar este gasto?')) await deleteExpense(id)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Gastos</h1>
        <button onClick={() => setModalOpen(true)} className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nuevo Gasto
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p ? 'bg-accent-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {p === 'daily' ? 'Diario' : p === 'weekly' ? 'Semanal' : 'Mensual'}
            </button>
          ))}
        </div>
        <select value={walletFilter} onChange={(e) => setWalletFilter(e.target.value)} className="bg-dark-800 border border-dark-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-accent-500">
          <option value="all">Todas las billeteras</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        {period === 'monthly' && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-dark-800 border border-dark-600 text-gray-300 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-accent-500"
          />
        )}
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400 text-sm">{filtered.length} de {expenses.length} gasto{expenses.length !== 1 ? 's' : ''}</p>
          <p className="text-danger-500 font-bold whitespace-nowrap">-{formatCurrency(total)}</p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Sin gastos en este periodo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between py-3 border-b border-dark-600 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-base">
                    {getCategoryIcon(exp.categoryId)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{exp.description}</p>
                    <p className="text-gray-500 text-xs">{getCategoryName(exp.categoryId)} · {getWalletName(exp.walletId)} · {formatDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-danger-500 font-medium text-sm whitespace-nowrap">-{formatCurrency(exp.amount)}</span>
                  <button onClick={() => handleDelete(exp.id)} className="text-gray-500 hover:text-danger-500 text-xs transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Gasto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Billetera</label>
            <select value={form.walletId} onChange={(e) => setForm({ ...form, walletId: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required>
              <option value="">Seleccionar...</option>
              {wallets.map((w) => (<option key={w.id} value={w.id}>{w.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Categoria</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required>
              <option value="">Seleccionar...</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monto</label>
            <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripcion</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required />
          </div>
          <button type="submit" className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Registrar Gasto
          </button>
        </form>
      </Modal>
    </div>
  )
}
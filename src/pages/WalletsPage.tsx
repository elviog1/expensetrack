import { useState } from 'react'
import { useStore } from '../store'
import Modal from '../components/Modal'
import { formatCurrency, getLocalDateString } from '../utils/helpers'

export default function WalletsPage() {
  const wallets = useStore((s) => s.wallets)
  const addWallet = useStore((s) => s.addWallet)
  const updateWallet = useStore((s) => s.updateWallet)
  const deleteWallet = useStore((s) => s.deleteWallet)
  const depositToWallet = useStore((s) => s.depositToWallet)
  const transferBetweenWallets = useStore((s) => s.transferBetweenWallets)
  const getWalletBalance = useStore((s) => s.getWalletBalance)

  const [modalOpen, setModalOpen] = useState(false)
  const [depositModal, setDepositModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [depositWalletId, setDepositWalletId] = useState('')
  const [form, setForm] = useState({ name: '', balance: '', color: '#6366f1' })
  const [depositAmount, setDepositAmount] = useState('')
  const [depositDescription, setDepositDescription] = useState('')
  const [transfer, setTransfer] = useState({ fromId: '', toId: '', amount: '', description: '' })

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', balance: '', color: '#6366f1' })
    setModalOpen(true)
  }

  const openEdit = (id: string) => {
    const w = wallets.find((w) => w.id === id)
    if (!w) return
    setEditing(id)
    setForm({ name: w.name, balance: String(w.balance), color: w.color })
    setModalOpen(true)
  }

  const openDeposit = (id: string) => {
    setDepositWalletId(id)
    setDepositAmount('')
    setDepositDescription('')
    setDepositModal(true)
  }

  const openTransfer = (id: string) => {
    setTransfer({ fromId: id, toId: '', amount: '', description: '' })
    setTransferModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: form.name,
      balance: parseFloat(form.balance) || 0,
      color: form.color,
      createdAt: getLocalDateString(),
    }
    if (editing) {
      await updateWallet(editing, data)
    } else {
      await addWallet(data)
    }
    setModalOpen(false)
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(depositAmount) || 0
    if (amount <= 0) return
    await depositToWallet(depositWalletId, amount, depositDescription || 'Ingreso')
    setDepositModal(false)
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(transfer.amount) || 0
    if (amount <= 0 || !transfer.fromId || !transfer.toId || transfer.fromId === transfer.toId) return
    await transferBetweenWallets(transfer.fromId, transfer.toId, amount, transfer.description)
    setTransferModal(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Eliminar esta billetera?')) {
      await deleteWallet(id)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold text-white">Billeteras</h1>
        <button onClick={openCreate} className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Nueva Billetera
        </button>
      </div>

      {wallets.length === 0 ? (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No tienes billeteras aun</p>
          <p className="text-gray-500 text-sm mt-1">Crea una para comenzar a registrar gastos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-dark-800 border border-dark-600 rounded-xl p-5 relative group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: wallet.color }}>
                  {(wallet.name ?? wallet.id?.toString() ?? '').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{wallet.name}</h3>
                  <p className="text-gray-500 text-xs">Creada {wallet.createdAt}</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-success-500 whitespace-nowrap">{formatCurrency(getWalletBalance(wallet.id))}</p>
              <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">Ingresado: {formatCurrency(wallet.balance)}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => openDeposit(wallet.id)} className="text-xs text-green-400 hover:text-white bg-dark-600 px-3 py-1.5 rounded-md transition-colors">
                  + Ingresar
                </button>
                <button onClick={() => openTransfer(wallet.id)} className="text-xs text-accent-400 hover:text-white bg-dark-600 hover:bg-dark-500 px-3 py-1.5 rounded-md transition-colors">
                  Transferir
                </button>
                <button onClick={() => openEdit(wallet.id)} className="text-xs text-gray-400 hover:text-white bg-dark-600 hover:bg-dark-500 px-3 py-1.5 rounded-md transition-colors">
                  Editar
                </button>
                <button onClick={() => handleDelete(wallet.id)} className="text-xs text-gray-400 hover:text-danger-500 bg-dark-600 hover:bg-dark-500 px-3 py-1.5 rounded-md transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Billetera' : 'Nueva Billetera'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Saldo Inicial</label>
            <input type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full h-10 bg-dark-700 border border-dark-500 rounded-lg cursor-pointer" />
          </div>
          <button type="submit" className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {editing ? 'Guardar Cambios' : 'Crear Billetera'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={depositModal} onClose={() => setDepositModal(false)} title="Ingresar Dinero">
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monto a ingresar</label>
            <input type="number" step="0.01" min="0.01" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required autoFocus />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripcion (opcional)</label>
            <input value={depositDescription} onChange={(e) => setDepositDescription(e.target.value)} placeholder="Ej: Transferencia, efectivo..." className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
          </div>
          <button type="submit" className="w-full bg-success-500 hover:bg-success-500/80 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Ingresar Dinero
          </button>
        </form>
      </Modal>

      <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="Transferir Saldo">
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Desde</label>
            <select
              value={transfer.fromId}
              onChange={(e) => setTransfer({ ...transfer, fromId: e.target.value, toId: transfer.toId === e.target.value ? '' : transfer.toId })}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
              required
            >
              <option value="">Seleccionar billetera</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Hacia</label>
            <select
              value={transfer.toId}
              onChange={(e) => setTransfer({ ...transfer, toId: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500"
              required
            >
              <option value="">Seleccionar billetera</option>
              {wallets.filter((w) => w.id !== transfer.fromId).map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Monto</label>
            <input type="number" step="0.01" min="0.01" value={transfer.amount} onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" required autoFocus />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Descripcion (opcional)</label>
            <input value={transfer.description} onChange={(e) => setTransfer({ ...transfer, description: e.target.value })} placeholder="Transferencia entre billeteras" className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-500" />
          </div>
          <button type="submit" className="w-full bg-accent-500 hover:bg-accent-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Transferir
          </button>
        </form>
      </Modal>
    </div>
  )
}
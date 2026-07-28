import { useStore } from '../store'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function DashboardPage() {
  const wallets = useStore((s) => s.wallets)
  const expenses = useStore((s) => s.expenses)
  useStore((s) => s.deposits)
  const categories = useStore((s) => s.categories)
  const getWalletBalance = useStore((s) => s.getWalletBalance)
  const calcMovements = useStore((s) => s.allMovements)

  const movements = calcMovements()

  const totalBalance = wallets.reduce((sum, w) => {
    const spent = expenses.filter((e) => String(e.walletId) === String(w.id)).reduce((s, e) => s + e.amount, 0)
    return sum + (w.balance - spent)
  }, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  const byCategory = categories
    .map((cat) => ({
      name: cat.name,
      icon: cat.icon,
      total: expenses.filter((e) => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const byWallet = wallets.map((w) => ({
    name: w.name,
    color: w.color,
    total: expenses.filter((e) => String(e.walletId) === String(w.id)).reduce((s, e) => s + e.amount, 0),
  }))

  const maxCat = Math.max(...byCategory.map((c) => c.total), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Saldo Total</p>
          <p className="text-2xl font-bold text-success-500">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Gastos Totales</p>
          <p className="text-2xl font-bold text-danger-500">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <p className="text-gray-400 text-sm">Billeteras</p>
          <p className="text-2xl font-bold text-accent-400">{wallets.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Gastos por Categoria</h2>
          {byCategory.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos aun</p>
          ) : (
          <div className="space-y-3">
            {byCategory.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{cat.icon} {cat.name}</span>
                  <span className="text-white font-medium whitespace-nowrap">{formatCurrency(cat.total)}</span>
                </div>
                <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all"
                    style={{ width: `${(cat.total / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Saldo por Billetera</h2>
          {wallets.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin datos aun</p>
          ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => {
              const balance = getWalletBalance(wallet.id)
              const walletExpenses = byWallet.find((w) => w.name === wallet.name)?.total || 0
              const maxW = Math.max(...byWallet.map((w) => w.total), 1)
              return (
                <div key={wallet.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: wallet.color }}>{wallet.name}</span>
                    <span className="text-white font-medium whitespace-nowrap">{formatCurrency(balance)} <span className="text-gray-500 text-xs">({formatCurrency(walletExpenses)} gastados)</span></span>
                  </div>
                  <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(walletExpenses / maxW) * 100}%`, backgroundColor: wallet.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Historial de Movimientos</h2>
        {movements.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin movimientos registrados</p>
        ) : (
        <div className="space-y-2">
          {movements.slice(0, 10).map((mov, i) => (
            <div key={`${mov.type}-${i}`} className="flex items-center justify-between py-2 border-b border-dark-600 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${mov.type === 'income' ? 'bg-success-500/20' : 'bg-dark-600'}`}>
                  {mov.type === 'income' ? '💰' : (mov.categoryIcon ?? '💸')}
                </div>
                <div>
                  <p className="text-white text-sm">{mov.description}</p>
                  <p className="text-gray-500 text-xs">
                    <span style={{ color: mov.walletColor }}>{mov.walletName}</span>
                    {mov.categoryName ? ` · ${mov.categoryName}` : ''} · {formatDate(mov.date)}
                  </p>
                </div>
              </div>
              <span className={`font-medium text-sm shrink-0 whitespace-nowrap ${mov.type === 'income' ? 'text-success-500' : 'text-danger-500'}`}>
                {mov.type === 'income' ? '+' : '-'}{formatCurrency(mov.amount)}
              </span>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
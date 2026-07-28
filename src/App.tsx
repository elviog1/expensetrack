import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import WalletsPage from './pages/WalletsPage'
import ExpensesPage from './pages/ExpensesPage'

export default function App() {
  const loadData = useStore((s) => s.loadData)
  const loaded = useStore((s) => s.loaded)
  const error = useStore((s) => s.error)

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-900">
        <p className="text-gray-400 text-lg">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-900">
        <div className="bg-dark-800 border border-danger-500 rounded-xl p-8 max-w-md text-center">
          <p className="text-danger-500 text-lg font-semibold mb-2">Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button onClick={loadData} className="mt-4 bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="wallets" element={<WalletsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
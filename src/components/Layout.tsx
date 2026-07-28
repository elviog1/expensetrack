import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/wallets', label: 'Billeteras', icon: '💰' },
  { to: '/expenses', label: 'Gastos', icon: '💸' },
]

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-14 md:w-64 bg-dark-800 border-r border-dark-600 flex flex-col items-center md:items-stretch p-2 md:p-4 shrink-0 overflow-y-auto">
        <div className="mb-6 md:mb-8 flex justify-center md:block">
          <h1 className="text-xl font-bold text-accent-400">
            <span className="hidden md:inline px-3">ExpenseTrack</span>
            <span className="md:hidden w-10 h-10 rounded-full bg-accent-500/20 border-2 border-accent-400 flex items-center justify-center text-base">E</span>
          </h1>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span className="hidden md:inline">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-3 md:p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
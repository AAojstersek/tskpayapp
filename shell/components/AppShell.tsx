import { useState } from 'react'
import { MainNav } from './MainNav'
import { UserMenu } from './UserMenu'

export interface AppShellProps {
  children: React.ReactNode
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>
  user?: { name: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

export function AppShell({
  children,
  navigationItems,
  user,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              tskPay
            </h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <MainNav
              items={navigationItems}
              onNavigate={onNavigate}
            />
          </div>

          {/* User Menu */}
          <div className="border-t border-slate-200 dark:border-slate-700">
            <UserMenu
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="ml-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            tskPay
          </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


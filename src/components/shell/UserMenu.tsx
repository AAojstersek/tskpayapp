import { useState } from 'react'
import { LogOut } from 'lucide-react'

export interface UserMenuProps {
  user?: { name: string; avatarUrl?: string }
  onLogout?: () => void
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="relative p-4">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user?.name || 'Uporabnik'}
          </div>
        </div>
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20">
            <button
              onClick={() => {
                onLogout?.()
                setMenuOpen(false)
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Odjava</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

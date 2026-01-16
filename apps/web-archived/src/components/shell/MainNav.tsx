export interface MainNavProps {
  items: Array<{ label: string; href: string; isActive?: boolean }>
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  const handleClick = (href: string) => {
    if (onNavigate) {
      onNavigate(href)
    } else {
      // If no onNavigate callback provided, use window.location or router
      // Implementation should wire this to their routing system
      window.location.href = href
    }
  }

  return (
    <nav className="px-3 space-y-1">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => handleClick(item.href)}
          className={`
            w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg
            transition-colors duration-200
            ${
              item.isActive
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }
          `}
        >
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

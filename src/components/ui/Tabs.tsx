import { useState, createContext, useContext } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }

  const isActive = context.value === value

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${
          isActive
            ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

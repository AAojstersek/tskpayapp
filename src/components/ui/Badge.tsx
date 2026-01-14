import { HTMLAttributes } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    outline: 'border border-slate-300 text-slate-800 dark:border-slate-700 dark:text-slate-300',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

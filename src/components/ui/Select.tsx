import { SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  onValueChange?: (value: string) => void
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', onValueChange, onChange, children, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value)
      onChange?.(e)
    }

    return (
      <div className="relative">
        <select
          ref={ref}
          className={`flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:ring-offset-slate-950 dark:focus-visible:ring-blue-400 pr-8 ${className}`}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
    )
  }
)
Select.displayName = 'Select'

export function SelectTrigger({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>
}

export function SelectContent({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

export function SelectItem({ value, children, ...props }: { value: string; children: React.ReactNode } & React.HTMLAttributes<HTMLOptionElement>) {
  return <option value={value} {...props}>{children}</option>
}

export function SelectValue({ placeholder, ...props }: { placeholder?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{placeholder}</div>
}

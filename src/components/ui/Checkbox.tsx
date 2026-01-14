import { InputHTMLAttributes, forwardRef } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange?.(e.target.checked)
      onChange?.(e)
    }

    return (
      <input
        ref={ref}
        type="checkbox"
        className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 ${className}`}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Checkbox.displayName = 'Checkbox'

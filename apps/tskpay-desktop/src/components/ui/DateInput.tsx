import { useState, useEffect, useRef, InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'

export interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: string // YYYY-MM-DD format
  onChange?: (e: { target: { value: string } }) => void // Returns YYYY-MM-DD format
}

/**
 * Converts YYYY-MM-DD to dd.mm.yyyy
 */
function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

/**
 * Converts dd.mm.yyyy to YYYY-MM-DD
 */
function parseDateFromInput(inputStr: string): string | null {
  // Remove all non-digits
  const digits = inputStr.replace(/\D/g, '')
  
  if (digits.length === 0) return null
  
  // Extract day, month, year
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  
  // Validate lengths
  if (day.length < 2 || month.length < 2 || year.length < 4) {
    return null
  }
  
  // Validate ranges
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)
  
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
    return null
  }
  
  // Validate date (e.g., check if 31.02.2024 is valid)
  const date = new Date(yearNum, monthNum - 1, dayNum)
  if (date.getDate() !== dayNum || date.getMonth() !== monthNum - 1 || date.getFullYear() !== yearNum) {
    return null
  }
  
  // Format as YYYY-MM-DD
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

/**
 * Formats input string as dd.mm.yyyy while typing
 */
function formatInputWhileTyping(inputStr: string): string {
  // Remove all non-digits
  const digits = inputStr.replace(/\D/g, '')
  
  if (digits.length === 0) return ''
  
  let formatted = digits.slice(0, 2) // Day
  if (digits.length > 2) {
    formatted += '.' + digits.slice(2, 4) // Month
  }
  if (digits.length > 4) {
    formatted += '.' + digits.slice(4, 8) // Year (max 4 digits)
  }
  
  return formatted
}

export const DateInput = ({ value = '', onChange, className = '', ...props }: DateInputProps) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isValid, setIsValid] = useState(true)
  const hiddenDateInputRef = useRef<HTMLInputElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  // Update display value when prop value changes
  useEffect(() => {
    if (value) {
      setDisplayValue(formatDateForDisplay(value))
      setIsValid(true)
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Allow backspace/delete to work properly
    if (input.length < displayValue.length) {
      // User is deleting, allow it
      setDisplayValue(input)
      setIsValid(true)
      
      // If input is empty, clear the value
      if (input === '') {
        onChange?.({ target: { value: '' } })
      }
      return
    }
    
    // Format while typing
    const formatted = formatInputWhileTyping(input)
    setDisplayValue(formatted)
    
    // Try to parse and validate
    const parsed = parseDateFromInput(formatted)
    if (parsed) {
      setIsValid(true)
      onChange?.({ target: { value: parsed } })
    } else if (formatted.length === 10) {
      // Full length but invalid
      setIsValid(false)
    } else {
      // Still typing, don't mark as invalid yet
      setIsValid(true)
    }
  }

  const handleTextInputBlur = () => {
    // On blur, validate and format properly
    const parsed = parseDateFromInput(displayValue)
    if (parsed) {
      setDisplayValue(formatDateForDisplay(parsed))
      setIsValid(true)
      onChange?.({ target: { value: parsed } })
    } else if (displayValue) {
      // Invalid date, mark as invalid but keep the display value
      setIsValid(false)
    }
  }

  const handleCalendarClick = () => {
    // Open native date picker
    if (hiddenDateInputRef.current) {
      // Set the current value if we have a valid date
      if (value) {
        hiddenDateInputRef.current.value = value
      }
      // Try to use showPicker() if available (modern browsers)
      const el = hiddenDateInputRef.current as HTMLInputElement & { showPicker?: () => void }
      if ('showPicker' in el && typeof el.showPicker === 'function') {
        try {
          el.showPicker()
        } catch (err) {
          // Fallback to focus/click
          hiddenDateInputRef.current.focus()
          hiddenDateInputRef.current.click()
        }
      } else {
        // Fallback for older browsers
        hiddenDateInputRef.current.focus()
        hiddenDateInputRef.current.click()
      }
    }
  }

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue) {
      setDisplayValue(formatDateForDisplay(newValue))
      setIsValid(true)
      onChange?.({ target: { value: newValue } })
    } else {
      setDisplayValue('')
      onChange?.({ target: { value: '' } })
    }
    
    // Close the calendar picker by blurring the hidden input
    // Use requestAnimationFrame to ensure the change event completes first
    requestAnimationFrame(() => {
      hiddenDateInputRef.current?.blur()
    })
  }

  return (
    <div className="relative">
      <input
        ref={textInputRef}
        type="text"
        value={displayValue}
        onChange={handleTextInputChange}
        onBlur={handleTextInputBlur}
        placeholder="dd.mm.yyyy"
        className={`flex h-10 w-full rounded-md border pr-10 pl-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-200 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-400 ${
          isValid
            ? 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
            : 'border-red-500 bg-white dark:border-red-500 dark:bg-slate-800'
        } ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
        tabIndex={-1}
      >
        <Calendar className="w-4 h-4" />
      </button>
      {/* Hidden native date input for calendar picker */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        value={value || ''}
        onChange={handleHiddenDateChange}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

DateInput.displayName = 'DateInput'

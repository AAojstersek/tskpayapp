import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react'

export interface DropdownMenuProps {
  children: React.ReactNode
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Process children to find trigger and content
  const childrenArray = Array.isArray(children) ? children : [children]
  let trigger: React.ReactNode = null
  let content: React.ReactNode = null

  childrenArray.forEach((child: any) => {
    if (child?.type?.name === 'DropdownMenuTrigger' || child?.type === DropdownMenuTrigger) {
      trigger = child
    } else if (child?.type?.name === 'DropdownMenuContent' || child?.type === DropdownMenuContent) {
      content = child
    }
  })

  const triggerElement = trigger && isValidElement(trigger) && trigger.props.asChild
    ? cloneElement(trigger.props.children as React.ReactElement, { 
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(!open)
        }
      } as any)
    : trigger && isValidElement(trigger)
    ? cloneElement(trigger, { 
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(!open)
        }
      } as any)
    : <div onClick={() => setOpen(!open)}>{trigger}</div>

  return (
    <div ref={ref} className="relative">
      {triggerElement}
      {open && content && (
        <div onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      )}
    </div>
  )
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  return <>{children}</>
}

export interface DropdownMenuContentProps {
  align?: 'start' | 'end' | 'center'
  children: React.ReactNode
}

export function DropdownMenuContent({ align = 'end', children }: DropdownMenuContentProps) {
  const alignClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div
      className={`absolute ${alignClasses[align]} top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 py-1`}
    >
      {children}
    </div>
  )
}

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function DropdownMenuItem({ className = '', children, ...props }: DropdownMenuItemProps) {
  return (
    <button
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700 w-full text-left ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

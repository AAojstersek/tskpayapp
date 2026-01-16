import { useState, useEffect } from 'react'
import type { Parent } from '@/types'
import { Button, Input, Label } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface ParentFormProps {
  parent?: Parent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (parentData: Omit<Parent, 'id'>) => void
}

export function ParentForm({
  parent,
  open,
  onOpenChange,
  onSave,
}: ParentFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (open) {
      if (parent) {
        setFirstName(parent.firstName)
        setLastName(parent.lastName)
        setEmail(parent.email)
        setPhone(parent.phone)
      } else {
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
      }
    }
  }, [parent, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      return
    }

    onSave?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    })

    onOpenChange(false)
  }

  const isEditMode = !!parent

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi starša' : 'Dodaj novega starša'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Ime <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Vnesite ime"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                Priimek <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Vnesite priimek"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-pošta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vnesite@email.si"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Telefon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+386 41 123 456"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Prekliči
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditMode ? 'Shrani spremembe' : 'Dodaj starša'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

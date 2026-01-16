import { useState, useEffect } from 'react'
import type { Coach } from '@/types'
import { Button, Input, Label } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface CoachFormProps {
  coach?: Coach | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (coachData: Omit<Coach, 'id'>, groupName?: string) => void
}

export function CoachForm({
  coach,
  open,
  onOpenChange,
  onSave,
}: CoachFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    if (open) {
      if (coach) {
        setName(coach.name)
        setEmail(coach.email)
        setPhone(coach.phone)
        setGroupName('')
      } else {
        setName('')
        setEmail('')
        setPhone('')
        setGroupName('')
      }
    }
  }, [coach, open])

  useEffect(() => {
    if (open && !coach && name) {
      // Auto-generate group name from coach name when creating
      const firstName = name.split(' ')[0]
      setGroupName(`${firstName} skupina`)
    }
  }, [open, coach, name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim()) {
      return
    }

    // When creating a new coach, require group name
    if (!coach && !groupName.trim()) {
      return
    }

    onSave?.(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      },
      coach ? undefined : groupName.trim()
    )

    onOpenChange(false)
  }

  const isEditMode = !!coach

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi trenerja' : 'Dodaj novega trenerja'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Ime in priimek <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vnesite ime in priimek"
              required
            />
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

          {!coach && (
            <div className="space-y-2">
              <Label htmlFor="groupName">
                Ime skupine <span className="text-red-500">*</span>
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Vnesite ime skupine"
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skupina bo avtomatsko ustvarjena za tega trenerja
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Prekliči
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditMode ? 'Shrani spremembe' : 'Dodaj trenerja'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

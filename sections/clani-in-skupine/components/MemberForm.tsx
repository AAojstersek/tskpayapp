import { useState, useEffect } from 'react'
import type { Member, Parent, Group } from '@/../product/sections/clani-in-skupine/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, X } from 'lucide-react'

export interface MemberFormProps {
  /** Tekmovalec za urejanje (če je undefined, gre za dodajanje) */
  member?: Member | null
  /** Seznam vseh staršev */
  parents: Parent[]
  /** Seznam vseh skupin */
  groups: Group[]
  /** Ali je dialog odprt */
  open: boolean
  /** Pokliče se, ko se dialog zapre */
  onOpenChange: (open: boolean) => void
  /** Pokliče se, ko uporabnik shrani tekmovalca */
  onSave?: (memberData: Omit<Member, 'id'>) => void
  /** Pokliče se, ko uporabnik želi dodati novega starša */
  onAddParent?: () => void
}

export function MemberForm({
  member,
  parents,
  groups,
  open,
  onOpenChange,
  onSave,
  onAddParent,
}: MemberFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>('active')
  const [notes, setNotes] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')

  // Reset form when member changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (member) {
        setFirstName(member.firstName)
        setLastName(member.lastName)
        setDateOfBirth(member.dateOfBirth)
        setStatus(member.status)
        setNotes(member.notes)
        setParentId(member.parentId)
        setGroupId(member.groupId)
      } else {
        // Reset for new member
        setFirstName('')
        setLastName('')
        setDateOfBirth('')
        setStatus('active')
        setNotes('')
        setParentId('')
        setGroupId('')
      }
    }
  }, [member, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !parentId || !groupId) {
      return
    }

    onSave?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      status,
      notes: notes.trim(),
      parentId,
      groupId,
    })

    onOpenChange(false)
  }

  const isEditMode = !!member

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi tekmovalca' : 'Dodaj novega tekmovalca'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ime in priimek */}
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

          {/* Datum rojstva */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Datum rojstva</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          {/* Starš */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="parentId">
                Starš <span className="text-red-500">*</span>
              </Label>
              {onAddParent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddParent}
                  className="h-8"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Dodaj starša
                </Button>
              )}
            </div>
            <Select value={parentId} onValueChange={setParentId} required>
              <SelectTrigger id="parentId">
                <SelectValue placeholder="Izberite starša" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.firstName} {parent.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skupina */}
          <div className="space-y-2">
            <Label htmlFor="groupId">
              Skupina <span className="text-red-500">*</span>
            </Label>
            <Select value={groupId} onValueChange={setGroupId} required>
              <SelectTrigger id="groupId">
                <SelectValue placeholder="Izberite skupino" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as 'active' | 'inactive' | 'archived')
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktivni</SelectItem>
                <SelectItem value="inactive">Neaktiven</SelectItem>
                <SelectItem value="archived">Arhiviran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opombe */}
          <div className="space-y-2">
            <Label htmlFor="notes">Opombe</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne opombe o tekmovalcu..."
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Prekliči
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {isEditMode ? 'Shrani spremembe' : 'Dodaj tekmovalca'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


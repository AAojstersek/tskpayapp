import { useState, useEffect } from 'react'
import type { Member, Parent, Group } from '@/types'
import { Button, Input, Label, Select, Checkbox, Textarea } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { Plus, X, User } from 'lucide-react'

export interface MemberFormSaveData extends Omit<Member, 'id'> {
  createSelfAsParent?: boolean // If true, create a parent record for this member
}

export interface MemberFormProps {
  member?: Member | null
  parents: Parent[]
  groups: Group[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (memberData: MemberFormSaveData) => void
  onAddParent?: () => void
}

const SAMO_CLANI_GROUP_ID = 'grp-samo-clani'

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
  const [parentIds, setParentIds] = useState<string[]>([])
  const [groupId, setGroupId] = useState<string>('')
  const [isSelfPaying, setIsSelfPaying] = useState(false)

  // Check if "Samo člani" group exists
  const samoClaniGroup = groups.find((g) => g.id === SAMO_CLANI_GROUP_ID)

  useEffect(() => {
    if (open) {
      if (member) {
        setFirstName(member.firstName)
        setLastName(member.lastName)
        setDateOfBirth(member.dateOfBirth)
        setStatus(member.status)
        setNotes(member.notes)
        setParentIds(member.parentIds && member.parentIds.length > 0 ? member.parentIds : (member.parentId ? [member.parentId] : []))
        setGroupId(member.groupId)
        setIsSelfPaying(member.groupId === SAMO_CLANI_GROUP_ID)
      } else {
        setFirstName('')
        setLastName('')
        setDateOfBirth('')
        setStatus('active')
        setNotes('')
        setParentIds([])
        setGroupId('')
        setIsSelfPaying(false)
      }
    }
  }, [member, open])

  // When "self-paying" is toggled, auto-set the group
  useEffect(() => {
    if (isSelfPaying && samoClaniGroup) {
      setGroupId(SAMO_CLANI_GROUP_ID)
    }
  }, [isSelfPaying, samoClaniGroup])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim() || !groupId) {
      return
    }

    // For self-paying members, no parents need to be selected
    // For regular members, at least one parent must be selected
    if (!isSelfPaying && parentIds.length === 0) {
      return
    }

    onSave?.({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      status,
      notes: notes.trim(),
      parentId: isSelfPaying ? undefined : parentIds[0], // Glavni starš za kompatibilnost
      parentIds: isSelfPaying ? [] : parentIds, // Will be filled by parent component
      groupId,
      createSelfAsParent: isSelfPaying, // Signal to create parent record
    })

    onOpenChange(false)
  }

  const handleToggleParent = (parentId: string) => {
    setParentIds((prev) => {
      if (prev.includes(parentId)) {
        return prev.filter((id) => id !== parentId)
      } else {
        return [...prev, parentId]
      }
    })
  }

  const handleRemoveParent = (parentId: string) => {
    setParentIds((prev) => prev.filter((id) => id !== parentId))
  }

  const isEditMode = !!member

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi tekmovalca' : 'Dodaj novega tekmovalca'}
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
            <Label htmlFor="dateOfBirth">Datum rojstva</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>

          {/* Self-paying member option */}
          {samoClaniGroup && !isEditMode && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={isSelfPaying}
                  onCheckedChange={(checked) => setIsSelfPaying(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Samo član (plačuje sam zase)
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Za člane kluba, ki niso tekmovalci in sami plačujejo svoje obveznosti.
                    Član bo dodan v skupino "Samo člani".
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Parents selection - hidden for self-paying members */}
          {!isSelfPaying && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Starši / Plačniki <span className="text-red-500">*</span>
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
            
            {/* Selected parents as tags */}
            {parentIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {parentIds.map((parentId) => {
                  const parent = parents.find((p) => p.id === parentId)
                  return parent ? (
                    <div
                      key={parentId}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm"
                    >
                      <span>{parent.firstName} {parent.lastName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParent(parentId)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null
                })}
              </div>
            )}

            {/* Parent selection list */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
              {parents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                  Ni na voljo staršev. Dodajte starša, da začnete.
                </p>
              ) : (
                <div className="space-y-2">
                  {parents.map((parent) => (
                    <label
                      key={parent.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={parentIds.includes(parent.id)}
                        onCheckedChange={() => handleToggleParent(parent.id)}
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {parent.firstName} {parent.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {parentIds.length === 0 && (
              <p className="text-xs text-red-500">Izberite vsaj enega starša</p>
            )}
          </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="groupId">
              Skupina <span className="text-red-500">*</span>
            </Label>
            <Select
              id="groupId"
              value={groupId}
              onValueChange={setGroupId}
              required
            >
              <option value="">Izberite skupino</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onValueChange={(value) =>
                setStatus(value as 'active' | 'inactive' | 'archived')
              }
            >
              <option value="active">Aktivni</option>
              <option value="inactive">Neaktiven</option>
              <option value="archived">Arhiviran</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Opombe</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne opombe o tekmovalcu..."
              rows={4}
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
              {isEditMode ? 'Shrani spremembe' : 'Dodaj tekmovalca'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

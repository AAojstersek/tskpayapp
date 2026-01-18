import { useState, useEffect } from 'react'
import type { Cost, Member } from '@/types'
import { Button, Input, Label, Select, Checkbox, Textarea } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface CostFormProps {
  cost?: Cost | null
  members: Member[]
  costTypes: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (costData: Omit<Cost, 'id' | 'createdAt'>) => void
}

export function CostForm({
  cost,
  members,
  costTypes,
  open,
  onOpenChange,
  onSave,
}: CostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [costType, setCostType] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [memberId, setMemberId] = useState('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')
  // Ponavljajoči stroški
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPeriod, setRecurringPeriod] = useState<'monthly' | 'yearly' | 'weekly' | 'quarterly' | ''>('')
  const [recurringStartDate, setRecurringStartDate] = useState('')
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState('')

  useEffect(() => {
    if (open) {
      if (cost) {
        setTitle(cost.title)
        setDescription(cost.description)
        setAmount(cost.amount.toString())
        setCostType(cost.costType)
        setDueDate(cost.dueDate || '')
        setMemberId(cost.memberId)
        setStatus(cost.status)
        // Ponavljajoči stroški
        setIsRecurring(cost.isRecurring || false)
        setRecurringPeriod(cost.recurringPeriod || '')
        setRecurringStartDate(cost.recurringStartDate || '')
        setRecurringEndDate(cost.recurringEndDate || '')
        setRecurringDayOfMonth(cost.recurringDayOfMonth?.toString() || '')
      } else {
        setTitle('')
        setDescription('')
        setAmount('')
        setCostType('')
        setDueDate('')
        setMemberId('')
        setStatus('pending')
        // Ponavljajoči stroški
        setIsRecurring(false)
        setRecurringPeriod('')
        setRecurringStartDate('')
        setRecurringEndDate('')
        setRecurringDayOfMonth('')
      }
    }
  }, [cost, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !amount || !costType || !memberId) {
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return
    }

    onSave?.({
      memberId,
      title: title.trim(),
      description: description.trim(),
      amount: amountNum,
      costType,
      dueDate: dueDate || null,
      status,
      // Ponavljajoči stroški
      isRecurring: isRecurring,
      recurringPeriod: isRecurring && recurringPeriod ? recurringPeriod as 'monthly' | 'yearly' | 'weekly' | 'quarterly' : null,
      recurringStartDate: isRecurring && recurringStartDate ? recurringStartDate : null,
      recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate : null,
      recurringDayOfMonth: isRecurring && recurringDayOfMonth ? parseInt(recurringDayOfMonth, 10) : null,
      recurringTemplateId: cost?.recurringTemplateId || null,
    })

    onOpenChange(false)
  }

  const isEditMode = !!cost

  // Filter members by selected group if a group filter is needed
  const availableMembers = members

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi strošek' : 'Dodaj nov strošek'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="memberId">
              Tekmovalec <span className="text-red-500">*</span>
            </Label>
            <Select
              id="memberId"
              value={memberId}
              onValueChange={setMemberId}
              required
              disabled={isEditMode}
            >
              <option value="">Izberite tekmovalca</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Naziv <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vnesite naziv stroška"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatni opis stroška..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Znesek (€) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costType">
                Vrsta stroška <span className="text-red-500">*</span>
              </Label>
              <Select
                id="costType"
                value={costType}
                onValueChange={setCostType}
                required
              >
                <option value="">Izberite vrsto</option>
                {costTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Rok plačila</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={status}
                onValueChange={(value) =>
                  setStatus(value as 'pending' | 'paid')
                }
              >
                <option value="pending">Odprto</option>
                <option value="paid">Poravnano</option>
              </Select>
            </div>
          </div>

          {/* Ponavljajoči stroški */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                disabled={isEditMode && cost?.recurringTemplateId ? true : false}
              />
              <Label htmlFor="isRecurring" className="font-medium cursor-pointer">
                Ponavljajoči strošek
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <Label htmlFor="recurringPeriod">
                    Obdobje ponavljanja <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    id="recurringPeriod"
                    value={recurringPeriod}
                    onValueChange={(value) => setRecurringPeriod(value as typeof recurringPeriod)}
                    required={isRecurring}
                  >
                    <option value="">Izberite obdobje</option>
                    <option value="monthly">Mesečno</option>
                    <option value="quarterly">Četrtletno</option>
                    <option value="yearly">Letno</option>
                    <option value="weekly">Tedensko</option>
                  </Select>
                </div>

                {recurringPeriod === 'monthly' && (
                  <div className="space-y-2">
                    <Label htmlFor="recurringDayOfMonth">Dan v mesecu</Label>
                    <Input
                      id="recurringDayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={recurringDayOfMonth}
                      onChange={(e) => setRecurringDayOfMonth(e.target.value)}
                      placeholder="npr. 1 (vsak 1. v mesecu)"
                    />
                    <p className="text-xs text-slate-500">
                      Vnesite dan v mesecu (1-31). Strošek bo generiran vsak mesec na ta dan.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurringStartDate">Datum začetka</Label>
                    <Input
                      id="recurringStartDate"
                      type="date"
                      value={recurringStartDate}
                      onChange={(e) => setRecurringStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurringEndDate">Datum konca (opcijsko)</Label>
                    <Input
                      id="recurringEndDate"
                      type="date"
                      value={recurringEndDate}
                      onChange={(e) => setRecurringEndDate(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Pustite prazno za neskončno ponavljanje
                    </p>
                  </div>
                </div>
              </div>
            )}
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
              {isEditMode ? 'Shrani spremembe' : 'Dodaj strošek'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

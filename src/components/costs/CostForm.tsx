import { useState, useEffect } from 'react'
import type { Cost, Member, Group } from '@/types'
import { Button, Input, Label, Select } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface CostFormProps {
  cost?: Cost | null
  members: Member[]
  groups: Group[]
  costTypes: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (costData: Omit<Cost, 'id' | 'createdAt'>) => void
}

export function CostForm({
  cost,
  members,
  groups,
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
  const [status, setStatus] = useState<'pending' | 'paid' | 'cancelled'>('pending')

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
      } else {
        setTitle('')
        setDescription('')
        setAmount('')
        setCostType('')
        setDueDate('')
        setMemberId('')
        setStatus('pending')
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
    })

    onOpenChange(false)
  }

  const isEditMode = !!cost
  const canEditAmount = !isEditMode // Amount cannot be edited after creation

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
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dodatni opis stroška..."
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-400"
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
                disabled={!canEditAmount}
              />
              {isEditMode && (
                <p className="text-xs text-slate-500">Znesek se ne more spremeniti po ustvarjanju</p>
              )}
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
                  setStatus(value as 'pending' | 'paid' | 'cancelled')
                }
              >
                <option value="pending">Odprto</option>
                <option value="paid">Poravnano</option>
                <option value="cancelled">Razveljavljeno</option>
              </Select>
            </div>
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

import { useState } from 'react'
import type { Member } from '@/types'
import { Button, Input, Label, Select } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface BulkBillingFormProps {
  selectedMemberIds: string[]
  members: Member[]
  costTypes: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (costData: {
    memberIds: string[]
    title: string
    description: string
    amount: number
    costType: string
    dueDate: string | null
  }) => void
}

export function BulkBillingForm({
  selectedMemberIds,
  members,
  costTypes,
  open,
  onOpenChange,
  onSave,
}: BulkBillingFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [costType, setCostType] = useState('')
  const [dueDate, setDueDate] = useState('')

  const selectedMembers = members.filter((m) => selectedMemberIds.includes(m.id))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !amount || !costType) {
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return
    }

    onSave?.({
      memberIds: selectedMemberIds,
      title: title.trim(),
      description: description.trim(),
      amount: amountNum,
      costType,
      dueDate: dueDate || null,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setAmount('')
    setCostType('')
    setDueDate('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            Masovno obračunavanje ({selectedMemberIds.length} tekmovalcev)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label>Izbrani tekmovalci</Label>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-md p-3 max-h-32 overflow-y-auto">
              <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                {selectedMembers.map((member) => (
                  <li key={member.id}>
                    • {member.firstName} {member.lastName}
                  </li>
                ))}
              </ul>
            </div>
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
              />
              <p className="text-xs text-slate-500">
                Enak znesek za vse izbrane tekmovalce
              </p>
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

          <div className="space-y-2">
            <Label htmlFor="dueDate">Rok plačila</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
              Ustvari stroške
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

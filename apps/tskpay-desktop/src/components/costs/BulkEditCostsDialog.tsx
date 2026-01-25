import { useState, useEffect, useMemo } from 'react'
import type { Cost } from '@/types'
import { Button, Input, DateInput, Label, Select, Checkbox } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { AlertTriangle } from 'lucide-react'

export interface BulkEditPatch {
  amount?: number
  status?: 'pending' | 'paid'
  dueDate?: string | null
  clearDueDate?: boolean
  delete?: true
}

export interface BulkEditCostsDialogProps {
  selectedCosts: Cost[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply?: (patch: BulkEditPatch) => void
}

export function BulkEditCostsDialog({
  selectedCosts,
  open,
  onOpenChange,
  onApply,
}: BulkEditCostsDialogProps) {
  // Field enable toggles
  const [changeAmount, setChangeAmount] = useState(false)
  const [changeStatus, setChangeStatus] = useState(false)
  const [changeDueDate, setChangeDueDate] = useState(false)
  const [changeDelete, setChangeDelete] = useState(false)
  
  // Field values
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState<'pending' | 'paid'>('pending')
  const [dueDate, setDueDate] = useState('')
  const [clearDueDate, setClearDueDate] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setChangeAmount(false)
      setChangeStatus(false)
      setChangeDueDate(false)
      setChangeDelete(false)
      setAmount('')
      setStatus('pending')
      setDueDate('')
      setClearDueDate(false)
    }
  }, [open])

  // Calculate statistics about selected costs
  const stats = useMemo(() => {
    const total = selectedCosts.length
    const paidCount = selectedCosts.filter((c) => c.status === 'paid').length
    const pendingCount = selectedCosts.filter((c) => c.status === 'pending').length
    const totalAmount = selectedCosts.reduce((sum, c) => sum + c.amount, 0)
    return { total, paidCount, pendingCount, totalAmount }
  }, [selectedCosts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that at least one change is selected
    if (!changeAmount && !changeStatus && !changeDueDate && !changeDelete) {
      return
    }

    // If delete is selected, skip other validations and proceed
    if (changeDelete) {
      const patch: BulkEditPatch = { delete: true }
      onApply?.(patch)
      onOpenChange(false)
      return
    }

    // Validate amount if changing
    if (changeAmount) {
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        return
      }
    }

    // Check if we're modifying paid costs and show warning
    const isModifyingPaid = stats.paidCount > 0 && (changeAmount || changeStatus)
    if (isModifyingPaid) {
      const warningMessage = `OPOZORILO: ${stats.paidCount} od ${stats.total} izbranih stroškov ima status "Poravnano".\n\n` +
        `Spreminjanje zneska ali statusa poravnanih stroškov lahko povzroči neskladje z obstoječimi plačili.\n\n` +
        `Ali ste prepričani, da želite nadaljevati?`
      
      if (!confirm(warningMessage)) {
        return
      }
    }

    // Build patch object
    const patch: BulkEditPatch = {}
    
    if (changeAmount) {
      patch.amount = parseFloat(amount)
    }
    
    if (changeStatus) {
      patch.status = status
    }
    
    if (changeDueDate) {
      if (clearDueDate) {
        patch.dueDate = null
        patch.clearDueDate = true
      } else if (dueDate) {
        patch.dueDate = dueDate
      }
    }

    onApply?.(patch)
    onOpenChange(false)
  }

  const canSubmit = changeAmount || changeStatus || changeDueDate || changeDelete

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            Uredi izbrane stroške ({selectedCosts.length})
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Izbrano:</strong> {stats.total} stroškov
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Skupni znesek:</strong> {stats.totalAmount.toFixed(2)} €
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-amber-600 dark:text-amber-400">
                Odprtih: {stats.pendingCount}
              </span>
              <span className="text-green-600 dark:text-green-400">
                Poravnanih: {stats.paidCount}
              </span>
            </div>
          </div>

          {/* Warning for paid costs */}
          {stats.paidCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Pozor:</strong> {stats.paidCount} stroškov je že poravnanih. 
                Spreminjanje zneska ali statusa lahko povzroči neskladje s plačili.
              </div>
            </div>
          )}

          {/* Amount change */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="changeAmount"
                checked={changeAmount}
                onCheckedChange={setChangeAmount}
                disabled={changeDelete}
              />
              <Label htmlFor="changeAmount" className="font-medium cursor-pointer">
                Spremeni znesek
              </Label>
            </div>
            {changeAmount && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="amount">
                  Novi znesek (€) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required={changeAmount}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enak znesek bo nastavljen za vse izbrane stroške.
                </p>
              </div>
            )}
          </div>

          {/* Status change */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="changeStatus"
                checked={changeStatus}
                onCheckedChange={setChangeStatus}
                disabled={changeDelete}
              />
              <Label htmlFor="changeStatus" className="font-medium cursor-pointer">
                Spremeni status
              </Label>
            </div>
            {changeStatus && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="status">Novi status</Label>
                <Select
                  id="status"
                  value={status}
                  onValueChange={(value) => setStatus(value as 'pending' | 'paid')}
                >
                  <option value="pending">Odprto</option>
                  <option value="paid">Poravnano</option>
                </Select>
              </div>
            )}
          </div>

          {/* Due date change */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="changeDueDate"
                checked={changeDueDate}
                onCheckedChange={setChangeDueDate}
                disabled={changeDelete}
              />
              <Label htmlFor="changeDueDate" className="font-medium cursor-pointer">
                Spremeni rok plačila
              </Label>
            </div>
            {changeDueDate && (
              <div className="pl-6 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="clearDueDate"
                    checked={clearDueDate}
                    onCheckedChange={setClearDueDate}
                  />
                  <Label htmlFor="clearDueDate" className="cursor-pointer text-sm">
                    Počisti rok plačila (nastavi na prazno)
                  </Label>
                </div>
                {!clearDueDate && (
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Novi rok plačila</Label>
                    <DateInput
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delete option */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="changeDelete"
                checked={changeDelete}
                onCheckedChange={setChangeDelete}
              />
              <Label htmlFor="changeDelete" className="font-medium cursor-pointer text-red-600 dark:text-red-400">
                Izbriši izbrane stroške
              </Label>
            </div>
            {changeDelete && (
              <div className="pl-6">
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Pozor:</strong> Izbrisane stroške ni mogoče obnoviti.
                    {stats.paidCount > 0 && (
                      <> {stats.paidCount} stroškov je že poravnanih - prosimo preverite, če je brisanje res potrebno.</>
                    )}
                  </p>
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
            <Button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!canSubmit}
            >
              Uporabi spremembe
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

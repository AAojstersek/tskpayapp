import { useState, useEffect } from 'react'
import type { Payment, Parent } from '@/types'
import { Button, Input, DateInput, Label, Select, Textarea } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface PaymentFormProps {
  payment?: Payment | null
  parents: Parent[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (paymentData: Omit<Payment, 'id' | 'createdAt'>) => void
}

export function PaymentForm({
  payment,
  parents,
  open,
  onOpenChange,
  onSave,
}: PaymentFormProps) {
  const [parentId, setParentId] = useState<string | null>(null)
  const [payerName, setPayerName] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cash' | 'card' | 'other'>('bank_transfer')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [useExistingParent, setUseExistingParent] = useState(true)

  useEffect(() => {
    if (open) {
      if (payment) {
        setParentId(payment.parentId)
        setPayerName(payment.payerName || '')
        setAmount(payment.amount.toString())
        setPaymentDate(payment.paymentDate)
        setPaymentMethod(payment.paymentMethod)
        setReferenceNumber(payment.referenceNumber || '')
        setNotes(payment.notes)
        setUseExistingParent(!!payment.parentId)
      } else {
        setParentId(null)
        setPayerName('')
        setAmount('')
        setPaymentDate(new Date().toISOString().split('T')[0])
        setPaymentMethod('bank_transfer')
        setReferenceNumber('')
        setNotes('')
        setUseExistingParent(true)
      }
    }
  }, [payment, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      return
    }

    // Validate that either a parent is selected or a payer name is provided
    if (useExistingParent && !parentId) {
      return
    }
    if (!useExistingParent && !payerName.trim()) {
      return
    }

    const paymentData: Omit<Payment, 'id' | 'createdAt'> = {
      parentId: useExistingParent ? parentId : null,
      payerName: useExistingParent ? undefined : payerName.trim(),
      amount: amountNum,
      paymentDate,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || null,
      notes: notes.trim(),
      importedFromBank: false,
      bankTransactionId: null,
      status: useExistingParent && parentId ? 'pending' : 'pending', // Will be allocated later
    }

    onSave?.(paymentData)
    onOpenChange(false)
  }

  const isEditMode = !!payment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Uredi plačilo' : 'Dodaj ročno plačilo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Payer selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payerType"
                  checked={useExistingParent}
                  onChange={() => setUseExistingParent(true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Obstoječi plačnik</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="payerType"
                  checked={!useExistingParent}
                  onChange={() => setUseExistingParent(false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Neznani plačnik</span>
              </label>
            </div>

            {useExistingParent ? (
              <div className="space-y-2">
                <Label htmlFor="parentId">
                  Plačnik (starš) <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="parentId"
                  value={parentId || ''}
                  onValueChange={(value) => setParentId(value || null)}
                  required={useExistingParent}
                >
                  <option value="">Izberite plačnika</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="payerName">
                  Ime plačnika <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="payerName"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="Vnesite ime plačnika"
                  required={!useExistingParent}
                />
                <p className="text-xs text-slate-500">
                  Plačilo bo shranjeno kot nepovezano. Pozneje ga lahko povežete s plačnikom.
                </p>
              </div>
            )}
          </div>

          {/* Amount and Date */}
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
              <Label htmlFor="paymentDate">
                Datum plačila <span className="text-red-500">*</span>
              </Label>
              <DateInput
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment method and reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Način plačila</Label>
              <Select
                id="paymentMethod"
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as 'bank_transfer' | 'cash' | 'card' | 'other')
                }
              >
                <option value="bank_transfer">Bančno nakazilo</option>
                <option value="cash">Gotovina</option>
                <option value="card">Kartica</option>
                <option value="other">Drugo</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Referenčna številka</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="npr. SI56..."
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Opombe</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dodatne opombe o plačilu..."
              rows={3}
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
              {isEditMode ? 'Shrani spremembe' : 'Dodaj plačilo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

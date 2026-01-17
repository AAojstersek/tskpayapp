import { useState, useMemo, useEffect } from 'react'
import type { Payment, Cost, Member, Parent } from '@/types'
import { Button, Checkbox, Badge, Input, Label, Select } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { AlertCircle, CheckCircle2, User } from 'lucide-react'

export interface PaymentAllocationDialogProps {
  payment: Payment | null
  costs: Cost[]
  members: Member[]
  parents: Parent[]
  existingAllocations?: Array<{ costId: string; allocatedAmount: number }>
  open: boolean
  onOpenChange: (open: boolean) => void
  onAllocate?: (paymentId: string, allocations: Array<{ costId: string; amount: number }>, parentId?: string) => void
}

interface CostWithMember extends Cost {
  member: Member | undefined
}

export function PaymentAllocationDialog({
  payment,
  costs,
  members,
  parents,
  existingAllocations = [],
  open,
  onOpenChange,
  onAllocate,
}: PaymentAllocationDialogProps) {
  const [selectedCosts, setSelectedCosts] = useState<Map<string, number>>(new Map())
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  // Get the payer info - use selectedParentId if payment is unmatched
  const payer = useMemo(() => {
    if (!payment) return null
    if (payment.parentId) {
      return parents.find((p) => p.id === payment.parentId)
    }
    if (selectedParentId) {
      return parents.find((p) => p.id === selectedParentId)
    }
    return null
  }, [payment, parents, selectedParentId])

  // Is this an unmatched payment that needs parent linking?
  const isUnmatchedPayment = payment && !payment.parentId

  // Get members linked to this payer
  const payerMembers = useMemo(() => {
    if (!payer) return []
    return members.filter((m) => {
      const memberParentIds = m.parentIds && m.parentIds.length > 0
        ? m.parentIds
        : (m.parentId ? [m.parentId] : [])
      return memberParentIds.includes(payer.id)
    })
  }, [payer, members])

  // Get open costs for the payer's members, sorted by due date
  const openCosts = useMemo((): CostWithMember[] => {
    if (!payment) return []
    
    // If payment is linked to a parent, show costs for their members
    if (payer && payerMembers.length > 0) {
      const memberIds = new Set(payerMembers.map((m) => m.id))
      return costs
        .filter((c) => c.status === 'pending' && memberIds.has(c.memberId))
        .map((c) => ({
          ...c,
          member: members.find((m) => m.id === c.memberId),
        }))
        .sort((a, b) => {
          // Sort by due date (earliest first), nulls last
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.localeCompare(b.dueDate)
        })
    }
    
    // If payment is unmatched, show all open costs
    return costs
      .filter((c) => c.status === 'pending')
      .map((c) => ({
        ...c,
        member: members.find((m) => m.id === c.memberId),
      }))
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
  }, [payment, payer, payerMembers, costs, members])

  // Calculate totals
  const totalSelected = useMemo(() => {
    let sum = 0
    selectedCosts.forEach((amount) => {
      sum += amount
    })
    return sum
  }, [selectedCosts])

  const remainingAmount = payment ? payment.amount - totalSelected : 0
  const isExactMatch = Math.abs(remainingAmount) < 0.01

  // Initialize with existing allocations
  useEffect(() => {
    if (open) {
      if (existingAllocations.length > 0) {
        const map = new Map<string, number>()
        existingAllocations.forEach((a) => {
          map.set(a.costId, a.allocatedAmount)
        })
        setSelectedCosts(map)
      } else {
        setSelectedCosts(new Map())
      }
      // Reset parent selection
      setSelectedParentId(payment?.parentId || null)
    }
  }, [open, existingAllocations, payment])

  const handleCostToggle = (costId: string, costAmount: number, checked: boolean) => {
    const newSelected = new Map(selectedCosts)
    if (checked) {
      newSelected.set(costId, costAmount)
    } else {
      newSelected.delete(costId)
    }
    setSelectedCosts(newSelected)
  }

  const handleAmountChange = (costId: string, amount: number) => {
    const newSelected = new Map(selectedCosts)
    if (amount <= 0) {
      newSelected.delete(costId)
    } else {
      newSelected.set(costId, amount)
    }
    setSelectedCosts(newSelected)
  }

  const handleAutoSelect = () => {
    if (!payment) return
    
    // Automatically select costs until the payment amount is reached
    const newSelected = new Map<string, number>()
    let remaining = payment.amount
    
    for (const cost of openCosts) {
      if (remaining <= 0) break
      
      const allocateAmount = Math.min(cost.amount, remaining)
      newSelected.set(cost.id, allocateAmount)
      remaining -= allocateAmount
    }
    
    setSelectedCosts(newSelected)
  }

  const handleSubmit = () => {
    if (!payment || !isExactMatch) return
    
    // If unmatched and no parent selected, require parent selection
    if (isUnmatchedPayment && !selectedParentId) {
      return
    }
    
    const allocations: Array<{ costId: string; amount: number }> = []
    selectedCosts.forEach((amount, costId) => {
      allocations.push({ costId, amount })
    })
    
    // Pass parentId if this is an unmatched payment being linked
    const newParentId = isUnmatchedPayment ? selectedParentId || undefined : undefined
    onAllocate?.(payment.id, allocations, newParentId)
    onOpenChange(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ni roka'
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI')
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (!payment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Razporeditev plačila</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Parent selection for unmatched payments */}
          {isUnmatchedPayment && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Nepovezano plačilo
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      Plačnik: {payment.payerName || 'Neznan'} - Izberite plačnika za povezavo.
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parentSelect" className="text-xs text-amber-700 dark:text-amber-300">
                      Poveži s plačnikom <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      id="parentSelect"
                      value={selectedParentId || ''}
                      onValueChange={(value) => setSelectedParentId(value || null)}
                      className="mt-1"
                    >
                      <option value="">Izberite plačnika...</option>
                      {parents.map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.firstName} {parent.lastName}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment info */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Plačnik</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {payer ? `${payer.firstName} ${payer.lastName}` : payment.payerName || 'Neznan'}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Znesek</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {payment.amount.toFixed(2)} €
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Datum</div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(payment.paymentDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Preostali znesek</div>
                <div className={`text-sm font-medium ${
                  isExactMatch 
                    ? 'text-green-600 dark:text-green-400' 
                    : remainingAmount < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {remainingAmount.toFixed(2)} €
                </div>
              </div>
            </div>
          </div>

          {/* Status message */}
          {!isExactMatch && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              remainingAmount < 0 
                ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300' 
                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">
                {remainingAmount < 0 
                  ? 'Izbrani stroški presegajo znesek plačila. Zmanjšajte izbor.'
                  : 'Izberite stroške, ki skupaj ustrezajo znesku plačila.'}
              </span>
            </div>
          )}

          {isExactMatch && selectedCosts.size > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Znesek se ujema! Plačilo je pripravljeno za knjiženje.</span>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Odprti stroški ({openCosts.length})
            </span>
            <Button variant="outline" size="sm" onClick={handleAutoSelect}>
              Samodejno izberi
            </Button>
          </div>

          {/* Costs list */}
          {openCosts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {payer 
                ? 'Ta plačnik nima odprtih stroškov za svoje tekmovalce.'
                : 'Ni odprtih stroškov za razporeditev.'}
            </div>
          ) : (
            <div className="space-y-2">
              {openCosts.map((cost) => {
                const isSelected = selectedCosts.has(cost.id)
                const allocatedAmount = selectedCosts.get(cost.id) || 0
                
                return (
                  <div
                    key={cost.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => 
                        handleCostToggle(cost.id, cost.amount, checked as boolean)
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {cost.title}
                        </span>
                        {cost.member && (
                          <Badge variant="outline" className="text-xs">
                            {cost.member.firstName} {cost.member.lastName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {cost.costType}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className={`text-xs ${
                          isOverdue(cost.dueDate) 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {formatDate(cost.dueDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {cost.amount.toFixed(2)} €
                      </span>
                      
                      {isSelected && cost.amount !== allocatedAmount && (
                        <div className="w-24">
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={cost.amount}
                            value={allocatedAmount}
                            onChange={(e) => 
                              handleAmountChange(cost.id, parseFloat(e.target.value) || 0)
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Izbrano: <span className="font-medium text-slate-900 dark:text-slate-100">{totalSelected.toFixed(2)} €</span>
            {' '}od{' '}
            <span className="font-medium text-slate-900 dark:text-slate-100">{payment.amount.toFixed(2)} €</span>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Prekliči
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isExactMatch || selectedCosts.size === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              Potrdi knjiženje
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { useState } from 'react'
import { CostList, CostForm, BulkBillingForm } from '@/components/costs'
import { CostTypeManager } from '@/components/costs/CostTypeManager'
import type { Cost } from '@/types'
import { useMembers, useGroups, useCosts, useCostTypes } from '@/data/useAppStore'

export function StroskiInObračunavanjePage() {
  const { members } = useMembers()
  const { groups } = useGroups()
  const { costs, create: createCost, update: updateCost, remove: removeCost } = useCosts()
  const { costTypes } = useCostTypes()
  const [viewMode, setViewMode] = useState<'by-cost' | 'by-member'>('by-cost')
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'paid' | 'cancelled' | 'all'>('all')
  const [costTypeFilter, setCostTypeFilter] = useState<string | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [bulkFormOpen, setBulkFormOpen] = useState(false)
  const [costTypeManagerOpen, setCostTypeManagerOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  const handleCreateCost = () => {
    setEditingCost(null)
    setFormOpen(true)
  }

  const handleEditCost = (id: string) => {
    const cost = costs.find((c) => c.id === id)
    setEditingCost(cost || null)
    setFormOpen(true)
  }

  const handleDeleteCost = (id: string) => {
    removeCost(id)
  }

  const handleSaveCost = (costData: Omit<Cost, 'id' | 'createdAt'>) => {
    if (editingCost) {
      // Update existing cost - amount cannot be changed
      updateCost(editingCost.id, {
        title: costData.title,
        description: costData.description,
        costType: costData.costType,
        dueDate: costData.dueDate,
        status: costData.status,
      })
    } else {
      // Create new cost
      createCost(costData)
    }
    setFormOpen(false)
    setEditingCost(null)
  }

  const handleBulkBilling = (memberIds: string[]) => {
    setSelectedMemberIds(memberIds)
    setBulkFormOpen(true)
  }

  const handleSaveBulkBilling = (bulkData: {
    memberIds: string[]
    title: string
    description: string
    amount: number
    costType: string
    dueDate: string | null
    // Ponavljajoči stroški
    isRecurring?: boolean
    recurringPeriod?: 'monthly' | 'yearly' | 'weekly' | 'quarterly' | null
    recurringStartDate?: string | null
    recurringEndDate?: string | null
    recurringDayOfMonth?: number | null
  }) => {
    bulkData.memberIds.forEach((memberId) => {
      createCost({
        memberId,
        title: bulkData.title,
        description: bulkData.description,
        amount: bulkData.amount,
        costType: bulkData.costType,
        dueDate: bulkData.dueDate,
        status: 'pending',
        // Ponavljajoči stroški
        isRecurring: bulkData.isRecurring || false,
        recurringPeriod: bulkData.recurringPeriod || null,
        recurringStartDate: bulkData.recurringStartDate || null,
        recurringEndDate: bulkData.recurringEndDate || null,
        recurringDayOfMonth: bulkData.recurringDayOfMonth || null,
        recurringTemplateId: null, // Originalni template stroški nimajo template ID-ja
      })
    })

    setBulkFormOpen(false)
    setSelectedMemberIds([])
  }

  return (
    <>
      <CostList
        costs={costs}
        costTypes={costTypes}
        members={members}
        groups={groups}
        viewMode={viewMode}
        groupFilter={groupFilter}
        statusFilter={statusFilter}
        costTypeFilter={costTypeFilter}
        onViewModeChange={setViewMode}
        onCreateCost={handleCreateCost}
        onEditCost={handleEditCost}
        onDeleteCost={handleDeleteCost}
        onBulkBilling={handleBulkBilling}
        onGroupFilterChange={setGroupFilter}
        onStatusFilterChange={setStatusFilter}
        onCostTypeFilterChange={setCostTypeFilter}
        onManageCostTypes={() => setCostTypeManagerOpen(true)}
      />
      <CostForm
        cost={editingCost}
        members={members}
        costTypes={costTypes}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveCost}
      />
      <BulkBillingForm
        selectedMemberIds={selectedMemberIds}
        members={members}
        costTypes={costTypes}
        open={bulkFormOpen}
        onOpenChange={setBulkFormOpen}
        onSave={handleSaveBulkBilling}
      />
      <CostTypeManager
        open={costTypeManagerOpen}
        onOpenChange={setCostTypeManagerOpen}
      />
    </>
  )
}

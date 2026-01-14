import { useState } from 'react'
import { CostList, CostForm, BulkBillingForm } from '@/components/costs'
import type { Cost, Member, Group } from '@/types'

// Sample data - in production, this would come from an API
const initialCosts: Cost[] = [
  {
    id: 'cost-001',
    memberId: 'mem-001',
    title: 'Vadnine - Januar 2024',
    description: 'Mesečne vadnine za januar',
    amount: 50.0,
    costType: 'Vadnine',
    dueDate: '2024-02-15',
    status: 'pending',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cost-002',
    memberId: 'mem-001',
    title: 'Priprave Planica',
    description: 'Priprave za tekmovanje na Planici',
    amount: 150.0,
    costType: 'Priprave',
    dueDate: '2024-02-28',
    status: 'pending',
    createdAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'cost-003',
    memberId: 'mem-002',
    title: 'Vadnine - Januar 2024',
    description: 'Mesečne vadnine za januar',
    amount: 50.0,
    costType: 'Vadnine',
    dueDate: '2024-02-15',
    status: 'paid',
    createdAt: '2024-01-01T10:00:00Z',
  },
]

const costTypes = [
  'Vadnine',
  'Oprema',
  'Članarine',
  'Priprave',
  'Modre kartice',
  'Zdravniški pregledi',
]

// Sample members and groups - in production, these would come from the members page or API
const sampleMembers: Member[] = [
  {
    id: 'mem-001',
    firstName: 'Luka',
    lastName: 'Novak',
    dateOfBirth: '2010-03-15',
    status: 'active',
    notes: '',
    parentId: 'par-001',
    groupId: 'grp-001',
  },
  {
    id: 'mem-002',
    firstName: 'Ana',
    lastName: 'Kovač',
    dateOfBirth: '2011-07-22',
    status: 'active',
    notes: '',
    parentId: 'par-002',
    groupId: 'grp-001',
  },
]

const sampleGroups: Group[] = [
  {
    id: 'grp-001',
    name: 'Andrejeva skupina',
    coachId: 'coa-001',
  },
  {
    id: 'grp-002',
    name: 'Klemnova skupina',
    coachId: 'coa-002',
  },
]

export function StroskiInObračunavanjePage() {
  const [costs, setCosts] = useState<Cost[]>(initialCosts)
  const [viewMode, setViewMode] = useState<'by-cost' | 'by-member'>('by-cost')
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'paid' | 'cancelled' | 'all'>('all')
  const [costTypeFilter, setCostTypeFilter] = useState<string | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [bulkFormOpen, setBulkFormOpen] = useState(false)
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

  const handleCancelCost = (id: string) => {
    if (confirm('Ali ste prepričani, da želite razveljaviti ta strošek?')) {
      setCosts(
        costs.map((c) => (c.id === id ? { ...c, status: 'cancelled' as const } : c))
      )
    }
  }

  const handleSaveCost = (costData: Omit<Cost, 'id' | 'createdAt'>) => {
    if (editingCost) {
      // Update existing cost - amount cannot be changed
      setCosts(
        costs.map((c) =>
          c.id === editingCost.id
            ? {
                ...c,
                title: costData.title,
                description: costData.description,
                costType: costData.costType,
                dueDate: costData.dueDate,
                status: costData.status,
              }
            : c
        )
      )
    } else {
      // Create new cost
      const newCost: Cost = {
        ...costData,
        id: `cost-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      setCosts([...costs, newCost])
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
  }) => {
    const newCosts: Cost[] = bulkData.memberIds.map((memberId) => ({
      id: `cost-${Date.now()}-${memberId}`,
      memberId,
      title: bulkData.title,
      description: bulkData.description,
      amount: bulkData.amount,
      costType: bulkData.costType,
      dueDate: bulkData.dueDate,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }))

    setCosts([...costs, ...newCosts])
    setBulkFormOpen(false)
    setSelectedMemberIds([])
  }

  return (
    <>
      <CostList
        costs={costs}
        costTypes={costTypes}
        members={sampleMembers}
        groups={sampleGroups}
        viewMode={viewMode}
        groupFilter={groupFilter}
        statusFilter={statusFilter}
        costTypeFilter={costTypeFilter}
        onViewModeChange={setViewMode}
        onCreateCost={handleCreateCost}
        onEditCost={handleEditCost}
        onCancelCost={handleCancelCost}
        onBulkBilling={handleBulkBilling}
        onGroupFilterChange={setGroupFilter}
        onStatusFilterChange={setStatusFilter}
        onCostTypeFilterChange={setCostTypeFilter}
      />
      <CostForm
        cost={editingCost}
        members={sampleMembers}
        groups={sampleGroups}
        costTypes={costTypes}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveCost}
      />
      <BulkBillingForm
        selectedMemberIds={selectedMemberIds}
        members={sampleMembers}
        costTypes={costTypes}
        open={bulkFormOpen}
        onOpenChange={setBulkFormOpen}
        onSave={handleSaveBulkBilling}
      />
    </>
  )
}

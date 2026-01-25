import { useState } from 'react'
import { CostList, CostForm, BulkBillingForm, BulkEditCostsDialog } from '@/components/costs'
import type { BulkEditPatch } from '@/components/costs'
import { CostTypeManager } from '@/components/costs/CostTypeManager'
import type { Cost } from '@/types'
import { useMembers, useGroups, useCosts, useCostTypes, useParents } from '@/data/useAppStore'
import { generateEmailExportFile } from '@/data/emailExport'
import { db } from '@/data/database'

export function StroskiInObračunavanjePage() {
  const { members } = useMembers()
  const { groups } = useGroups()
  const { costs, create: createCost, update: updateCost, remove: removeCost } = useCosts()
  const { costTypes } = useCostTypes()
  const { parents } = useParents()
  const [viewMode, setViewMode] = useState<'by-cost' | 'by-member'>('by-cost')
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'paid' | 'overdue' | 'all'>('all')
  const [costTypeFilter, setCostTypeFilter] = useState<string | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [bulkFormOpen, setBulkFormOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkEditCostIds, setBulkEditCostIds] = useState<string[]>([])
  const [costTypeManagerOpen, setCostTypeManagerOpen] = useState(false)
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [selectionClearTrigger, setSelectionClearTrigger] = useState(0)

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
      updateCost(editingCost.id, {
        amount: costData.amount,
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

  const handleBulkEditCosts = (costIds: string[]) => {
    setBulkEditCostIds(costIds)
    setBulkEditOpen(true)
  }

  const handleBulkEditCostsApply = (patch: BulkEditPatch) => {
    // Handle delete operation
    if (patch.delete) {
      bulkEditCostIds.forEach((costId) => {
        removeCost(costId)
      })
      setBulkEditOpen(false)
      setBulkEditCostIds([])
      setSelectionClearTrigger((t) => t + 1)
      return
    }

    // Apply changes to all selected costs
    bulkEditCostIds.forEach((costId) => {
      const updateData: Partial<Cost> = {}
      
      if (patch.amount !== undefined) {
        updateData.amount = patch.amount
      }
      
      if (patch.status !== undefined) {
        updateData.status = patch.status
      }
      
      if (patch.clearDueDate) {
        updateData.dueDate = null
      } else if (patch.dueDate !== undefined) {
        updateData.dueDate = patch.dueDate
      }
      
      // Only update if there's something to change
      if (Object.keys(updateData).length > 0) {
        updateCost(costId, updateData)
      }
    })
    
    setBulkEditOpen(false)
    setBulkEditCostIds([])
    setSelectionClearTrigger((t) => t + 1)
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

  const handleExportEmails = async () => {
    console.log('[handleExportEmails] Handler called!', { 
      parentsCount: parents.length, 
      membersCount: members.length, 
      costsCount: costs.length,
      hasParents: !!parents,
      hasMembers: !!members,
      hasCosts: !!costs
    })
    
    try {
      // Generate email export file content
      const fileContent = generateEmailExportFile(parents, members, costs)
      console.log('[handleExportEmails] Generated file content length:', fileContent.length)

      if (fileContent.trim() === '' || fileContent.includes('Ni staršev')) {
        console.warn('[handleExportEmails] No parents with overdue costs and email addresses')
        // Don't show alert in Tauri - it requires special permissions
        return
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const defaultFilename = `dolzniki-${timestamp}.txt`
      console.log('[handleExportEmails] Saving file:', defaultFilename)

      // Save file using Tauri dialog
      const filePath = await db.saveTextFile(fileContent, defaultFilename)
      console.log('[handleExportEmails] File saved successfully:', filePath)
    } catch (err) {
      console.error('[handleExportEmails] Error exporting emails:', err)
      // Don't use alert() in Tauri - it requires dialog.message permissions
      // Error is already logged to console
    }
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
        onExportEmails={handleExportEmails}
        onBulkEditCosts={handleBulkEditCosts}
        selectionClearTrigger={selectionClearTrigger}
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
      <BulkEditCostsDialog
        selectedCosts={costs.filter((c) => bulkEditCostIds.includes(c.id))}
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        onApply={handleBulkEditCostsApply}
      />
    </>
  )
}

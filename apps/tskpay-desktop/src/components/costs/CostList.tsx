import { useState, useMemo, useEffect } from 'react'
import type { Cost } from '@/types'
import { CostRow } from './CostRow'
import { Button, Badge, Select, Tabs, TabsList, TabsTrigger, Label } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Plus, Users, MoreVertical, Edit, Trash2, Settings, Mail, Pencil } from 'lucide-react'

/**
 * Check if a cost is overdue (pending status with dueDate before today)
 */
function isOverdue(cost: Cost): boolean {
  if (cost.status !== 'pending' || !cost.dueDate) {
    return false
  }
  
  // Calculate today's date at midnight for proper comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD
  
  // Extract date part if it includes time
  const dueDateStr = cost.dueDate.split('T')[0]
  return dueDateStr < todayStr
}

export interface CostListProps {
  costs: Cost[]
  costTypes: string[]
  members?: Array<{
    id: string
    firstName: string
    lastName: string
    groupId: string
    status: 'active' | 'inactive' | 'archived'
  }>
  groups?: Array<{
    id: string
    name: string
  }>
  viewMode?: 'by-cost' | 'by-member'
  groupFilter?: string
  statusFilter?: 'pending' | 'paid' | 'overdue' | 'all'
  costTypeFilter?: string
  onViewModeChange?: (mode: 'by-cost' | 'by-member') => void
  onCreateCost?: () => void
  onEditCost?: (id: string) => void
  onDeleteCost?: (id: string) => void
  onBulkBilling?: (memberIds: string[]) => void
  onGroupFilterChange?: (groupId: string | undefined) => void
  onStatusFilterChange?: (status: 'pending' | 'paid' | 'overdue' | 'all') => void
  onCostTypeFilterChange?: (costType: string | undefined) => void
  onManageCostTypes?: () => void
  onExportEmails?: () => void
  onBulkEditCosts?: (costIds: string[]) => void
  selectionClearTrigger?: number
}

export function CostList({
  costs,
  costTypes,
  members = [],
  groups = [],
  viewMode = 'by-cost',
  groupFilter,
  statusFilter = 'all',
  costTypeFilter,
  onViewModeChange,
  onCreateCost,
  onEditCost,
  onDeleteCost,
  onBulkBilling,
  onGroupFilterChange,
  onStatusFilterChange,
  onCostTypeFilterChange,
  onManageCostTypes,
  onExportEmails,
  onBulkEditCosts,
  selectionClearTrigger,
}: CostListProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [selectedCostIds, setSelectedCostIds] = useState<Set<string>>(new Set())

  const membersMap = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  )
  const groupsMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
  )

  const filteredCosts = useMemo(() => {
    let filtered = costs

    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        // Calculate today's date at midnight for proper comparison
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD
        
        filtered = filtered.filter((c) => {
          const isPending = c.status === 'pending'
          if (!isPending || !c.dueDate) return false
          
          // Extract date part if it includes time
          const dueDateStr = c.dueDate.split('T')[0]
          return dueDateStr < todayStr
        })
      } else {
        filtered = filtered.filter((c) => c.status === statusFilter)
      }
    }

    if (costTypeFilter) {
      filtered = filtered.filter((c) => c.costType === costTypeFilter)
    }

    if (groupFilter) {
      const memberIdsInGroup = members
        .filter((m) => m.groupId === groupFilter)
        .map((m) => m.id)
      filtered = filtered.filter((c) => memberIdsInGroup.includes(c.memberId))
    }

    return filtered
  }, [costs, statusFilter, costTypeFilter, groupFilter, members])

  // Prikazati vse aktivne člane (ne samo tiste s stroški)
  const displayedMembers = useMemo(() => {
    let filtered = members.filter((m) => m.status === 'active')
    
    // Filtrirati po skupini
    if (groupFilter) {
      filtered = filtered.filter((m) => m.groupId === groupFilter)
    }
    
    return filtered
  }, [members, groupFilter])

  // Za vsakega člana pridobiti stroške
  const membersWithCosts = useMemo(() => {
    return displayedMembers.map((member) => {
      const memberCosts = filteredCosts.filter((c) => c.memberId === member.id)
      return {
        member,
        costs: memberCosts,
        totalAmount: memberCosts.reduce((sum, c) => sum + c.amount, 0),
        pendingAmount: memberCosts
          .filter((c) => c.status === 'pending')
          .reduce((sum, c) => sum + c.amount, 0),
      }
    })
  }, [displayedMembers, filteredCosts])

  const handleSelectMember = (memberId: string, selected: boolean) => {
    const newSelected = new Set(selectedMemberIds)
    if (selected) {
      newSelected.add(memberId)
    } else {
      newSelected.delete(memberId)
    }
    setSelectedMemberIds(newSelected)
  }

  // "Select All" funkcionalnost
  const allSelected = displayedMembers.length > 0 && 
    displayedMembers.every((m) => selectedMemberIds.has(m.id))
  const someSelected = displayedMembers.some((m) => selectedMemberIds.has(m.id)) && !allSelected

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedMemberIds)
    if (checked) {
      displayedMembers.forEach((m) => newSelected.add(m.id))
    } else {
      displayedMembers.forEach((m) => newSelected.delete(m.id))
    }
    setSelectedMemberIds(newSelected)
  }

  // Cost selection handlers for by-cost view
  const handleSelectCost = (costId: string, selected: boolean) => {
    const newSelected = new Set(selectedCostIds)
    if (selected) {
      newSelected.add(costId)
    } else {
      newSelected.delete(costId)
    }
    setSelectedCostIds(newSelected)
  }

  // "Select All" functionality for costs
  const allCostsSelected = filteredCosts.length > 0 && 
    filteredCosts.every((c) => selectedCostIds.has(c.id))
  const someCostsSelected = filteredCosts.some((c) => selectedCostIds.has(c.id)) && !allCostsSelected

  const handleSelectAllCosts = (checked: boolean) => {
    const newSelected = new Set(selectedCostIds)
    if (checked) {
      filteredCosts.forEach((c) => newSelected.add(c.id))
    } else {
      filteredCosts.forEach((c) => newSelected.delete(c.id))
    }
    setSelectedCostIds(newSelected)
  }

  // Clear cost selection when filters or viewMode change
  useEffect(() => {
    setSelectedCostIds(new Set())
  }, [viewMode, groupFilter, statusFilter, costTypeFilter])

  // Clear cost selection when selectionClearTrigger changes (after bulk operations)
  useEffect(() => {
    if (selectionClearTrigger !== undefined && selectionClearTrigger > 0) {
      setSelectedCostIds(new Set())
    }
  }, [selectionClearTrigger])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Stroški in obračunavanje
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upravljanje stroškov in obračunavanje obveznosti
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedCostIds.size > 0 && viewMode === 'by-cost' && (
            <Button
              onClick={() => onBulkEditCosts?.(Array.from(selectedCostIds))}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Uredi izbrane ({selectedCostIds.size})
            </Button>
          )}
          {selectedMemberIds.size > 0 && (
            <Button
              onClick={() => onBulkBilling?.(Array.from(selectedMemberIds))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Masovno obračunavanje ({selectedMemberIds.size})
            </Button>
          )}
          {onManageCostTypes && (
            <Button
              onClick={onManageCostTypes}
              variant="outline"
              className="border-slate-300 dark:border-slate-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Vrste stroškov
            </Button>
          )}
          {onExportEmails && (
            <Button
              onClick={() => {
                console.log('[CostList] onExportEmails button clicked')
                onExportEmails()
              }}
              variant="outline"
              className="border-slate-300 dark:border-slate-600"
            >
              <Mail className="w-4 h-4 mr-2" />
              Pripravi mail za dolžnike
            </Button>
          )}
          <Button onClick={onCreateCost} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj strošek
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange?.(v as 'by-cost' | 'by-member')}>
        <TabsList>
          <TabsTrigger value="by-cost">Po stroških</TabsTrigger>
          <TabsTrigger value="by-member">Po članih</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={groupFilter || 'all'}
            onValueChange={(value) => onGroupFilterChange?.(value === 'all' ? undefined : value)}
            className="w-full sm:w-[200px]"
          >
            <option value="all">Vse skupine</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange?.(value as 'pending' | 'paid' | 'overdue' | 'all')
            }
            className="w-full sm:w-[180px]"
          >
            <option value="all">Vsi statusi</option>
            <option value="pending">Odprto</option>
            <option value="paid">Poravnano</option>
            <option value="overdue">Zapadlo</option>
          </Select>

          <Select
            value={costTypeFilter || 'all'}
            onValueChange={(value) => onCostTypeFilterChange?.(value === 'all' ? undefined : value)}
            className="w-full sm:w-[200px]"
          >
            <option value="all">Vse vrste</option>
            {costTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {viewMode === 'by-cost' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allCostsSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = someCostsSelected
                      }}
                      onChange={(e) => handleSelectAllCosts(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      title="Označi vse"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Strošek
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Član
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Skupina
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Vrsta
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Znesek
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Rok plačila
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCosts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      {costs.length === 0 ? (
                        <div className="space-y-2">
                          <p className="text-slate-500 dark:text-slate-400">Ni stroškov</p>
                          <p className="text-sm text-slate-400">Dodajte prvi strošek, da začnete</p>
                          <Button onClick={onCreateCost} className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj strošek
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-slate-500 dark:text-slate-400">Ni stroškov, ki bi ustrezali filtrom.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onStatusFilterChange?.('all')
                              onCostTypeFilterChange?.(undefined)
                              onGroupFilterChange?.(undefined)
                            }}
                          >
                            Počisti filtre
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredCosts.map((cost) => {
                    const member = membersMap.get(cost.memberId)
                    const group = member ? groupsMap.get(member.groupId) : undefined
                    return (
                      <CostRow
                        key={cost.id}
                        cost={cost}
                        memberName={member ? `${member.firstName} ${member.lastName}` : undefined}
                        groupName={group?.name}
                        onEdit={onEditCost}
                        onDelete={onDeleteCost}
                        showCheckbox={true}
                        selected={selectedCostIds.has(cost.id)}
                        onSelectChange={handleSelectCost}
                      />
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'by-member' && (
        <div className="space-y-4">
          {displayedMembers.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="space-y-2">
                <p className="text-slate-500 dark:text-slate-400">Ni aktivnih članov, ki bi ustrezali filtrom.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onGroupFilterChange?.(undefined)
                  }}
                >
                  Počisti filtre
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Select All header */}
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <Label className="font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                    Označi vse ({displayedMembers.length} članov)
                  </Label>
                  {selectedMemberIds.size > 0 && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                      Izbrano: {selectedMemberIds.size}
                    </span>
                  )}
                </div>
              </div>

              {membersWithCosts.map(({ member, costs: memberCosts, totalAmount, pendingAmount }) => {
                const group = groupsMap.get(member.groupId)
                const isSelected = selectedMemberIds.has(member.id)

                return (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                          />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {member.firstName} {member.lastName}
                            </div>
                            {group && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {group.name}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Skupaj: <span className="font-semibold text-slate-900 dark:text-slate-100">{totalAmount.toFixed(2)} €</span>
                          </div>
                          {pendingAmount > 0 && (
                            <div className="text-sm text-amber-600 dark:text-amber-400">
                              Odprto: {pendingAmount.toFixed(2)} €
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                              Strošek
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                              Vrsta
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                              Znesek
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                              Rok
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300">
                              Status
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                              Akcije
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberCosts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                                Ni stroškov
                              </td>
                            </tr>
                          ) : (
                            memberCosts.map((cost) => (
                          <tr
                            key={cost.id}
                            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-4 py-2">
                              <div className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                {cost.title}
                              </div>
                              {cost.description && (
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {cost.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-xs text-slate-700 dark:text-slate-300">
                                {cost.costType}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {cost.amount.toFixed(2)} €
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-xs text-slate-600 dark:text-slate-400">
                                {cost.dueDate
                                  ? new Date(cost.dueDate).toLocaleDateString('sl-SI', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })
                                  : '-'}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              {isOverdue(cost) ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800 text-xs">
                                  Zapadlo
                                </Badge>
                              ) : cost.status === 'pending' ? (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                                  Odprto
                                </Badge>
                              ) : cost.status === 'paid' ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800 text-xs">
                                  Poravnano
                                </Badge>
                              ) : null}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <MoreVertical className="w-3 h-3 text-slate-500" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {onEditCost && (
                                    <DropdownMenuItem onClick={() => onEditCost(cost.id)}>
                                      <Edit className="w-3 h-3 mr-2" />
                                      Uredi
                                    </DropdownMenuItem>
                                  )}
                                  {onDeleteCost && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (confirm(`Ali res želite izbrisati strošek "${cost.title}" (${cost.amount.toFixed(2)} €)?`)) {
                                          onDeleteCost(cost.id)
                                        }
                                      }}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3 mr-2" />
                                      Izbriši
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredCosts.length}</strong> od <strong>{costs.length}</strong> stroškov
      </div>
    </div>
  )
}

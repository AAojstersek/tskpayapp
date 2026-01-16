import { useState, useMemo } from 'react'
import type { Cost } from '@/types'
import { CostRow } from './CostRow'
import { Button, Badge, Select, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Plus, Users, MoreVertical, Edit, X, Settings } from 'lucide-react'

export interface CostListProps {
  costs: Cost[]
  costTypes: string[]
  members?: Array<{
    id: string
    firstName: string
    lastName: string
    groupId: string
  }>
  groups?: Array<{
    id: string
    name: string
  }>
  viewMode?: 'by-cost' | 'by-member'
  groupFilter?: string
  statusFilter?: 'pending' | 'paid' | 'cancelled' | 'all'
  costTypeFilter?: string
  onViewModeChange?: (mode: 'by-cost' | 'by-member') => void
  onCreateCost?: () => void
  onEditCost?: (id: string) => void
  onCancelCost?: (id: string) => void
  onBulkBilling?: (memberIds: string[]) => void
  onGroupFilterChange?: (groupId: string | undefined) => void
  onStatusFilterChange?: (status: 'pending' | 'paid' | 'cancelled' | 'all') => void
  onCostTypeFilterChange?: (costType: string | undefined) => void
  onManageCostTypes?: () => void
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
  onCancelCost,
  onBulkBilling,
  onGroupFilterChange,
  onStatusFilterChange,
  onCostTypeFilterChange,
  onManageCostTypes,
}: CostListProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())

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
      filtered = filtered.filter((c) => c.status === statusFilter)
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

  const costsByMember = useMemo(() => {
    const grouped = new Map<string, typeof filteredCosts>()
    filteredCosts.forEach((cost) => {
      if (!grouped.has(cost.memberId)) {
        grouped.set(cost.memberId, [])
      }
      grouped.get(cost.memberId)!.push(cost)
    })
    return grouped
  }, [filteredCosts])

  const handleSelectMember = (memberId: string, selected: boolean) => {
    const newSelected = new Set(selectedMemberIds)
    if (selected) {
      newSelected.add(memberId)
    } else {
      newSelected.delete(memberId)
    }
    setSelectedMemberIds(newSelected)
  }

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
        <div className="flex gap-2">
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
          <Button onClick={onCreateCost} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj strošek
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(v) => onViewModeChange?.(v as 'by-cost' | 'by-member')}>
        <TabsList>
          <TabsTrigger value="by-cost">Po stroških</TabsTrigger>
          <TabsTrigger value="by-member">Po tekmovalcih</TabsTrigger>
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
              onStatusFilterChange?.(value as 'pending' | 'paid' | 'cancelled' | 'all')
            }
            className="w-full sm:w-[180px]"
          >
            <option value="all">Vsi statusi</option>
            <option value="pending">Odprto</option>
            <option value="paid">Poravnano</option>
            <option value="cancelled">Razveljavljeno</option>
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Strošek
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tekmovalec
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
                    <td colSpan={8} className="px-4 py-12 text-center">
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
                        onCancel={onCancelCost}
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
          {Array.from(costsByMember.entries()).length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
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
            </div>
          ) : (
            Array.from(costsByMember.entries()).map(([memberId, memberCosts]) => {
              const member = membersMap.get(memberId)
              const group = member ? groupsMap.get(member.groupId) : undefined
              const isSelected = selectedMemberIds.has(memberId)
              const totalAmount = memberCosts.reduce((sum, c) => sum + c.amount, 0)
              const pendingAmount = memberCosts
                .filter((c) => c.status === 'pending')
                .reduce((sum, c) => sum + c.amount, 0)

              return (
                <div
                  key={memberId}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectMember(memberId, e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {member ? `${member.firstName} ${member.lastName}` : 'Neznan tekmovalec'}
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
                        {memberCosts.map((cost) => (
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
                              {cost.status === 'pending' ? (
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                                  Odprto
                                </Badge>
                              ) : cost.status === 'paid' ? (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                                  Poravnano
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="border-slate-500 text-slate-500 text-xs"
                                >
                                  Razveljavljeno
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <MoreVertical className="w-3 h-3 text-slate-500" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {onEditCost && cost.status !== 'cancelled' && (
                                    <DropdownMenuItem onClick={() => onEditCost(cost.id)}>
                                      <Edit className="w-3 h-3 mr-2" />
                                      Uredi
                                    </DropdownMenuItem>
                                  )}
                                  {onCancelCost && cost.status !== 'cancelled' && (
                                    <DropdownMenuItem
                                      onClick={() => onCancelCost(cost.id)}
                                      className="text-red-600 dark:text-red-400"
                                    >
                                      <X className="w-3 h-3 mr-2" />
                                      Razveljavi
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredCosts.length}</strong> od <strong>{costs.length}</strong> stroškov
      </div>
    </div>
  )
}

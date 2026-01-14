import { useState, useMemo } from 'react'
import type { ClaniInSkupineProps } from '@/../product/sections/clani-in-skupine/types'
import { MemberRow } from './MemberRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Users, UserCog, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function MemberList({
  members,
  parents,
  groups,
  coaches,
  searchFilter = '',
  statusFilter = 'all',
  groupFilter,
  onViewMember,
  onEditMember,
  onDeleteMember,
  onCreateMember,
  onStatusChange,
  onAssignGroup,
  onBulkStatusChange,
  onBulkAssignGroup,
  onSearchChange,
  onStatusFilterChange,
  onGroupFilterChange,
  onManageParents,
  onManageCoaches,
}: ClaniInSkupineProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [localSearch, setLocalSearch] = useState(searchFilter)

  // Create lookup maps
  const parentsMap = useMemo(
    () => new Map(parents.map((p) => [p.id, p])),
    [parents]
  )
  const groupsMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
  )

  // Filter members
  const filteredMembers = useMemo(() => {
    let filtered = members

    // Search filter
    if (localSearch) {
      const searchLower = localSearch.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(searchLower) ||
          m.lastName.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter)
    }

    // Group filter
    if (groupFilter) {
      filtered = filtered.filter((m) => m.groupId === groupFilter)
    }

    return filtered
  }, [members, localSearch, statusFilter, groupFilter])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredMembers.map((m) => m.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkStatusChange = (status: 'active' | 'inactive' | 'archived') => {
    const ids = Array.from(selectedIds)
    onBulkStatusChange?.(ids, status)
    setSelectedIds(new Set())
  }

  const handleBulkAssignGroup = (groupId: string) => {
    const ids = Array.from(selectedIds)
    onBulkAssignGroup?.(ids, groupId)
    setSelectedIds(new Set())
  }

  const allSelected = filteredMembers.length > 0 && selectedIds.size === filteredMembers.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredMembers.length

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Člani in skupine
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upravljanje tekmovalcev, staršev in trenerskih skupin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onManageParents}
            className="hidden sm:flex"
          >
            <Users className="w-4 h-4 mr-2" />
            Starši
          </Button>
          <Button
            variant="outline"
            onClick={onManageCoaches}
            className="hidden sm:flex"
          >
            <UserCog className="w-4 h-4 mr-2" />
            Trenerji
          </Button>
          <Button onClick={onCreateMember} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj tekmovalca
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Išči po imenu ali priimku..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange?.(value as 'active' | 'inactive' | 'archived' | 'all')
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vsi statusi</SelectItem>
              <SelectItem value="active">Aktivni</SelectItem>
              <SelectItem value="inactive">Neaktivni</SelectItem>
              <SelectItem value="archived">Arhivirani</SelectItem>
            </SelectContent>
          </Select>

          {/* Group Filter */}
          <Select
            value={groupFilter || 'all'}
            onValueChange={(value) => onGroupFilterChange?.(value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Skupina" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Vse skupine</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-blue-900 dark:text-blue-100">
              Izbrano: <strong>{selectedIds.size}</strong> tekmovalcev
            </div>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Spremeni status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}>
                    Aktivni
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('inactive')}>
                    Neaktiven
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkStatusChange('archived')}>
                    Arhiviran
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Dodeli v skupino
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {groups.map((group) => (
                    <DropdownMenuItem
                      key={group.id}
                      onClick={() => handleBulkAssignGroup(group.id)}
                    >
                      {group.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tekmovalec
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Starš
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Skupina
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Opombe
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Ni tekmovalcev, ki bi ustrezali filtrom.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    parent={parentsMap.get(member.parentId)}
                    group={groupsMap.get(member.groupId)}
                    isSelected={selectedIds.has(member.id)}
                    onSelect={handleSelect}
                    onView={onViewMember}
                    onEdit={onEditMember}
                    onDelete={onDeleteMember}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredMembers.length}</strong> od <strong>{members.length}</strong>{' '}
        tekmovalcev
      </div>
    </div>
  )
}


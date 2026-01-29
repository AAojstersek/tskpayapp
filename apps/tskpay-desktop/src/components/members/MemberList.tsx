import { useState, useMemo } from 'react'
import type { Member, Parent, Group, Coach } from '@/types'
import { MemberRow } from './MemberRow'
import { Button, Input, Select } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

export interface MemberListProps {
  members: Member[]
  parents: Parent[]
  groups: Group[]
  coaches: Coach[]
  searchFilter?: string
  statusFilter?: 'active' | 'inactive' | 'archived' | 'all'
  groupFilter?: string
  onViewMember?: (id: string) => void
  onEditMember?: (id: string) => void
  onDeleteMember?: (id: string) => void
  onStatusChange?: (id: string, status: 'active' | 'inactive' | 'archived') => void
  onAssignGroup?: (memberId: string, groupId: string) => void
  onBulkStatusChange?: (memberIds: string[], status: 'active' | 'inactive' | 'archived') => void
  onBulkAssignGroup?: (memberIds: string[], groupId: string) => void
  onSearchChange?: (search: string) => void
  onStatusFilterChange?: (status: 'active' | 'inactive' | 'archived' | 'all') => void
  onGroupFilterChange?: (groupId: string | undefined) => void
}

export function MemberList({
  members,
  parents,
  groups,
  searchFilter = '',
  statusFilter = 'all',
  groupFilter,
  onViewMember,
  onEditMember,
  onDeleteMember,
  onStatusChange,
  onBulkStatusChange,
  onBulkAssignGroup,
  onSearchChange,
  onStatusFilterChange,
  onGroupFilterChange,
}: MemberListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [localSearch, setLocalSearch] = useState(searchFilter)

  const parentsMap = useMemo(
    () => new Map(parents.map((p) => [p.id, p])),
    [parents]
  )
  const groupsMap = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups]
  )

  const filteredMembers = useMemo(() => {
    let filtered = members

    if (localSearch) {
      const searchLower = localSearch.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.firstName.toLowerCase().includes(searchLower) ||
          m.lastName.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((m) => m.status === statusFilter)
    }

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
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Išči po imenu ali priimku..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange?.(value as 'active' | 'inactive' | 'archived' | 'all')
            }
            className="w-full sm:w-[180px]"
          >
            <option value="all">Vsi statusi</option>
            <option value="active">Aktivni</option>
            <option value="inactive">Neaktivni</option>
            <option value="archived">Arhivirani</option>
          </Select>

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
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-blue-900 dark:text-blue-100">
              Izbrano: <strong>{selectedIds.size}</strong> članov
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
                  Član
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
                  <td colSpan={7} className="px-4 py-12 text-center">
                    {members.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni članov</p>
                        <p className="text-sm text-slate-400">Dodajte prvega člana, da začnete</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni članov, ki bi ustrezali filtrom.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLocalSearch('')
                            onSearchChange?.('')
                            onStatusFilterChange?.('all')
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
                filteredMembers.map((member) => {
                  const memberParentIds = member.parentIds && member.parentIds.length > 0
                    ? member.parentIds
                    : (member.parentId ? [member.parentId] : [])
                  const memberParents = memberParentIds
                    .map((pid) => parentsMap.get(pid))
                    .filter((p): p is Parent => p !== undefined)
                  
                  return (
                    <MemberRow
                      key={member.id}
                      member={member}
                      parents={memberParents}
                      group={groupsMap.get(member.groupId)}
                      isSelected={selectedIds.has(member.id)}
                      onSelect={handleSelect}
                      onView={onViewMember}
                      onEdit={onEditMember}
                      onDelete={onDeleteMember}
                      onStatusChange={onStatusChange}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredMembers.length}</strong> od <strong>{members.length}</strong>{' '}
        članov
      </div>
    </div>
  )
}

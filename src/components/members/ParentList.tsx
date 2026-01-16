import { useState, useMemo } from 'react'
import type { Parent, Member } from '@/types'
import { ParentRow } from './ParentRow'
import { Button, Input } from '@/components/ui'

export interface ParentListProps {
  parents: Parent[]
  members?: Member[]
  searchFilter?: string
  onEditParent?: (id: string) => void
  onDeleteParent?: (id: string) => void
  onSearchChange?: (search: string) => void
}

export function ParentList({
  parents,
  members = [],
  searchFilter = '',
  onEditParent,
  onDeleteParent,
  onSearchChange,
}: ParentListProps) {
  const [localSearch, setLocalSearch] = useState(searchFilter)

  const membersByParent = useMemo(
    () => {
      const map = new Map<string, number>()
      members.forEach((m) => {
        const count = map.get(m.parentId) || 0
        map.set(m.parentId, count + 1)
      })
      return map
    },
    [members]
  )

  const filteredParents = useMemo(() => {
    let filtered = parents

    if (localSearch) {
      const searchLower = localSearch.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchLower) ||
          p.lastName.toLowerCase().includes(searchLower) ||
          p.email.toLowerCase().includes(searchLower) ||
          p.phone.includes(localSearch)
      )
    }

    return filtered
  }, [parents, localSearch])

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Išči po imenu, priimku, e-pošti ali telefonu..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Starš
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  E-pošta
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Telefon
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    {parents.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni staršev</p>
                        <p className="text-sm text-slate-400">Dodajte prvega starša, da začnete</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni staršev, ki bi ustrezali filtrom.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLocalSearch('')
                            onSearchChange?.('')
                          }}
                        >
                          Počisti filtre
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <ParentRow
                    key={parent.id}
                    parent={parent}
                    memberCount={membersByParent.get(parent.id) || 0}
                    onEdit={onEditParent}
                    onDelete={onDeleteParent}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredParents.length}</strong> od <strong>{parents.length}</strong> staršev
      </div>
    </div>
  )
}

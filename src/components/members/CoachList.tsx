import { useState, useMemo } from 'react'
import type { Coach, Group } from '@/types'
import { CoachRow } from './CoachRow'
import { Button, Input } from '@/components/ui'

export interface CoachListProps {
  coaches: Coach[]
  groups?: Group[]
  searchFilter?: string
  onEditCoach?: (id: string) => void
  onDeleteCoach?: (id: string) => void
  onRenameGroup?: (coachId: string, groupId: string) => void
  onSearchChange?: (search: string) => void
}

export function CoachList({
  coaches,
  groups = [],
  searchFilter = '',
  onEditCoach,
  onDeleteCoach,
  onRenameGroup,
  onSearchChange,
}: CoachListProps) {
  const [localSearch, setLocalSearch] = useState(searchFilter)

  const filteredCoaches = useMemo(() => {
    let filtered = coaches

    if (localSearch) {
      const searchLower = localSearch.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.includes(localSearch)
      )
    }

    return filtered
  }, [coaches, localSearch])

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
              placeholder="Išči po imenu, e-pošti ali telefonu..."
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
                  Trener
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  E-pošta
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Skupine
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCoaches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    {coaches.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni trenerjev</p>
                        <p className="text-sm text-slate-400">Dodajte prvega trenerja, da začnete</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-slate-500 dark:text-slate-400">Ni trenerjev, ki bi ustrezali filtrom.</p>
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
                filteredCoaches.map((coach) => (
                  <CoachRow
                    key={coach.id}
                    coach={coach}
                    groups={groups}
                    onEdit={onEditCoach}
                    onDelete={onDeleteCoach}
                    onRenameGroup={onRenameGroup}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Prikazano: <strong>{filteredCoaches.length}</strong> od <strong>{coaches.length}</strong> trenerjev
      </div>
    </div>
  )
}

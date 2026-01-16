import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { useCostTypes, useCosts } from '@/data/useAppStore'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'

export interface CostTypeManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CostTypeManager({ open, onOpenChange }: CostTypeManagerProps) {
  const { costTypes, add, update, remove } = useCostTypes()
  const { costs } = useCosts()
  const [newTypeName, setNewTypeName] = useState('')
  const [editingType, setEditingType] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    setError(null)
    if (!newTypeName.trim()) {
      setError('Ime vrste stroška ne sme biti prazno')
      return
    }
    try {
      add(newTypeName.trim())
      setNewTypeName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri dodajanju vrste stroška')
    }
  }

  const handleStartEdit = (typeName: string) => {
    setEditingType(typeName)
    setEditingValue(typeName)
    setError(null)
  }

  const handleSaveEdit = () => {
    if (!editingType) return
    setError(null)
    if (!editingValue.trim()) {
      setError('Ime vrste stroška ne sme biti prazno')
      return
    }
    try {
      update(editingType, editingValue.trim())
      setEditingType(null)
      setEditingValue('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri posodabljanju vrste stroška')
    }
  }

  const handleCancelEdit = () => {
    setEditingType(null)
    setEditingValue('')
    setError(null)
  }

  const handleDelete = (typeName: string) => {
    const usageCount = costs.filter((cost) => cost.costType === typeName).length
    if (usageCount > 0) {
      if (
        !confirm(
          `Vrsta stroška "${typeName}" se uporablja v ${usageCount} stroških. Ali ste prepričani, da jo želite izbrisati?`
        )
      ) {
        return
      }
    } else {
      if (!confirm(`Ali ste prepričani, da želite izbrisati vrsto stroška "${typeName}"?`)) {
        return
      }
    }

    setError(null)
    try {
      remove(typeName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Napaka pri brisanju vrste stroška')
    }
  }

  const getUsageCount = (typeName: string) => {
    return costs.filter((cost) => cost.costType === typeName).length
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Upravljanje vrst stroškov</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Add new cost type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Dodaj novo vrsto stroška
            </label>
            <div className="flex gap-2">
              <Input
                value={newTypeName}
                onChange={(e) => {
                  setNewTypeName(e.target.value)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdd()
                  }
                }}
                placeholder="Vnesite ime vrste stroška"
                className="flex-1"
              />
              <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Dodaj
              </Button>
            </div>
          </div>

          {/* List of cost types */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Vrste stroškov ({costTypes.length})
            </label>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Vrsta stroška
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                        Uporaba
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {costTypes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                          Ni vrst stroškov. Dodajte prvo vrsto.
                        </td>
                      </tr>
                    ) : (
                      costTypes.map((typeName) => (
                        <tr
                          key={typeName}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {editingType === typeName ? (
                              <Input
                                value={editingValue}
                                onChange={(e) => {
                                  setEditingValue(e.target.value)
                                  setError(null)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit()
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit()
                                  }
                                }}
                                className="w-full"
                                autoFocus
                              />
                            ) : (
                              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {typeName}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {getUsageCount(typeName)} stroškov
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {editingType === typeName ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                  >
                                    Prekliči
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Shrani
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStartEdit(typeName)}
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Uredi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(typeName)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Izbriši
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Zapri
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

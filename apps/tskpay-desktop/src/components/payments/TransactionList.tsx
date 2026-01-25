import { useMemo } from 'react'
import type { BankStatement, BankTransaction, Parent } from '@/types'
import { TransactionRow } from './TransactionRow'
import { Button, Select, DateInput, Checkbox } from '@/components/ui'
import { ArrowLeft, Filter } from 'lucide-react'

export interface TransactionListProps {
  bankStatements: BankStatement[]
  bankTransactions: BankTransaction[]
  parents?: Parent[]
  selectedStatementId?: string
  transactionStatusFilter?: 'matched' | 'unmatched' | 'confirmed' | 'all'
  statementFilter?: string
  parentFilter?: string
  dateFrom?: string
  dateTo?: string
  hideConfirmed?: boolean
  onCloseStatement?: () => void
  onUpdateTransactionMatch?: (transactionId: string, parentId: string | null) => void
  onConfirmTransaction?: (transactionId: string) => void
  onTransactionStatusFilterChange?: (status: 'matched' | 'unmatched' | 'confirmed' | 'all') => void
  onStatementFilterChange?: (statementId: string | undefined) => void
  onParentFilterChange?: (parentId: string | undefined) => void
  onDateFromChange?: (date: string | undefined) => void
  onDateToChange?: (date: string | undefined) => void
  onHideConfirmedChange?: (hide: boolean) => void
}

export function TransactionList({
  bankStatements,
  bankTransactions,
  parents = [],
  selectedStatementId,
  transactionStatusFilter = 'all',
  statementFilter,
  parentFilter,
  dateFrom,
  dateTo,
  hideConfirmed = false,
  onCloseStatement,
  onUpdateTransactionMatch,
  onConfirmTransaction,
  onTransactionStatusFilterChange,
  onStatementFilterChange,
  onParentFilterChange,
  onDateFromChange,
  onDateToChange,
  onHideConfirmedChange,
}: TransactionListProps) {
  const selectedStatement = bankStatements.find((s) => s.id === selectedStatementId)

  const filteredTransactions = useMemo(() => {
    let filtered = bankTransactions

    if (selectedStatementId) {
      filtered = filtered.filter((t) => t.bankStatementId === selectedStatementId)
    } else if (statementFilter) {
      filtered = filtered.filter((t) => t.bankStatementId === statementFilter)
    }

    if (transactionStatusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === transactionStatusFilter)
    }

    if (hideConfirmed) {
      filtered = filtered.filter((t) => t.status !== 'confirmed')
    }

    if (parentFilter) {
      filtered = filtered.filter((t) => t.matchedParentId === parentFilter)
    }

    if (dateFrom) {
      filtered = filtered.filter((t) => t.transactionDate >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((t) => t.transactionDate <= dateTo)
    }

    return filtered
  }, [
    bankTransactions,
    selectedStatementId,
    statementFilter,
    transactionStatusFilter,
    hideConfirmed,
    parentFilter,
    dateFrom,
    dateTo,
  ])

  const stats = useMemo(() => {
    const total = filteredTransactions.length
    const matched = filteredTransactions.filter((t) => t.status === 'matched').length
    const unmatched = filteredTransactions.filter((t) => t.status === 'unmatched').length
    const confirmed = filteredTransactions.filter((t) => t.status === 'confirmed').length
    return { total, matched, unmatched, confirmed }
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedStatement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCloseStatement?.()}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Nazaj
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {selectedStatement ? selectedStatement.fileName : 'Vse transakcije'}
            </h2>
            {selectedStatement && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Uvoženo: {new Date(selectedStatement.importedAt).toLocaleDateString('sl-SI')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">Skupaj</div>
          <div className="text-2xl font-semibold mt-1 text-slate-900 dark:text-slate-100">{stats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-700 dark:text-green-300">Ujemajoče</div>
          <div className="text-2xl font-semibold mt-1 text-green-700 dark:text-green-300">
            {stats.matched}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-300">Neujemajoče</div>
          <div className="text-2xl font-semibold mt-1 text-red-700 dark:text-red-300">
            {stats.unmatched}
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300">Potrjene</div>
          <div className="text-2xl font-semibold mt-1 text-blue-700 dark:text-blue-300">
            {stats.confirmed}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtri</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {!selectedStatementId && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Izpisek
              </label>
              <Select
                value={statementFilter || ''}
                onValueChange={(value) => onStatementFilterChange?.(value || undefined)}
              >
                <option value="">Vsi izpiski</option>
                {bankStatements.map((stmt) => (
                  <option key={stmt.id} value={stmt.id}>
                    {stmt.fileName}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <Select
              value={transactionStatusFilter}
              onValueChange={(value) =>
                onTransactionStatusFilterChange?.(
                  value as 'matched' | 'unmatched' | 'confirmed' | 'all'
                )
              }
            >
              <option value="all">Vsi statusi</option>
              <option value="matched">Ujemajoče</option>
              <option value="unmatched">Neujemajoče</option>
              <option value="confirmed">Potrjene</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Starš
            </label>
            <Select
              value={parentFilter || ''}
              onValueChange={(value) => onParentFilterChange?.(value || undefined)}
            >
              <option value="">Vsi starši</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.firstName} {parent.lastName}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Datum od
            </label>
            <DateInput
              value={dateFrom || ''}
              onChange={(e) => onDateFromChange?.(e.target.value || undefined)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Datum do
            </label>
            <DateInput
              value={dateTo || ''}
              onChange={(e) => onDateToChange?.(e.target.value || undefined)}
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={hideConfirmed}
              onCheckedChange={(checked) => onHideConfirmedChange?.(checked)}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Skrij potrjene transakcije
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Datum
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Znesek
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Opis
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Plačnik
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Starš
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    {bankTransactions.length === 0 ? (
                      <div className="space-y-2">
                        <p>Ni transakcij</p>
                        <p className="text-sm">Naložite bančni izpisek, da začnete</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>Ni transakcij, ki bi ustrezale filtrom.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onTransactionStatusFilterChange?.('all')
                            onStatementFilterChange?.(undefined)
                            onParentFilterChange?.(undefined)
                            onDateFromChange?.(undefined)
                            onDateToChange?.(undefined)
                            onHideConfirmedChange?.(false)
                          }}
                        >
                          Počisti filtre
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    parents={parents}
                    onUpdateMatch={onUpdateTransactionMatch}
                    onConfirm={onConfirmTransaction}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import type { PlacilaInBancniUvozProps } from '@/../../product/sections/placila-in-bancni-uvoz/types'
import { TransactionRow } from './TransactionRow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ArrowLeft, CheckCircle2, Filter, X } from 'lucide-react'

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
  onCloseStatement,
  onUpdateTransactionMatch,
  onConfirmTransaction,
  onConfirmAllTransactions,
  onTransactionStatusFilterChange,
  onStatementFilterChange,
  onParentFilterChange,
  onDateFromChange,
  onDateToChange,
}: PlacilaInBancniUvozProps) {
  const selectedStatement = bankStatements.find((s) => s.id === selectedStatementId)

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = bankTransactions

    // Filter by selected statement
    if (selectedStatementId) {
      filtered = filtered.filter((t) => t.bankStatementId === selectedStatementId)
    } else if (statementFilter) {
      filtered = filtered.filter((t) => t.bankStatementId === statementFilter)
    }

    // Filter by status
    if (transactionStatusFilter !== 'all') {
      filtered = filtered.filter((t) => t.status === transactionStatusFilter)
    }

    // Filter by parent
    if (parentFilter) {
      filtered = filtered.filter((t) => t.matchedParentId === parentFilter)
    }

    // Filter by date
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
    parentFilter,
    dateFrom,
    dateTo,
  ])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredTransactions.length
    const matched = filteredTransactions.filter((t) => t.status === 'matched').length
    const unmatched = filteredTransactions.filter((t) => t.status === 'unmatched').length
    const confirmed = filteredTransactions.filter((t) => t.status === 'confirmed').length
    return { total, matched, unmatched, confirmed }
  }, [filteredTransactions])

  const canConfirmAll = useMemo(() => {
    if (!selectedStatementId) return false
    const unconfirmed = filteredTransactions.filter(
      (t) => t.status !== 'confirmed' && t.matchedParentId
    )
    return unconfirmed.length > 0
  }, [filteredTransactions, selectedStatementId])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedStatement && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCloseStatement?.()}
            >
              <ArrowLeft className="size-4" />
              Nazaj
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-semibold">
              {selectedStatement ? selectedStatement.fileName : 'Vse transakcije'}
            </h2>
            {selectedStatement && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Uvoženo: {new Date(selectedStatement.importedAt).toLocaleDateString('sl-SI')}
              </p>
            )}
          </div>
        </div>
        {selectedStatement && canConfirmAll && (
          <Button
            variant="default"
            onClick={() => onConfirmAllTransactions?.(selectedStatement.id)}
          >
            <CheckCircle2 className="size-4" />
            Potrdi vse ujemajoče
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">Skupaj</div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
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

      {/* Filters */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="size-4 text-slate-500" />
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
                onChange={(e) => onStatementFilterChange?.(e.target.value || undefined)}
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
              onChange={(e) =>
                onTransactionStatusFilterChange?.(
                  e.target.value as 'matched' | 'unmatched' | 'confirmed' | 'all'
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
              onChange={(e) => onParentFilterChange?.(e.target.value || undefined)}
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
            <Input
              type="date"
              value={dateFrom || ''}
              onChange={(e) => onDateFromChange?.(e.target.value || undefined)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Datum do
            </label>
            <Input
              type="date"
              value={dateTo || ''}
              onChange={(e) => onDateToChange?.(e.target.value || undefined)}
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
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
                Referenca
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
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  Ni transakcij, ki bi ustrezale filtrom.
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
  )
}


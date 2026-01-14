import type { BankTransaction } from '@/../../product/sections/placila-in-bancni-uvoz/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionRowProps {
  transaction: BankTransaction
  parents?: Array<{
    id: string
    firstName: string
    lastName: string
  }>
  onUpdateMatch?: (transactionId: string, parentId: string | null) => void
  onConfirm?: (transactionId: string) => void
}

export function TransactionRow({
  transaction,
  parents = [],
  onUpdateMatch,
  onConfirm,
}: TransactionRowProps) {
  const matchedParent = parents.find((p) => p.id === transaction.matchedParentId)

  const getStatusBadge = () => {
    switch (transaction.status) {
      case 'matched':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="size-3" />
            Ujemajoča
          </Badge>
        )
      case 'unmatched':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
            <AlertCircle className="size-3" />
            Neujemajoča
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            <CheckCircle2 className="size-3" />
            Potrjena
          </Badge>
        )
      default:
        return null
    }
  }

  const getRowBgColor = () => {
    switch (transaction.status) {
      case 'matched':
        return 'bg-green-50/50 dark:bg-green-950/20'
      case 'unmatched':
        return 'bg-red-50/50 dark:bg-red-950/20'
      case 'confirmed':
        return 'bg-blue-50/50 dark:bg-blue-950/20'
      default:
        return ''
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <tr className={cn('border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors', getRowBgColor())}>
      <td className="px-4 py-3 text-sm">
        {formatDate(transaction.transactionDate)}
      </td>
      <td className="px-4 py-3 text-sm font-medium">
        {formatAmount(transaction.amount)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {transaction.description}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-500">
        {transaction.reference || '-'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Select
            value={transaction.matchedParentId || ''}
            onChange={(e) => {
              const value = e.target.value
              onUpdateMatch?.(transaction.id, value || null)
            }}
            className="min-w-[180px]"
            disabled={transaction.status === 'confirmed'}
          >
            <option value="">-- Izberi starša --</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.firstName} {parent.lastName}
              </option>
            ))}
          </Select>
          {matchedParent && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({transaction.matchConfidence === 'high' ? 'Visoka' : transaction.matchConfidence === 'medium' ? 'Srednja' : 'Nizka'} zaupanja)
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {getStatusBadge()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {transaction.status !== 'confirmed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfirm?.(transaction.id)}
              disabled={!transaction.matchedParentId}
            >
              <CheckCircle2 className="size-4" />
              Potrdi
            </Button>
          )}
          {transaction.status === 'confirmed' && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Potrjeno
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}


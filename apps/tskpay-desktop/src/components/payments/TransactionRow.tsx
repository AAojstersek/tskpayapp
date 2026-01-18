import type { BankTransaction, Parent } from '@/types'
import { Badge, Button, Select } from '@/components/ui'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionRowProps {
  transaction: BankTransaction
  parents?: Parent[]
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
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ujemajoča
          </Badge>
        )
      case 'unmatched':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Neujemajoča
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
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
        return 'bg-green-50/50 dark:bg-green-950/20'
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
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
        {transaction.payerName || 'Neznan'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Select
            value={transaction.matchedParentId || ''}
            onValueChange={(value) => {
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
          {matchedParent && transaction.matchConfidence && (
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
              <CheckCircle2 className="w-4 h-4 mr-1" />
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

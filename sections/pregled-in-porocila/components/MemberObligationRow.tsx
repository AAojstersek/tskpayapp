import type { MemberObligation } from '@/../../product/sections/pregled-in-porocila/types'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemberObligationRowProps {
  obligation: MemberObligation
  onViewMember?: (memberId: string) => void
  onViewParent?: (parentId: string) => void
}

export function MemberObligationRow({
  obligation,
  onViewMember,
  onViewParent,
}: MemberObligationRowProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const getStatusBadge = () => {
    switch (obligation.status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            Aktivni
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
            Neaktivni
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800">
            Arhivirani
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={() => onViewMember?.(obligation.memberId)}
          className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
        >
          {obligation.memberName}
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onViewParent?.(obligation.parentId)}
          className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
        >
          {obligation.parentName}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {obligation.groupName}
      </td>
      <td className="px-4 py-3">
        {getStatusBadge()}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
        {formatAmount(obligation.balance)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {obligation.openItemsCount}
      </td>
      <td className="px-4 py-3">
        {obligation.overdueItemsCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {obligation.overdueItemsCount}
            </span>
            <span className="text-sm text-red-600 dark:text-red-400">
              ({formatAmount(obligation.overdueAmount)})
            </span>
            <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
          </div>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
        )}
      </td>
    </tr>
  )
}


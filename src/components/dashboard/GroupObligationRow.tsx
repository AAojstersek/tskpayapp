import type { GroupObligation } from '@/types'
import { AlertCircle } from 'lucide-react'

interface GroupObligationRowProps {
  obligation: GroupObligation
  onViewGroup?: (groupId: string) => void
}

export function GroupObligationRow({
  obligation,
  onViewGroup,
}: GroupObligationRowProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  return (
    <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={() => onViewGroup?.(obligation.groupId)}
          className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
        >
          {obligation.groupName}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {obligation.memberCount}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
        {formatAmount(obligation.totalOpenDebt)}
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
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">-</span>
        )}
      </td>
    </tr>
  )
}

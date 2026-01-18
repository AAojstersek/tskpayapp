import type { Cost } from '@/types'
import { Badge } from '@/components/ui'
import { MoreVertical, Edit, Trash2, Repeat } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface CostRowProps {
  cost: Cost
  memberName?: string | null
  groupName?: string | null
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  showMemberColumn?: boolean
  showGroupColumn?: boolean
}

export function CostRow({
  cost,
  memberName,
  groupName,
  onEdit,
  onDelete,
  showMemberColumn = true,
  showGroupColumn = true,
}: CostRowProps) {
  const handleDelete = () => {
    if (confirm(`Ali res želite izbrisati strošek "${cost.title}" (${cost.amount.toFixed(2)} €)?`)) {
      onDelete?.(cost.id)
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
            Odprto
          </Badge>
        )
      case 'paid':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            Poravnano
          </Badge>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {cost.title}
          </div>
          {cost.isRecurring && (
            <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Ponavljajoč
            </Badge>
          )}
          {cost.recurringTemplateId && (
            <Badge variant="outline" className="border-slate-400 text-slate-500 dark:text-slate-400 text-xs">
              Avtomatsko
            </Badge>
          )}
        </div>
        {cost.description && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {cost.description}
          </div>
        )}
      </td>
      {showMemberColumn && (
        <td className="px-4 py-3">
          {memberName ? (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {memberName}
            </div>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </td>
      )}
      {showGroupColumn && (
        <td className="px-4 py-3">
          {groupName ? (
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {groupName}
            </span>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </td>
      )}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {cost.costType}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {cost.amount.toFixed(2)} €
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {formatDate(cost.dueDate)}
        </div>
      </td>
      <td className="px-4 py-3">
        {getStatusBadge(cost.status)}
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(cost.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Uredi
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Izbriši
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

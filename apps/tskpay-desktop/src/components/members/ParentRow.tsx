import type { Parent } from '@/types'
import { MoreVertical, Edit, Trash2, Users } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface ParentRowProps {
  parent: Parent
  memberCount?: number
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ParentRow({
  parent,
  memberCount = 0,
  onEdit,
  onDelete,
}: ParentRowProps) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {parent.firstName} {parent.lastName}
            </div>
            {memberCount > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {memberCount} {memberCount === 1 ? 'tekmovalec' : 'tekmovalcev'}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {parent.email}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {parent.phone}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(parent.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Uredi
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(parent.id)}
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

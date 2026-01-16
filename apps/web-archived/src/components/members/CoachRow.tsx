import type { Coach, Group } from '@/types'
import { Badge } from '@/components/ui'
import { MoreVertical, Edit, Trash2, UserCog } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

interface CoachRowProps {
  coach: Coach
  groups?: Group[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onRenameGroup?: (coachId: string, groupId: string) => void
}

export function CoachRow({
  coach,
  groups = [],
  onEdit,
  onDelete,
  onRenameGroup,
}: CoachRowProps) {
  const coachGroups = groups.filter((g) => g.coachId === coach.id)
  const primaryGroup = coachGroups[0]

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <UserCog className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {coach.name}
            </div>
            {coachGroups.length > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {coachGroups.length} {coachGroups.length === 1 ? 'skupina' : 'skupine'}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {coach.email}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700 dark:text-slate-300">
          {coach.phone}
        </div>
      </td>
      <td className="px-4 py-3">
        {primaryGroup ? (
          <Badge variant="outline" className="text-xs">
            {primaryGroup.name}
          </Badge>
        ) : (
          <span className="text-sm text-slate-400">Ni skupine</span>
        )}
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
              <DropdownMenuItem onClick={() => onEdit(coach.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Uredi
              </DropdownMenuItem>
            )}
            {onRenameGroup && primaryGroup && (
              <DropdownMenuItem onClick={() => onRenameGroup(coach.id, primaryGroup.id)}>
                Preimenuj skupino
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(coach.id)}
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

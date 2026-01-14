import { useState } from 'react'
import type { Member, Parent, Group } from '@/../product/sections/clani-in-skupine/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Edit, Trash2, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MemberRowProps {
  member: Member
  parent: Parent | undefined
  group: Group | undefined
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: 'active' | 'inactive' | 'archived') => void
}

export function MemberRow({
  member,
  parent,
  group,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: MemberRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
            Aktivni
          </Badge>
        )
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-slate-400 hover:bg-slate-500 text-white">
            Neaktiven
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="outline" className="border-slate-500 text-slate-500">
            Arhiviran
          </Badge>
        )
      default:
        return null
    }
  }

  const getRowClassName = (status: string) => {
    if (status === 'archived') {
      return 'opacity-60'
    }
    if (status === 'inactive') {
      return 'opacity-75'
    }
    return ''
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <tr
      className={`
        border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50
        transition-colors ${getRowClassName(member.status)}
      `}
    >
      <td className="px-4 py-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(member.id, checked === true)}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {calculateAge(member.dateOfBirth)} let
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {parent ? (
          <div className="text-sm text-slate-700 dark:text-slate-300">
            {parent.firstName} {parent.lastName}
          </div>
        ) : (
          <span className="text-sm text-slate-400">Ni dodeljen</span>
        )}
      </td>
      <td className="px-4 py-3">
        {group ? (
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {group.name}
          </span>
        ) : (
          <span className="text-sm text-slate-400">Ni dodeljen</span>
        )}
      </td>
      <td className="px-4 py-3">
        {getStatusBadge(member.status)}
      </td>
      <td className="px-4 py-3">
        {member.notes ? (
          <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
            {member.notes}
          </div>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <MoreVertical className="w-4 h-4 text-slate-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(member.id)}>
                Pregled
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(member.id)}>
                <Edit className="w-4 h-4 mr-2" />
                Uredi
              </DropdownMenuItem>
            )}
            {onStatusChange && member.status !== 'active' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(member.id, 'active')}
              >
                Nastavi kot aktivni
              </DropdownMenuItem>
            )}
            {onStatusChange && member.status !== 'inactive' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(member.id, 'inactive')}
              >
                Nastavi kot neaktiven
              </DropdownMenuItem>
            )}
            {onStatusChange && member.status !== 'archived' && (
              <DropdownMenuItem
                onClick={() => onStatusChange(member.id, 'archived')}
              >
                Arhiviraj
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(member.id)}
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


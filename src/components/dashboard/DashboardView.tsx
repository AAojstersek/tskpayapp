import { useMemo, useState } from 'react'
import type { DashboardKPIs, MemberObligation, GroupObligation, FinancialReport, AuditLogEntry } from '@/types'
import { MemberObligationRow } from './MemberObligationRow'
import { GroupObligationRow } from './GroupObligationRow'
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Input, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Download, Filter, Users, FileText, Clock, AlertCircle } from 'lucide-react'

export interface DashboardViewProps {
  dashboardKPIs: DashboardKPIs
  memberObligations: MemberObligation[]
  groupObligations: GroupObligation[]
  financialReports: FinancialReport
  auditLog: AuditLogEntry[]
  periodFrom?: string
  periodTo?: string
  groupFilter?: string
  memberStatusFilter?: 'active' | 'inactive' | 'all'
  viewMode?: 'by-member' | 'by-group'
  onPeriodFromChange?: (date: string | undefined) => void
  onPeriodToChange?: (date: string | undefined) => void
  onGroupFilterChange?: (groupId: string | undefined) => void
  onMemberStatusFilterChange?: (status: 'active' | 'inactive' | 'all') => void
  onViewModeChange?: (mode: 'by-member' | 'by-group') => void
  onViewMemberDetails?: (memberId: string) => void
  onViewParentDetails?: (parentId: string) => void
  onViewGroupDetails?: (groupId: string) => void
  onExportByParent?: (parentId: string, format: 'csv' | 'pdf', options?: { onlyOverdue?: boolean; periodFrom?: string; periodTo?: string }) => void
  onExportByGroup?: (groupId: string, format: 'csv' | 'pdf', options?: { onlyOverdue?: boolean; periodFrom?: string; periodTo?: string }) => void
}

export function DashboardView({
  dashboardKPIs,
  memberObligations,
  groupObligations,
  financialReports,
  auditLog,
  periodFrom,
  periodTo,
  groupFilter,
  memberStatusFilter = 'all',
  viewMode = 'by-member',
  onPeriodFromChange,
  onPeriodToChange,
  onGroupFilterChange,
  onMemberStatusFilterChange,
  onViewModeChange,
  onViewMemberDetails,
  onViewParentDetails,
  onViewGroupDetails,
  onExportByParent,
  onExportByGroup,
}: DashboardViewProps) {
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const filteredMemberObligations = useMemo(() => {
    let filtered = memberObligations

    if (memberStatusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === memberStatusFilter)
    }

    if (groupFilter) {
      filtered = filtered.filter((o) => o.groupId === groupFilter)
    }

    return filtered
  }, [memberObligations, memberStatusFilter, groupFilter])

  const filteredGroupObligations = useMemo(() => {
    if (groupFilter) {
      return groupObligations.filter((o) => o.groupId === groupFilter)
    }
    return groupObligations
  }, [groupObligations, groupFilter])

  const groups = useMemo(() => {
    const unique = new Map<string, string>()
    memberObligations.forEach((o) => {
      if (!unique.has(o.groupId)) {
        unique.set(o.groupId, o.groupName)
      }
    })
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }))
  }, [memberObligations])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('sl-SI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'bulk_billing':
        return <Users className="w-4 h-4" />
      case 'import_confirmed':
        return <FileText className="w-4 h-4" />
      case 'cost_cancelled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Skupni odprti dolg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {formatAmount(dashboardKPIs.totalOpenDebt)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Odprte postavke
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {dashboardKPIs.openItemsCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Prejeta plačila
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {formatAmount(dashboardKPIs.paymentsInPeriod)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Neujemajoče transakcije
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {dashboardKPIs.unmatchedTransactionsCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-lg font-semibold">Filtri</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Obdobje od
              </label>
              <Input
                type="date"
                value={periodFrom || ''}
                onChange={(e) => onPeriodFromChange?.(e.target.value || undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Obdobje do
              </label>
              <Input
                type="date"
                value={periodTo || ''}
                onChange={(e) => onPeriodToChange?.(e.target.value || undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Skupina
              </label>
              <Select
                value={groupFilter || ''}
                onValueChange={(value) => onGroupFilterChange?.(value || undefined)}
              >
                <option value="">Vse skupine</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Status člana
              </label>
              <Select
                value={memberStatusFilter}
                onValueChange={(value) =>
                  onMemberStatusFilterChange?.(
                    value as 'active' | 'inactive' | 'all'
                  )
                }
              >
                <option value="all">Vsi</option>
                <option value="active">Aktivni</option>
                <option value="inactive">Neaktivni</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg font-semibold">Obveznosti</CardTitle>
              <Tabs value={viewMode} onValueChange={(v) => onViewModeChange?.(v as 'by-member' | 'by-group')}>
                <TabsList>
                  <TabsTrigger value="by-member">Po tekmovalcih</TabsTrigger>
                  <TabsTrigger value="by-group">Po skupinah</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-2">
              {viewMode === 'by-member' && selectedParentId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Izvoz
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => onExportByParent?.(selectedParentId, 'csv')}
                    >
                      Izvozi CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onExportByParent?.(selectedParentId, 'pdf')}
                    >
                      Izvozi PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {viewMode === 'by-group' && selectedGroupId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Izvoz
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => onExportByGroup?.(selectedGroupId, 'csv')}
                    >
                      Izvozi CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onExportByGroup?.(selectedGroupId, 'pdf')}
                    >
                      Izvozi PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {viewMode === 'by-member' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Tekmovalec
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Starš
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Skupina
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Saldo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Odprte postavke
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Zapadle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberObligations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        {memberObligations.length === 0 ? (
                          <div className="space-y-2">
                            <p className="text-slate-500 dark:text-slate-400">Ni obveznosti</p>
                            <p className="text-sm text-slate-400">Obveznosti se bodo prikazale, ko bodo ustvarjeni stroški</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-slate-500 dark:text-slate-400">Ni obveznosti, ki bi ustrezale filtrom.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onMemberStatusFilterChange?.('all')
                                onGroupFilterChange?.(undefined)
                              }}
                            >
                              Počisti filtre
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredMemberObligations.map((obligation) => (
                      <MemberObligationRow
                        key={obligation.memberId}
                        obligation={obligation}
                        onViewMember={onViewMemberDetails}
                        onViewParent={(id) => {
                          setSelectedParentId(id)
                          onViewParentDetails?.(id)
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Skupina
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Št. članov
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Skupni dolg
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Odprte postavke
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Zapadle
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroupObligations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        {groupObligations.length === 0 ? (
                          <div className="space-y-2">
                            <p className="text-slate-500 dark:text-slate-400">Ni obveznosti</p>
                            <p className="text-sm text-slate-400">Obveznosti se bodo prikazale, ko bodo ustvarjeni stroški</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-slate-500 dark:text-slate-400">Ni obveznosti, ki bi ustrezale filtrom.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                onGroupFilterChange?.(undefined)
                              }}
                            >
                              Počisti filtre
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredGroupObligations.map((obligation) => (
                      <GroupObligationRow
                        key={obligation.groupId}
                        obligation={obligation}
                        onViewGroup={(id) => {
                          setSelectedGroupId(id)
                          onViewGroupDetails?.(id)
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Finančni pregled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Obdobje: {formatDate(financialReports.period.from)} - {formatDate(financialReports.period.to)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Ustvarjeno</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {formatAmount(financialReports.comparison.created)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Plačano</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatAmount(financialReports.comparison.paid)}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">Stopnja plačil</div>
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {financialReports.comparison.paymentRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revizijska sled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {auditLog.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  Ni zapisov v revizijski sledi
                </p>
              ) : (
                auditLog.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="mt-0.5 text-slate-400 dark:text-slate-500">
                      {getActionIcon(entry.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {entry.description}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {entry.userName} • {formatDateTime(entry.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

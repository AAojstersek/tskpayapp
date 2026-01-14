// =============================================================================
// Data Types
// =============================================================================

export interface DashboardKPIs {
  totalOpenDebt: number
  openItemsCount: number
  paymentsInPeriod: number
  unmatchedTransactionsCount: number
}

export interface MemberObligation {
  memberId: string
  memberName: string
  parentId: string
  parentName: string
  groupId: string
  groupName: string
  status: 'active' | 'inactive' | 'archived'
  balance: number
  openItemsCount: number
  overdueItemsCount: number
  overdueAmount: number
  openItems: Array<{
    costId: string
    title: string
    amount: number
    dueDate: string | null
    isOverdue: boolean
  }>
}

export interface GroupObligation {
  groupId: string
  groupName: string
  totalOpenDebt: number
  openItemsCount: number
  overdueItemsCount: number
  overdueAmount: number
  memberCount: number
}

export interface FinancialReport {
  period: {
    from: string
    to: string
  }
  income: {
    total: number
    byMonth: Array<{
      month: string
      amount: number
      paymentCount: number
    }>
  }
  costs: {
    total: number
    byMonth: Array<{
      month: string
      amount: number
      costCount: number
    }>
    byType: Array<{
      costType: string
      amount: number
      costCount: number
    }>
  }
  comparison: {
    created: number
    paid: number
    difference: number
    paymentRate: number
  }
}

export interface AuditLogEntry {
  id: string
  action: 'bulk_billing' | 'import_confirmed' | 'cost_cancelled' | 'cost_created' | 'cost_updated' | 'payment_created'
  description: string
  userId: string
  userName: string
  timestamp: string
  details: Record<string, unknown>
}

// =============================================================================
// Component Props
// =============================================================================

export interface PregledInPorocilaProps {
  /** Ključne številke za nadzorno ploščo */
  dashboardKPIs: DashboardKPIs
  /** Pregled obveznosti po tekmovalcih */
  memberObligations: MemberObligation[]
  /** Pregled obveznosti po skupinah */
  groupObligations: GroupObligation[]
  /** Finančni pregledi */
  financialReports: FinancialReport
  /** Revizijska sled akcij */
  auditLog: AuditLogEntry[]
  /** Filtrirana vrednost za obdobje od */
  periodFrom?: string
  /** Filtrirana vrednost za obdobje do */
  periodTo?: string
  /** Filtrirana vrednost za skupino */
  groupFilter?: string
  /** Filtrirana vrednost za status člana */
  memberStatusFilter?: 'active' | 'inactive' | 'all'
  /** Filtrirana vrednost za prikaz (po tekmovalcih ali po skupinah) */
  viewMode?: 'by-member' | 'by-group'
  /** Pokliče se, ko uporabnik spremeni filter za obdobje od */
  onPeriodFromChange?: (date: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za obdobje do */
  onPeriodToChange?: (date: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za skupino */
  onGroupFilterChange?: (groupId: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za status člana */
  onMemberStatusFilterChange?: (status: 'active' | 'inactive' | 'all') => void
  /** Pokliče se, ko uporabnik spremeni način prikaza */
  onViewModeChange?: (mode: 'by-member' | 'by-group') => void
  /** Pokliče se, ko uporabnik klikne na tekmovalca za podrobnosti */
  onViewMemberDetails?: (memberId: string) => void
  /** Pokliče se, ko uporabnik klikne na starša za podrobnosti */
  onViewParentDetails?: (parentId: string) => void
  /** Pokliče se, ko uporabnik klikne na skupino za podrobnosti */
  onViewGroupDetails?: (groupId: string) => void
  /** Pokliče se, ko uporabnik želi izvoziti odprte postavke po staršu */
  onExportByParent?: (parentId: string, format: 'csv' | 'pdf', options?: { onlyOverdue?: boolean; periodFrom?: string; periodTo?: string }) => void
  /** Pokliče se, ko uporabnik želi izvoziti odprte postavke po skupini */
  onExportByGroup?: (groupId: string, format: 'csv' | 'pdf', options?: { onlyOverdue?: boolean; periodFrom?: string; periodTo?: string }) => void
}


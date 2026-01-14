// =============================================================================
// Data Types
// =============================================================================

export interface Cost {
  id: string
  memberId: string
  title: string
  description: string
  amount: number
  costType: string
  dueDate: string | null
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
}

export interface CostType {
  name: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface StroskiInObračunavanjeProps {
  /** Seznam vseh stroškov */
  costs: Cost[]
  /** Prednastavljeni seznam vrst stroškov */
  costTypes: string[]
  /** Seznam vseh tekmovalcev (za povezavo) */
  members?: Array<{
    id: string
    firstName: string
    lastName: string
    groupId: string
  }>
  /** Seznam vseh skupin (za filtre) */
  groups?: Array<{
    id: string
    name: string
  }>
  /** Aktiven pregled: 'by-cost' ali 'by-member' */
  viewMode?: 'by-cost' | 'by-member'
  /** Filtrirana vrednost za skupino */
  groupFilter?: string
  /** Filtrirana vrednost za status */
  statusFilter?: 'pending' | 'paid' | 'cancelled' | 'all'
  /** Filtrirana vrednost za vrsto stroška */
  costTypeFilter?: string
  /** Pokliče se, ko uporabnik preklopi med pogledoma */
  onViewModeChange?: (mode: 'by-cost' | 'by-member') => void
  /** Pokliče se, ko uporabnik želi ustvariti nov strošek */
  onCreateCost?: () => void
  /** Pokliče se, ko uporabnik želi urediti strošek */
  onEditCost?: (id: string) => void
  /** Pokliče se, ko uporabnik želi razveljaviti strošek */
  onCancelCost?: (id: string) => void
  /** Pokliče se, ko uporabnik želi masovno obračunavanje */
  onBulkBilling?: (memberIds: string[]) => void
  /** Pokliče se, ko uporabnik spremeni filter za skupino */
  onGroupFilterChange?: (groupId: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za status */
  onStatusFilterChange?: (status: 'pending' | 'paid' | 'cancelled' | 'all') => void
  /** Pokliče se, ko uporabnik spremeni filter za vrsto stroška */
  onCostTypeFilterChange?: (costType: string | undefined) => void
}


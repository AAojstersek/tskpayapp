// =============================================================================
// Data Types
// =============================================================================

export interface Coach {
  id: string
  name: string
  email: string
  phone: string
}

export interface Group {
  id: string
  name: string
  coachId: string
}

export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface Member {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  status: 'active' | 'inactive' | 'archived'
  notes: string
  parentId: string
  groupId: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface ClaniInSkupineProps {
  /** Seznam vseh tekmovalcev */
  members: Member[]
  /** Seznam vseh staršev */
  parents: Parent[]
  /** Seznam vseh skupin */
  groups: Group[]
  /** Seznam vseh trenerjev */
  coaches: Coach[]
  /** Filtrirana vrednost za iskanje (po imenu/priimku) */
  searchFilter?: string
  /** Filtrirana vrednost za status */
  statusFilter?: 'active' | 'inactive' | 'archived' | 'all'
  /** Filtrirana vrednost za skupino */
  groupFilter?: string
  /** Pokliče se, ko uporabnik želi pregledati podrobnosti tekmovalca */
  onViewMember?: (id: string) => void
  /** Pokliče se, ko uporabnik želi urediti tekmovalca */
  onEditMember?: (id: string) => void
  /** Pokliče se, ko uporabnik želi izbrisati tekmovalca */
  onDeleteMember?: (id: string) => void
  /** Pokliče se, ko uporabnik želi dodati novega tekmovalca */
  onCreateMember?: () => void
  /** Pokliče se, ko uporabnik spremeni status tekmovalca */
  onStatusChange?: (id: string, status: 'active' | 'inactive' | 'archived') => void
  /** Pokliče se, ko uporabnik dodeli tekmovalca v skupino */
  onAssignGroup?: (memberId: string, groupId: string) => void
  /** Pokliče se, ko uporabnik izvede masovno spremembo statusa */
  onBulkStatusChange?: (memberIds: string[], status: 'active' | 'inactive' | 'archived') => void
  /** Pokliče se, ko uporabnik izvede masovno dodelitev v skupino */
  onBulkAssignGroup?: (memberIds: string[], groupId: string) => void
  /** Pokliče se, ko uporabnik spremeni filter za iskanje */
  onSearchChange?: (search: string) => void
  /** Pokliče se, ko uporabnik spremeni filter za status */
  onStatusFilterChange?: (status: 'active' | 'inactive' | 'archived' | 'all') => void
  /** Pokliče se, ko uporabnik spremeni filter za skupino */
  onGroupFilterChange?: (groupId: string) => void
  /** Pokliče se, ko uporabnik želi upravljati starše */
  onManageParents?: () => void
  /** Pokliče se, ko uporabnik želi upravljati trenerje */
  onManageCoaches?: () => void
}


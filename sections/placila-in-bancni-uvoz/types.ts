// =============================================================================
// Data Types
// =============================================================================

export interface BankStatement {
  id: string
  fileName: string
  fileType: 'pdf' | 'xml'
  importedAt: string
  status: 'processing' | 'completed' | 'failed'
  totalTransactions: number
  matchedTransactions: number
  unmatchedTransactions: number
}

export interface BankTransaction {
  id: string
  bankStatementId: string
  transactionDate: string
  amount: number
  description: string
  reference: string | null
  accountNumber: string
  matchedParentId: string | null
  matchConfidence: 'high' | 'medium' | 'low' | null
  status: 'matched' | 'unmatched' | 'confirmed'
  paymentId: string | null
}

export interface Payment {
  id: string
  parentId: string
  amount: number
  paymentDate: string
  paymentMethod: 'bank_transfer' | 'cash' | 'card' | 'other'
  referenceNumber: string | null
  notes: string
  importedFromBank: boolean
  bankTransactionId: string | null
  createdAt: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface PlacilaInBancniUvozProps {
  /** Seznam vseh bančnih izpiskov */
  bankStatements: BankStatement[]
  /** Seznam vseh bančnih transakcij */
  bankTransactions: BankTransaction[]
  /** Seznam vseh plačil */
  payments: Payment[]
  /** Seznam vseh staršev (za povezavo) */
  parents?: Array<{
    id: string
    firstName: string
    lastName: string
  }>
  /** Aktiven uvoz za prikaz podrobnosti (če je undefined, prikaže seznam uvozov) */
  selectedStatementId?: string
  /** Filtrirana vrednost za status transakcije */
  transactionStatusFilter?: 'matched' | 'unmatched' | 'confirmed' | 'all'
  /** Filtrirana vrednost za uvoz */
  statementFilter?: string
  /** Filtrirana vrednost za starša */
  parentFilter?: string
  /** Filtrirana vrednost za datum od */
  dateFrom?: string
  /** Filtrirana vrednost za datum do */
  dateTo?: string
  /** Pokliče se, ko uporabnik želi naložiti nov bančni izpisek */
  onUploadStatement?: (file: File) => void
  /** Pokliče se, ko uporabnik odpre podrobnosti uvoza */
  onViewStatement?: (statementId: string) => void
  /** Pokliče se, ko uporabnik zapre podrobnosti uvoza */
  onCloseStatement?: () => void
  /** Pokliče se, ko uporabnik spremeni povezavo transakcije s staršem */
  onUpdateTransactionMatch?: (transactionId: string, parentId: string | null) => void
  /** Pokliče se, ko uporabnik potrdi posamezno transakcijo */
  onConfirmTransaction?: (transactionId: string) => void
  /** Pokliče se, ko uporabnik potrdi vse transakcije iz uvoza */
  onConfirmAllTransactions?: (statementId: string) => void
  /** Pokliče se, ko uporabnik spremeni filter za status transakcije */
  onTransactionStatusFilterChange?: (status: 'matched' | 'unmatched' | 'confirmed' | 'all') => void
  /** Pokliče se, ko uporabnik spremeni filter za uvoz */
  onStatementFilterChange?: (statementId: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za starša */
  onParentFilterChange?: (parentId: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za datum od */
  onDateFromChange?: (date: string | undefined) => void
  /** Pokliče se, ko uporabnik spremeni filter za datum do */
  onDateToChange?: (date: string | undefined) => void
}


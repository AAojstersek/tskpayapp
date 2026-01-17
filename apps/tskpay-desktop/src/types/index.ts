// =============================================================================
// Core Data Model Types
// =============================================================================

/**
 * Tekmovalec kluba, ki je vezan na starša (plačnika) in pripada eni ali več trenerskim skupinam.
 */
export interface Member {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  status: 'active' | 'inactive' | 'archived'
  notes: string
  parentId?: string // Glavni starš (ohranjeno za kompatibilnost)
  parentIds: string[] // Vsi starši tekmovalca
  groupId: string
}

/**
 * Starš tekmovalca, ki je odgovoren za plačila in je vezan na enega ali več tekmovalcev.
 */
export interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

/**
 * Trener, ki vodi trenersko skupino in je odgovoren za določeno starostno skupino otrok.
 */
export interface Coach {
  id: string
  name: string
  email: string
  phone: string
}

/**
 * Trenerska skupina (npr. Andrejeva skupina, Klemnova skupina, Luka skupina),
 * ki ima enega trenerja in vključuje več tekmovalcev.
 */
export interface Group {
  id: string
  name: string
  coachId: string
}

/**
 * Strošek, ki je vezan na tekmovalca in predstavlja različne vrste obveznosti
 * (vadnine, oprema, članarine, priprave, modre kartice, zdravniški pregledi).
 */
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
  // Ponavljajoči stroški
  isRecurring?: boolean
  recurringPeriod?: 'monthly' | 'yearly' | 'weekly' | 'quarterly' | null
  recurringStartDate?: string | null
  recurringEndDate?: string | null
  recurringDayOfMonth?: number | null
  recurringTemplateId?: string | null
}

/**
 * Vrsta stroška (prednastavljene vrednosti).
 */
export type CostType = 
  | 'vadnine'
  | 'oprema'
  | 'članarine'
  | 'priprave'
  | 'modre kartice'
  | 'zdravniški pregledi'

/**
 * Plačilo od starša, ki lahko pokrije enega ali več stroškov tekmovalcev tega starša.
 */
export interface Payment {
  id: string
  parentId: string | null // Can be null for unmatched payments
  amount: number
  paymentDate: string
  paymentMethod: 'bank_transfer' | 'cash' | 'card' | 'other'
  referenceNumber: string | null
  notes: string
  importedFromBank: boolean
  bankTransactionId: string | null
  createdAt: string
  status: 'pending' | 'allocated' | 'confirmed' // pending = unmatched, allocated = linked to costs, confirmed = fully processed
  payerName?: string // For unmatched payments where parent is not yet linked
}

/**
 * Povezava plačila s stroškom - omogoča delitev plačila na več stroškov.
 */
export interface PaymentAllocation {
  id: string
  paymentId: string
  costId: string
  allocatedAmount: number
  createdAt: string
}

/**
 * Bančni izpisek v PDF ali XML formatu, ki vsebuje več bančnih transakcij in je uvožen v sistem.
 */
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

/**
 * Posamezna transakcija iz bančnega izpiska, ki se lahko poveže s staršem ali plačilom
 * na podlagi imena ali referenčne številke.
 */
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

// =============================================================================
// Dashboard & Reports Types
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

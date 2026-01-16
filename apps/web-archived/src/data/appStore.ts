import type {
  Member,
  Parent,
  Coach,
  Group,
  Cost,
  Payment,
  BankStatement,
  BankTransaction,
  AuditLogEntry,
} from '@/types'
import { loadState, saveState } from './storage'

// Initial data - consolidated from all pages
const initialMembers: Member[] = [
  {
    id: 'mem-001',
    firstName: 'Luka',
    lastName: 'Novak',
    dateOfBirth: '2010-03-15',
    status: 'active',
    notes: 'Odličen napredek v teku, pripravlja se na regionalno tekmovanje.',
    parentId: 'par-001',
    groupId: 'grp-001',
  },
  {
    id: 'mem-002',
    firstName: 'Ana',
    lastName: 'Kovač',
    dateOfBirth: '2011-07-22',
    status: 'active',
    notes: '',
    parentId: 'par-002',
    groupId: 'grp-001',
  },
  {
    id: 'mem-003',
    firstName: 'Marko',
    lastName: 'Petek',
    dateOfBirth: '2009-11-08',
    status: 'inactive',
    notes: 'Začasno neaktivno zaradi poškodbe. Pričakovan povratek v mesecu.',
    parentId: 'par-003',
    groupId: 'grp-002',
  },
]

const initialParents: Parent[] = [
  {
    id: 'par-001',
    firstName: 'Janez',
    lastName: 'Novak',
    email: 'janez.novak@email.si',
    phone: '+386 41 123 456',
  },
  {
    id: 'par-002',
    firstName: 'Maja',
    lastName: 'Kovač',
    email: 'maja.kovac@email.si',
    phone: '+386 40 234 567',
  },
  {
    id: 'par-003',
    firstName: 'Peter',
    lastName: 'Petek',
    email: 'peter.petek@email.si',
    phone: '+386 31 345 678',
  },
]

const initialCoaches: Coach[] = [
  {
    id: 'coa-001',
    name: 'Andrej Novak',
    email: 'andrej.novak@klub.si',
    phone: '+386 41 111 222',
  },
  {
    id: 'coa-002',
    name: 'Klemen Horvat',
    email: 'klemen.horvat@klub.si',
    phone: '+386 40 222 333',
  },
  {
    id: 'coa-003',
    name: 'Luka Kovač',
    email: 'luka.kovac@klub.si',
    phone: '+386 31 333 444',
  },
]

const initialGroups: Group[] = [
  {
    id: 'grp-001',
    name: 'Andrejeva skupina',
    coachId: 'coa-001',
  },
  {
    id: 'grp-002',
    name: 'Klemnova skupina',
    coachId: 'coa-002',
  },
  {
    id: 'grp-003',
    name: 'Luka skupina',
    coachId: 'coa-003',
  },
]

const initialCosts: Cost[] = [
  {
    id: 'cost-001',
    memberId: 'mem-001',
    title: 'Vadnine - Januar 2024',
    description: 'Mesečne vadnine za januar',
    amount: 50.0,
    costType: 'Vadnine',
    dueDate: '2024-02-15',
    status: 'pending',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'cost-002',
    memberId: 'mem-001',
    title: 'Priprave Planica',
    description: 'Priprave za tekmovanje na Planici',
    amount: 150.0,
    costType: 'Priprave',
    dueDate: '2024-02-28',
    status: 'pending',
    createdAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'cost-003',
    memberId: 'mem-002',
    title: 'Vadnine - Januar 2024',
    description: 'Mesečne vadnine za januar',
    amount: 50.0,
    costType: 'Vadnine',
    dueDate: '2024-02-15',
    status: 'paid',
    createdAt: '2024-01-01T10:00:00Z',
  },
]

const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    parentId: 'par-002',
    amount: 50.0,
    paymentDate: '2024-01-18',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'SI56023456789012345',
    notes: 'Plačilo za vadnine - Januar 2024',
    importedFromBank: true,
    bankTransactionId: 'txn-003',
    createdAt: '2024-01-18T12:00:00Z',
  },
]

const initialBankStatements: BankStatement[] = [
  {
    id: 'stmt-001',
    fileName: 'izpisek_januar_2024.pdf',
    fileType: 'pdf',
    importedAt: '2024-02-01T10:30:00Z',
    status: 'completed',
    totalTransactions: 8,
    matchedTransactions: 6,
    unmatchedTransactions: 2,
  },
  {
    id: 'stmt-002',
    fileName: 'izpisek_februar_2024.xml',
    fileType: 'xml',
    importedAt: '2024-03-01T09:15:00Z',
    status: 'completed',
    totalTransactions: 12,
    matchedTransactions: 10,
    unmatchedTransactions: 2,
  },
]

const initialBankTransactions: BankTransaction[] = [
  {
    id: 'txn-001',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-15',
    amount: 50.0,
    description: 'Nakazilo Janez Novak',
    reference: 'SI56012345678901234',
    accountNumber: 'SI56012345678901234',
    matchedParentId: 'par-001',
    matchConfidence: 'high',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-002',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-16',
    amount: 150.0,
    description: 'Nakazilo Janez Novak',
    reference: 'SI56012345678901234',
    accountNumber: 'SI56012345678901234',
    matchedParentId: 'par-001',
    matchConfidence: 'high',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-003',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-18',
    amount: 50.0,
    description: 'Nakazilo Maja Kovač',
    reference: 'SI56023456789012345',
    accountNumber: 'SI56023456789012345',
    matchedParentId: 'par-002',
    matchConfidence: 'high',
    status: 'confirmed',
    paymentId: 'pay-001',
  },
  {
    id: 'txn-004',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-20',
    amount: 35.0,
    description: 'Nakazilo Marko Zupan',
    reference: 'SI56034567890123456',
    accountNumber: 'SI56034567890123456',
    matchedParentId: 'par-005',
    matchConfidence: 'medium',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-005',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-22',
    amount: 75.5,
    description: 'Nakazilo neznanega plačnika',
    reference: null,
    accountNumber: 'SI56045678901234567',
    matchedParentId: null,
    matchConfidence: null,
    status: 'unmatched',
    paymentId: null,
  },
  {
    id: 'txn-007',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-28',
    amount: 75.5,
    description: 'Nakazilo neznanega plačnika',
    reference: null,
    accountNumber: 'SI56067890123456789',
    matchedParentId: null,
    matchConfidence: null,
    status: 'unmatched',
    paymentId: null,
  },
]

const initialAuditLog: AuditLogEntry[] = []

const initialCostTypes: string[] = [
  'Vadnine',
  'Oprema',
  'Članarine',
  'Priprave',
  'Modre kartice',
  'Zdravniški pregledi',
]

// App state interface
export interface AppState {
  members: Member[]
  parents: Parent[]
  coaches: Coach[]
  groups: Group[]
  costs: Cost[]
  payments: Payment[]
  bankStatements: BankStatement[]
  bankTransactions: BankTransaction[]
  auditLog: AuditLogEntry[]
  costTypes: string[]
}

// Initial state
const initialState: AppState = {
  members: initialMembers,
  parents: initialParents,
  coaches: initialCoaches,
  groups: initialGroups,
  costs: initialCosts,
  payments: initialPayments,
  bankStatements: initialBankStatements,
  bankTransactions: initialBankTransactions,
  auditLog: initialAuditLog,
  costTypes: initialCostTypes,
}

// Load state from localStorage or use initial
const loadedState = loadState(initialState)
// Ensure costTypes exists in loaded state (migration for existing users)
let appState: AppState = {
  ...initialState,
  ...loadedState,
  costTypes: loadedState.costTypes || initialCostTypes,
}

// Subscribers
type Subscriber = () => void
const subscribers = new Set<Subscriber>()

function notify(): void {
  subscribers.forEach((subscriber) => subscriber())
}

function persist(): void {
  saveState(appState)
}

// Entity type mapping for type-safe CRUD
type EntityType =
  | 'members'
  | 'parents'
  | 'coaches'
  | 'groups'
  | 'costs'
  | 'payments'
  | 'bankStatements'
  | 'bankTransactions'
  | 'auditLog'

type EntityMap = {
  members: Member
  parents: Parent
  coaches: Coach
  groups: Group
  costs: Cost
  payments: Payment
  bankStatements: BankStatement
  bankTransactions: BankTransaction
  auditLog: AuditLogEntry
}

// Generic CRUD functions
export const appStore = {
  // Get current state
  getState(): AppState {
    return appState
  },

  // List entities
  list<T extends EntityType>(entity: T): EntityMap[T][] {
    return appState[entity] as EntityMap[T][]
  },

  // Create entity
  create<T extends EntityType>(
    entity: T,
    item: Omit<EntityMap[T], 'id'> & { id?: string }
  ): EntityMap[T] {
    const newItem = {
      ...item,
      id: item.id || `${entity.slice(0, 3)}-${Date.now()}`,
    } as EntityMap[T]
    appState = {
      ...appState,
      [entity]: [...appState[entity], newItem],
    }
    persist()
    notify()
    return newItem
  },

  // Update entity
  update<T extends EntityType>(
    entity: T,
    id: string,
    patch: Partial<EntityMap[T]>
  ): void {
    appState = {
      ...appState,
      [entity]: appState[entity].map((item) =>
        (item as { id: string }).id === id ? { ...item, ...patch } : item
      ) as EntityMap[T][],
    }
    persist()
    notify()
  },

  // Remove entity
  remove<T extends EntityType>(entity: T, id: string): void {
    appState = {
      ...appState,
      [entity]: appState[entity].filter(
        (item) => (item as { id: string }).id !== id
      ) as EntityMap[T][],
    }
    persist()
    notify()
  },

  // Set entire entity array (for bulk operations)
  set<T extends EntityType>(entity: T, items: EntityMap[T][]): void {
    appState = {
      ...appState,
      [entity]: items,
    }
    persist()
    notify()
  },

  // Subscribe to changes
  subscribe(subscriber: Subscriber): () => void {
    subscribers.add(subscriber)
    return () => {
      subscribers.delete(subscriber)
    }
  },

  // Cost types management
  addCostType(name: string): void {
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('Ime vrste stroška ne sme biti prazno')
    }
    if (appState.costTypes.includes(trimmedName)) {
      throw new Error('Vrsta stroška s tem imenom že obstaja')
    }
    appState = {
      ...appState,
      costTypes: [...appState.costTypes, trimmedName],
    }
    persist()
    notify()
  },

  updateCostType(oldName: string, newName: string): void {
    const trimmedNewName = newName.trim()
    if (!trimmedNewName) {
      throw new Error('Ime vrste stroška ne sme biti prazno')
    }
    if (trimmedNewName === oldName) {
      return // No change needed
    }
    if (appState.costTypes.includes(trimmedNewName)) {
      throw new Error('Vrsta stroška s tem imenom že obstaja')
    }
    if (!appState.costTypes.includes(oldName)) {
      throw new Error('Vrsta stroška ne obstaja')
    }

    // Update costTypes array
    appState = {
      ...appState,
      costTypes: appState.costTypes.map((type) => (type === oldName ? trimmedNewName : type)),
    }

    // Update all costs that use this cost type
    appState = {
      ...appState,
      costs: appState.costs.map((cost) =>
        cost.costType === oldName ? { ...cost, costType: trimmedNewName } : cost
      ),
    }

    persist()
    notify()
  },

  removeCostType(name: string): void {
    if (!appState.costTypes.includes(name)) {
      throw new Error('Vrsta stroška ne obstaja')
    }

    // Check if cost type is used in any costs
    const isUsed = appState.costs.some((cost) => cost.costType === name)
    if (isUsed) {
      throw new Error('Vrste stroška ni mogoče izbrisati, ker se uporablja v obstoječih stroških')
    }

    appState = {
      ...appState,
      costTypes: appState.costTypes.filter((type) => type !== name),
    }
    persist()
    notify()
  },
}

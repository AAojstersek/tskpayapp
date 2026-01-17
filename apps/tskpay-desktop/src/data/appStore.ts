import type {
  Member,
  Parent,
  Coach,
  Group,
  Cost,
  Payment,
  PaymentAllocation,
  BankStatement,
  BankTransaction,
  AuditLogEntry,
} from '@/types'
import { db, create as dbCreate, update as dbUpdate, remove as dbRemove, EntityType as DbEntityType } from './database'
import { dbToType, dbCostToType, typeCostToDb, typeToDb } from './db-helpers'
import { migrateFromLocalStorage } from './migration'

// App state interface
export interface AppState {
  members: Member[]
  parents: Parent[]
  coaches: Coach[]
  groups: Group[]
  costs: Cost[]
  payments: Payment[]
  paymentAllocations: PaymentAllocation[]
  bankStatements: BankStatement[]
  bankTransactions: BankTransaction[]
  auditLog: AuditLogEntry[]
  costTypes: string[]
}

// Initial empty state
const initialState: AppState = {
  members: [],
  parents: [],
  coaches: [],
  groups: [],
  costs: [],
  payments: [],
  paymentAllocations: [],
  bankStatements: [],
  bankTransactions: [],
  auditLog: [],
  costTypes: [],
}

// In-memory cache (synced with database)
let appState: AppState = { ...initialState }
let isInitialized = false

// Subscribers
type Subscriber = () => void
const subscribers = new Set<Subscriber>()

function notify(): void {
  subscribers.forEach((subscriber) => subscriber())
}

// Entity type mapping for type-safe CRUD
type EntityType =
  | 'members'
  | 'parents'
  | 'coaches'
  | 'groups'
  | 'costs'
  | 'payments'
  | 'paymentAllocations'
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
  paymentAllocations: PaymentAllocation
  bankStatements: BankStatement
  bankTransactions: BankTransaction
  auditLog: AuditLogEntry
}

// Database table mapping
const entityToTable: Record<EntityType, string> = {
  members: 'members',
  parents: 'parents',
  coaches: 'coaches',
  groups: 'groups',
  costs: 'costs',
  payments: 'payments',
  paymentAllocations: 'payment_allocations',
  bankStatements: 'bank_statements',
  bankTransactions: 'bank_transactions',
  auditLog: 'audit_log',
}

// Initialize store by loading from database
async function initializeStore(): Promise<void> {
  if (isInitialized) return
  
  try {
    // Run migration if needed
    await migrateFromLocalStorage()
    
    // Load all data from database
    const [members, parents, coaches, groups, costs, payments, paymentAllocations, bankStatements, bankTransactions, auditLog, costTypes] = await Promise.all([
      db.members.getAll(),
      db.parents.getAll(),
      db.coaches.getAll(),
      db.groups.getAll(),
      db.costs.getAll(),
      db.payments.getAll(),
      db.paymentAllocations.getAll(),
      db.bankStatements.getAll(),
      db.bankTransactions.getAll(),
      db.auditLog.getAll(),
      db.costTypes.getAll(),
    ])
    
    // Load parent IDs for all members
    const membersWithParents = await Promise.all(
      members.map(async (m) => {
        const member = dbToType<Member>(m)
        const parentIds = await db.memberParents.getMemberParents(member.id)
        return {
          ...member,
          parentIds: parentIds.length > 0 ? parentIds : (member.parentId ? [member.parentId] : []),
          parentId: member.parentId || (parentIds.length > 0 ? parentIds[0] : undefined),
        }
      })
    )

    // Convert database format to TypeScript types
    appState = {
      members: membersWithParents,
      parents: parents.map((p) => dbToType<Parent>(p)),
      coaches: coaches.map((c) => dbToType<Coach>(c)),
      groups: groups.map((g) => dbToType<Group>(g)),
      costs: await Promise.all(
        costs.map(async (c) => {
          const costTypeId = c.cost_type_id as string
          const costType = costTypes.find((ct) => ct.id === costTypeId)
          const costTypeName = (costType?.name as string) || ''
          const cost = dbCostToType(c, costTypeName) as unknown as Cost
          // Ensure boolean conversion for is_recurring
          if (c.is_recurring === 1) {
            cost.isRecurring = true
          } else if (c.is_recurring === 0) {
            cost.isRecurring = false
          }
          return cost
        })
      ),
      payments: payments.map((p) => {
        const payment = dbToType<Payment>(p)
        // Convert imported_from_bank boolean
        if (p.imported_from_bank === 1) {
          payment.importedFromBank = true
        }
        // Set default status if not present
        if (!payment.status) {
          payment.status = payment.parentId ? 'confirmed' : 'pending'
        }
        return payment
      }),
      paymentAllocations: paymentAllocations.map((pa) => dbToType<PaymentAllocation>(pa)),
      bankStatements: bankStatements.map((bs) => dbToType<BankStatement>(bs)),
      bankTransactions: bankTransactions.map((bt) => dbToType<BankTransaction>(bt)),
      auditLog: auditLog.map((al) => dbToType<AuditLogEntry>(al)),
      costTypes: costTypes.map((ct) => ct.name as string),
    }
    
    isInitialized = true
    notify()
  } catch (error) {
    console.error('Failed to initialize store:', error)
    throw error
  }
}

// Ensure store is initialized (call this before any operation)
function ensureInitialized(): void {
  if (!isInitialized) {
    // Initialize synchronously if possible, otherwise return empty state
    // In practice, components should call initializeStore() on mount
    console.warn('Store not initialized, returning empty state')
  }
}

// Generic CRUD functions
export const appStore = {
  // Initialize the store (call this on app startup)
  async initialize(): Promise<void> {
    await initializeStore()
  },

  // Get current state
  getState(): AppState {
    ensureInitialized()
    return appState
  },

  // List entities
  list<T extends EntityType>(entity: T): EntityMap[T][] {
    ensureInitialized()
    return appState[entity] as EntityMap[T][]
  },

  // Create entity (sync API, async persistence)
  create<T extends EntityType>(
    entity: T,
    item: Omit<EntityMap[T], 'id'> & { id?: string }
  ): EntityMap[T] {
    ensureInitialized()
    
    const newItem = {
      ...item,
      id: item.id || `${entity.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    } as EntityMap[T]
    
    // Update cache immediately (synchronous)
    appState = {
      ...appState,
      [entity]: [...appState[entity], newItem],
    }
    notify()
    
    // Persist to database asynchronously (fire and forget)
    ;(async () => {
      try {
        const table = entityToTable[entity] as DbEntityType
        let dbData: Record<string, unknown>
        
        if (entity === 'costs') {
          dbData = await typeCostToDb(newItem as unknown as Record<string, unknown>, db)
        } else {
          dbData = typeToDb(newItem as unknown as Record<string, unknown>)
        }
        
        await dbCreate(table, dbData)
        
        // Handle member_parents relationships for members
        if (entity === 'members') {
          const member = newItem as unknown as Member
          if (member.parentIds && member.parentIds.length > 0) {
            await db.memberParents.setMemberParents(member.id, member.parentIds)
          }
        }
      } catch (error) {
        console.error(`Failed to create ${entity} in database:`, error)
        // Note: We don't rollback cache here to keep API synchronous
        // In production, you might want to show a user notification
      }
    })()
    
    return newItem
  },

  // Update entity (sync API, async persistence)
  update<T extends EntityType>(
    entity: T,
    id: string,
    patch: Partial<EntityMap[T]>
  ): void {
    ensureInitialized()
    
    const oldItem = appState[entity].find((item: { id: string }) => item.id === id)
    if (!oldItem) {
      throw new Error(`${entity} with id ${id} not found`)
    }
    
    // Update cache immediately (synchronous)
    appState = {
      ...appState,
      [entity]: appState[entity].map((item) =>
        (item as { id: string }).id === id ? { ...item, ...patch } : item
      ) as EntityMap[T][],
    }
    notify()
    
    // Persist to database asynchronously (fire and forget)
    ;(async () => {
      try {
        const table = entityToTable[entity] as DbEntityType
        let dbData: Record<string, unknown>
        
        if (entity === 'costs') {
          const updatedItem = { ...oldItem, ...patch } as unknown as Record<string, unknown>
          dbData = await typeCostToDb(updatedItem, db)
        } else {
          dbData = typeToDb(patch as Record<string, unknown>)
        }
        
        await dbUpdate(table, id, dbData)
        
        // Handle member_parents relationships for members
        if (entity === 'members') {
          const member = { ...oldItem, ...patch } as unknown as Member
          if (member.parentIds !== undefined) {
            await db.memberParents.setMemberParents(id, member.parentIds)
          }
        }
      } catch (error) {
        console.error(`Failed to update ${entity} in database:`, error)
      }
    })()
  },

  // Remove entity (sync API, async persistence)
  remove<T extends EntityType>(entity: T, id: string): void {
    ensureInitialized()
    
    const oldItem = appState[entity].find((item: { id: string }) => item.id === id)
    if (!oldItem) {
      throw new Error(`${entity} with id ${id} not found`)
    }
    
    // Update cache immediately (synchronous)
    appState = {
      ...appState,
      [entity]: appState[entity].filter(
        (item) => (item as { id: string }).id !== id
      ) as EntityMap[T][],
    }
    notify()
    
    // Persist to database asynchronously (fire and forget)
    ;(async () => {
      try {
        const table = entityToTable[entity] as DbEntityType
        await dbRemove(table, id)
      } catch (error) {
        console.error(`Failed to delete ${entity} from database:`, error)
      }
    })()
  },

  // Set entire entity array (for bulk operations)
  set<T extends EntityType>(entity: T, items: EntityMap[T][]): void {
    ensureInitialized()
    
    // Update cache immediately
    appState = {
      ...appState,
      [entity]: items,
    }
    notify()
    
    // Note: Bulk operations to database would need special handling
    // For now, this is mainly for internal use
  },

  // Subscribe to changes
  subscribe(subscriber: Subscriber): () => void {
    subscribers.add(subscriber)
    return () => {
      subscribers.delete(subscriber)
    }
  },

  // Cost types management (sync API, async persistence)
  addCostType(name: string): void {
    ensureInitialized()
    
    const trimmedName = name.trim()
    if (!trimmedName) {
      throw new Error('Ime vrste stroška ne sme biti prazno')
    }
    if (appState.costTypes.includes(trimmedName)) {
      throw new Error('Vrsta stroška s tem imenom že obstaja')
    }
    
    // Update cache immediately
    appState = {
      ...appState,
      costTypes: [...appState.costTypes, trimmedName],
    }
    notify()
    
    // Persist to database asynchronously
    ;(async () => {
      try {
        await db.costTypes.create({ name: trimmedName })
      } catch (error) {
        console.error('Failed to add cost type to database:', error)
      }
    })()
  },

  updateCostType(oldName: string, newName: string): void {
    ensureInitialized()
    
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

    // Update cache immediately
    appState = {
      ...appState,
      costTypes: appState.costTypes.map((type) => (type === oldName ? trimmedNewName : type)),
      costs: appState.costs.map((cost) =>
        cost.costType === oldName ? { ...cost, costType: trimmedNewName } : cost
      ),
    }
    notify()
    
    // Persist to database asynchronously
    ;(async () => {
      try {
        const costTypes = await db.costTypes.getAll()
        const costType = costTypes.find((ct) => ct.name === oldName)
        if (costType) {
          await db.costTypes.update(costType.id as string, { name: trimmedNewName })
        }
      } catch (error) {
        console.error('Failed to update cost type in database:', error)
      }
    })()
  },

  removeCostType(name: string): void {
    ensureInitialized()
    
    if (!appState.costTypes.includes(name)) {
      throw new Error('Vrsta stroška ne obstaja')
    }

    // Check if cost type is used in any costs
    const isUsed = appState.costs.some((cost) => cost.costType === name)
    if (isUsed) {
      throw new Error('Vrste stroška ni mogoče izbrisati, ker se uporablja v obstoječih stroških')
    }

    // Update cache immediately
    appState = {
      ...appState,
      costTypes: appState.costTypes.filter((type) => type !== name),
    }
    notify()
    
    // Persist to database asynchronously
    ;(async () => {
      try {
        const costTypes = await db.costTypes.getAll()
        const costType = costTypes.find((ct) => ct.name === name)
        if (costType) {
          await db.costTypes.delete(costType.id as string)
        }
      } catch (error) {
        console.error('Failed to remove cost type from database:', error)
      }
    })()
  },
}

import { db } from './database'
import { loadState } from './storage'
import type { AppState } from './appStore'

const MIGRATION_KEY = 'tskpay_migration_completed_v1'

/**
 * Check if migration has already been completed
 */
export function isMigrationCompleted(): boolean {
  try {
    return localStorage.getItem(MIGRATION_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted(): void {
  try {
    localStorage.setItem(MIGRATION_KEY, 'true')
  } catch (error) {
    console.warn('Failed to mark migration as completed:', error)
  }
}

/**
 * Convert camelCase TypeScript types to snake_case database fields
 */
function convertTypeToDb<T extends Record<string, unknown>>(
  typeData: T
): Record<string, unknown> {
  const converted: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(typeData)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    
    // Handle boolean conversion (SQLite stores as INTEGER 0/1)
    if (typeof value === 'boolean') {
      converted[snakeKey] = value ? 1 : 0
    } else {
      converted[snakeKey] = value
    }
  }
  
  return converted
}

/**
 * Migrate data from localStorage to SQLite database
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (isMigrationCompleted()) {
    console.log('Migration already completed, skipping...')
    return
  }

  try {
    console.log('Starting migration from localStorage to SQLite...')
    
    // Load existing state from localStorage
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
    
    const loadedState = loadState(initialState)
    
    // Migrate in order (respecting foreign key constraints)
    
    // 1. Coaches (no dependencies)
    console.log('Migrating coaches...')
    for (const coach of loadedState.coaches || []) {
      try {
        await db.coaches.create(convertTypeToDb(coach as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate coach:', coach.id, error)
      }
    }
    
    // 2. Parents (no dependencies)
    console.log('Migrating parents...')
    for (const parent of loadedState.parents || []) {
      try {
        await db.parents.create(convertTypeToDb(parent as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate parent:', parent.id, error)
      }
    }
    
    // 3. Groups (depends on coaches)
    console.log('Migrating groups...')
    for (const group of loadedState.groups || []) {
      try {
        await db.groups.create(convertTypeToDb(group as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate group:', group.id, error)
      }
    }
    
    // 4. Members (depends on parents and groups)
    console.log('Migrating members...')
    for (const member of loadedState.members || []) {
      try {
        await db.members.create(convertTypeToDb(member as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate member:', member.id, error)
      }
    }
    
    // 5. Cost Types (no dependencies)
    console.log('Migrating cost types...')
    // Cost types are stored as strings in appStore, need to create records
    for (const costTypeName of loadedState.costTypes || []) {
      try {
        // Check if cost type already exists (from seed data)
        const existing = await db.costTypes.getAll()
        const exists = existing.some((ct: Record<string, unknown>) => ct.name === costTypeName)
        
        if (!exists) {
          await db.costTypes.create({
            name: costTypeName,
          })
        }
      } catch (error) {
        console.warn('Failed to migrate cost type:', costTypeName, error)
      }
    }
    
    // 6. Costs (depends on members and cost_types)
    console.log('Migrating costs...')
    for (const cost of loadedState.costs || []) {
      try {
        // Find cost_type_id by name
        const costTypes = await db.costTypes.getAll()
        const costType = costTypes.find((ct: Record<string, unknown>) => ct.name === cost.costType)
        
        if (costType) {
          await db.costs.create({
            ...convertTypeToDb(cost as unknown as Record<string, unknown>),
            cost_type_id: costType.id,
          })
        } else {
          console.warn('Cost type not found for cost:', cost.id, cost.costType)
        }
      } catch (error) {
        console.warn('Failed to migrate cost:', cost.id, error)
      }
    }
    
    // 7. Bank Statements (no dependencies)
    console.log('Migrating bank statements...')
    for (const statement of loadedState.bankStatements || []) {
      try {
        await db.bankStatements.create(convertTypeToDb(statement as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate bank statement:', statement.id, error)
      }
    }
    
    // 8. Bank Transactions (depends on bank_statements and parents)
    console.log('Migrating bank transactions...')
    for (const transaction of loadedState.bankTransactions || []) {
      try {
        await db.bankTransactions.create(convertTypeToDb(transaction as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate bank transaction:', transaction.id, error)
      }
    }
    
    // 9. Payments (depends on parents and bank_transactions)
    console.log('Migrating payments...')
    for (const payment of loadedState.payments || []) {
      try {
        await db.payments.create(convertTypeToDb(payment as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate payment:', payment.id, error)
      }
    }
    
    // 10. Audit Log (no dependencies)
    console.log('Migrating audit log...')
    for (const logEntry of loadedState.auditLog || []) {
      try {
        await db.auditLog.create(convertTypeToDb(logEntry as unknown as Record<string, unknown>))
      } catch (error) {
        console.warn('Failed to migrate audit log entry:', logEntry.id, error)
      }
    }
    
    // Mark migration as completed
    markMigrationCompleted()
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

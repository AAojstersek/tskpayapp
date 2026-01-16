import { invoke } from '@tauri-apps/api/core'

export type EntityType =
  | 'parents'
  | 'coaches'
  | 'groups'
  | 'members'
  | 'cost_types'
  | 'costs'
  | 'payments'
  | 'bank_statements'
  | 'bank_transactions'
  | 'payment_allocations'
  | 'audit_log'

export type EntityData = Record<string, unknown>

/**
 * Initialize the database
 */
export async function initDatabase(): Promise<void> {
  await invoke('db_init')
}

/**
 * Get all entities of a given type
 */
export async function getAll<T extends EntityData = EntityData>(
  table: EntityType
): Promise<T[]> {
  const result = await invoke<EntityData[]>('db_get_all', { table })
  return result as T[]
}

/**
 * Get a single entity by ID
 */
export async function getById<T extends EntityData = EntityData>(
  table: EntityType,
  id: string
): Promise<T | null> {
  const result = await invoke<EntityData | null>('db_get_by_id', { table, id })
  return (result as T) || null
}

/**
 * Create a new entity
 */
export async function create<T extends EntityData = EntityData>(
  table: EntityType,
  data: Omit<T, 'id'> & { id?: string }
): Promise<T> {
  // Generate ID if not provided
  const id = data.id || generateId(table)
  const entityData = {
    ...data,
    id,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  }
  
  const result = await invoke<EntityData>('db_create', {
    table,
    data: entityData,
  })
  return result as T
}

/**
 * Update an existing entity
 */
export async function update<T extends EntityData = EntityData>(
  table: EntityType,
  id: string,
  patch: Partial<T>
): Promise<void> {
  const updateData = {
    ...patch,
    updated_at: new Date().toISOString(),
  }
  await invoke('db_update', { table, id, data: updateData })
}

/**
 * Delete an entity
 */
export async function remove(table: EntityType, id: string): Promise<void> {
  await invoke('db_delete', { table, id })
}

/**
 * Generate a unique ID for an entity
 */
function generateId(table: EntityType): string {
  const prefix = getTablePrefix(table)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Get table prefix for ID generation
 */
function getTablePrefix(table: EntityType): string {
  const prefixes: Record<EntityType, string> = {
    parents: 'par',
    coaches: 'coa',
    groups: 'grp',
    members: 'mem',
    cost_types: 'ct',
    costs: 'cost',
    payments: 'pay',
    bank_statements: 'stmt',
    bank_transactions: 'txn',
    payment_allocations: 'alloc',
    audit_log: 'audit',
  }
  return prefixes[table]
}

/**
 * Database service with entity-specific methods
 */
export const db = {
  // Parents
  parents: {
    getAll: () => getAll('parents'),
    getById: (id: string) => getById('parents', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('parents', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('parents', id, patch),
    delete: (id: string) => remove('parents', id),
  },

  // Coaches
  coaches: {
    getAll: () => getAll('coaches'),
    getById: (id: string) => getById('coaches', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('coaches', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('coaches', id, patch),
    delete: (id: string) => remove('coaches', id),
  },

  // Groups
  groups: {
    getAll: () => getAll('groups'),
    getById: (id: string) => getById('groups', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('groups', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('groups', id, patch),
    delete: (id: string) => remove('groups', id),
  },

  // Members
  members: {
    getAll: () => getAll('members'),
    getById: (id: string) => getById('members', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('members', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('members', id, patch),
    delete: (id: string) => remove('members', id),
  },

  // Cost Types
  costTypes: {
    getAll: () => getAll('cost_types'),
    getById: (id: string) => getById('cost_types', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('cost_types', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('cost_types', id, patch),
    delete: (id: string) => remove('cost_types', id),
  },

  // Costs
  costs: {
    getAll: () => getAll('costs'),
    getById: (id: string) => getById('costs', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('costs', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('costs', id, patch),
    delete: (id: string) => remove('costs', id),
  },

  // Payments
  payments: {
    getAll: () => getAll('payments'),
    getById: (id: string) => getById('payments', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('payments', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('payments', id, patch),
    delete: (id: string) => remove('payments', id),
  },

  // Bank Statements
  bankStatements: {
    getAll: () => getAll('bank_statements'),
    getById: (id: string) => getById('bank_statements', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('bank_statements', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('bank_statements', id, patch),
    delete: (id: string) => remove('bank_statements', id),
  },

  // Bank Transactions
  bankTransactions: {
    getAll: () => getAll('bank_transactions'),
    getById: (id: string) => getById('bank_transactions', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('bank_transactions', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('bank_transactions', id, patch),
    delete: (id: string) => remove('bank_transactions', id),
  },

  // Payment Allocations
  paymentAllocations: {
    getAll: () => getAll('payment_allocations'),
    getById: (id: string) => getById('payment_allocations', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('payment_allocations', data),
    update: (id: string, patch: Partial<EntityData>) =>
      update('payment_allocations', id, patch),
    delete: (id: string) => remove('payment_allocations', id),
  },

  // Audit Log
  auditLog: {
    getAll: () => getAll('audit_log'),
    getById: (id: string) => getById('audit_log', id),
    create: (data: Omit<EntityData, 'id'> & { id?: string }) =>
      create('audit_log', data),
  },
}

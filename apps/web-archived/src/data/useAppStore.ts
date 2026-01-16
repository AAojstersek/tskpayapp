import { useSyncExternalStore } from 'react'
import { appStore } from './appStore'
import type { AppState } from './appStore'
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

/**
 * Hook to access the entire app state
 */
export function useAppStore(): AppState {
  return useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getState(),
    () => appStore.getState()
  )
}

/**
 * Hook to select a specific slice of state
 */
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(appStore.getState()),
    () => selector(appStore.getState())
  )
}

// Entity-specific hooks
export function useMembers() {
  const members = useAppSelector((state) => state.members)
  return {
    members,
    create: (data: Omit<Member, 'id'>) => appStore.create('members', data),
    update: (id: string, data: Partial<Member>) => appStore.update('members', id, data),
    remove: (id: string) => appStore.remove('members', id),
    set: (items: Member[]) => appStore.set('members', items),
  }
}

export function useParents() {
  const parents = useAppSelector((state) => state.parents)
  return {
    parents,
    create: (data: Omit<Parent, 'id'>) => appStore.create('parents', data),
    update: (id: string, data: Partial<Parent>) => appStore.update('parents', id, data),
    remove: (id: string) => appStore.remove('parents', id),
    set: (items: Parent[]) => appStore.set('parents', items),
  }
}

export function useCoaches() {
  const coaches = useAppSelector((state) => state.coaches)
  return {
    coaches,
    create: (data: Omit<Coach, 'id'>) => appStore.create('coaches', data),
    update: (id: string, data: Partial<Coach>) => appStore.update('coaches', id, data),
    remove: (id: string) => appStore.remove('coaches', id),
    set: (items: Coach[]) => appStore.set('coaches', items),
  }
}

export function useGroups() {
  const groups = useAppSelector((state) => state.groups)
  return {
    groups,
    create: (data: Omit<Group, 'id'>) => appStore.create('groups', data),
    update: (id: string, data: Partial<Group>) => appStore.update('groups', id, data),
    remove: (id: string) => appStore.remove('groups', id),
    set: (items: Group[]) => appStore.set('groups', items),
  }
}

export function useCosts() {
  const costs = useAppSelector((state) => state.costs)
  return {
    costs,
    create: (data: Omit<Cost, 'id' | 'createdAt'>) =>
      appStore.create('costs', {
        ...data,
        createdAt: new Date().toISOString(),
      }),
    update: (id: string, data: Partial<Cost>) => appStore.update('costs', id, data),
    remove: (id: string) => appStore.remove('costs', id),
    set: (items: Cost[]) => appStore.set('costs', items),
  }
}

export function usePayments() {
  const payments = useAppSelector((state) => state.payments)
  return {
    payments,
    create: (data: Omit<Payment, 'id' | 'createdAt'>) =>
      appStore.create('payments', {
        ...data,
        createdAt: new Date().toISOString(),
      }),
    update: (id: string, data: Partial<Payment>) => appStore.update('payments', id, data),
    remove: (id: string) => appStore.remove('payments', id),
    set: (items: Payment[]) => appStore.set('payments', items),
  }
}

export function useBankStatements() {
  const bankStatements = useAppSelector((state) => state.bankStatements)
  return {
    bankStatements,
    create: (data: Omit<BankStatement, 'id'>) => appStore.create('bankStatements', data),
    update: (id: string, data: Partial<BankStatement>) =>
      appStore.update('bankStatements', id, data),
    remove: (id: string) => appStore.remove('bankStatements', id),
    set: (items: BankStatement[]) => appStore.set('bankStatements', items),
  }
}

export function useBankTransactions() {
  const bankTransactions = useAppSelector((state) => state.bankTransactions)
  return {
    bankTransactions,
    create: (data: Omit<BankTransaction, 'id'>) => appStore.create('bankTransactions', data),
    update: (id: string, data: Partial<BankTransaction>) =>
      appStore.update('bankTransactions', id, data),
    remove: (id: string) => appStore.remove('bankTransactions', id),
    set: (items: BankTransaction[]) => appStore.set('bankTransactions', items),
  }
}

export function useAuditLog() {
  const auditLog = useAppSelector((state) => state.auditLog)
  return {
    auditLog,
    create: (data: Omit<AuditLogEntry, 'id'>) => appStore.create('auditLog', data),
    update: (id: string, data: Partial<AuditLogEntry>) => appStore.update('auditLog', id, data),
    remove: (id: string) => appStore.remove('auditLog', id),
    set: (items: AuditLogEntry[]) => appStore.set('auditLog', items),
  }
}

export function useCostTypes() {
  const costTypes = useAppSelector((state) => state.costTypes)
  return {
    costTypes,
    add: (name: string) => appStore.addCostType(name),
    update: (oldName: string, newName: string) => appStore.updateCostType(oldName, newName),
    remove: (name: string) => appStore.removeCostType(name),
  }
}

import type { Member, Parent, Group, Coach } from '@/types'

// Storage keys
const STORAGE_KEY_MEMBERS = 'tskpay_members'
const STORAGE_KEY_PARENTS = 'tskpay_parents'
const STORAGE_KEY_GROUPS = 'tskpay_groups'
const STORAGE_KEY_COACHES = 'tskpay_coaches'

// Initial data
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

// Load from localStorage helper
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed as T
      }
    }
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error)
  }
  return defaultValue
}

// Save to localStorage helper
function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to save ${key} to localStorage:`, error)
  }
}

// Store state
let members: Member[] = loadFromStorage(STORAGE_KEY_MEMBERS, initialMembers)
let parents: Parent[] = loadFromStorage(STORAGE_KEY_PARENTS, initialParents)
let groups: Group[] = loadFromStorage(STORAGE_KEY_GROUPS, initialGroups)
let coaches: Coach[] = loadFromStorage(STORAGE_KEY_COACHES, initialCoaches)

// Subscribers for React components
type Subscriber = () => void
const membersSubscribers = new Set<Subscriber>()
const parentsSubscribers = new Set<Subscriber>()
const groupsSubscribers = new Set<Subscriber>()
const coachesSubscribers = new Set<Subscriber>()

// Notify subscribers of changes
function notifyMembers(): void {
  membersSubscribers.forEach((subscriber) => subscriber())
}

function notifyParents(): void {
  parentsSubscribers.forEach((subscriber) => subscriber())
}

function notifyGroups(): void {
  groupsSubscribers.forEach((subscriber) => subscriber())
}

function notifyCoaches(): void {
  coachesSubscribers.forEach((subscriber) => subscriber())
}

// Members API
export const membersStore = {
  get(): Member[] {
    return members
  },
  set(newMembers: Member[]): void {
    members = newMembers
    saveToStorage(STORAGE_KEY_MEMBERS, members)
    notifyMembers()
  },
  create(memberData: Omit<Member, 'id'>): Member {
    const newMember: Member = {
      ...memberData,
      id: `mem-${Date.now()}`,
    }
    members = [...members, newMember]
    saveToStorage(STORAGE_KEY_MEMBERS, members)
    notifyMembers()
    return newMember
  },
  update(id: string, memberData: Partial<Member>): void {
    members = members.map((m) => (m.id === id ? { ...m, ...memberData } : m))
    saveToStorage(STORAGE_KEY_MEMBERS, members)
    notifyMembers()
  },
  delete(id: string): void {
    members = members.filter((m) => m.id !== id)
    saveToStorage(STORAGE_KEY_MEMBERS, members)
    notifyMembers()
  },
  subscribe(subscriber: Subscriber): () => void {
    membersSubscribers.add(subscriber)
    return () => {
      membersSubscribers.delete(subscriber)
    }
  },
}

// Parents API
export const parentsStore = {
  get(): Parent[] {
    return parents
  },
  set(newParents: Parent[]): void {
    parents = newParents
    saveToStorage(STORAGE_KEY_PARENTS, parents)
    notifyParents()
  },
  create(parentData: Omit<Parent, 'id'>): Parent {
    const newParent: Parent = {
      ...parentData,
      id: `par-${Date.now()}`,
    }
    parents = [...parents, newParent]
    saveToStorage(STORAGE_KEY_PARENTS, parents)
    notifyParents()
    return newParent
  },
  update(id: string, parentData: Partial<Parent>): void {
    parents = parents.map((p) => (p.id === id ? { ...p, ...parentData } : p))
    saveToStorage(STORAGE_KEY_PARENTS, parents)
    notifyParents()
  },
  delete(id: string): void {
    parents = parents.filter((p) => p.id !== id)
    saveToStorage(STORAGE_KEY_PARENTS, parents)
    notifyParents()
  },
  subscribe(subscriber: Subscriber): () => void {
    parentsSubscribers.add(subscriber)
    return () => {
      parentsSubscribers.delete(subscriber)
    }
  },
}

// Groups API
export const groupsStore = {
  get(): Group[] {
    return groups
  },
  set(newGroups: Group[]): void {
    groups = newGroups
    saveToStorage(STORAGE_KEY_GROUPS, groups)
    notifyGroups()
  },
  create(groupData: Omit<Group, 'id'>): Group {
    const newGroup: Group = {
      ...groupData,
      id: `grp-${Date.now()}`,
    }
    groups = [...groups, newGroup]
    saveToStorage(STORAGE_KEY_GROUPS, groups)
    notifyGroups()
    return newGroup
  },
  update(id: string, groupData: Partial<Group>): void {
    groups = groups.map((g) => (g.id === id ? { ...g, ...groupData } : g))
    saveToStorage(STORAGE_KEY_GROUPS, groups)
    notifyGroups()
  },
  delete(id: string): void {
    groups = groups.filter((g) => g.id !== id)
    saveToStorage(STORAGE_KEY_GROUPS, groups)
    notifyGroups()
  },
  subscribe(subscriber: Subscriber): () => void {
    groupsSubscribers.add(subscriber)
    return () => {
      groupsSubscribers.delete(subscriber)
    }
  },
}

// Coaches API
export const coachesStore = {
  get(): Coach[] {
    return coaches
  },
  set(newCoaches: Coach[]): void {
    coaches = newCoaches
    saveToStorage(STORAGE_KEY_COACHES, coaches)
    notifyCoaches()
  },
  create(coachData: Omit<Coach, 'id'>): Coach {
    const newCoach: Coach = {
      ...coachData,
      id: `coa-${Date.now()}`,
    }
    coaches = [...coaches, newCoach]
    saveToStorage(STORAGE_KEY_COACHES, coaches)
    notifyCoaches()
    return newCoach
  },
  update(id: string, coachData: Partial<Coach>): void {
    coaches = coaches.map((c) => (c.id === id ? { ...c, ...coachData } : c))
    saveToStorage(STORAGE_KEY_COACHES, coaches)
    notifyCoaches()
  },
  delete(id: string): void {
    coaches = coaches.filter((c) => c.id !== id)
    saveToStorage(STORAGE_KEY_COACHES, coaches)
    notifyCoaches()
  },
  subscribe(subscriber: Subscriber): () => void {
    coachesSubscribers.add(subscriber)
    return () => {
      coachesSubscribers.delete(subscriber)
    }
  },
}

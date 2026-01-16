import type { Member, Parent, Group, Coach } from '@/types'
import { appStore } from './appStore'

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

// Subscribe to appStore changes and notify local subscribers
appStore.subscribe(() => {
  notifyMembers()
  notifyParents()
  notifyGroups()
  notifyCoaches()
})

// Members API (delegates to appStore)
export const membersStore = {
  get(): Member[] {
    return appStore.list('members')
  },
  set(newMembers: Member[]): void {
    appStore.set('members', newMembers)
  },
  create(memberData: Omit<Member, 'id'>): Member {
    return appStore.create('members', memberData)
  },
  update(id: string, memberData: Partial<Member>): void {
    appStore.update('members', id, memberData)
  },
  delete(id: string): void {
    appStore.remove('members', id)
  },
  subscribe(subscriber: Subscriber): () => void {
    membersSubscribers.add(subscriber)
    return () => {
      membersSubscribers.delete(subscriber)
    }
  },
}

// Parents API (delegates to appStore)
export const parentsStore = {
  get(): Parent[] {
    return appStore.list('parents')
  },
  set(newParents: Parent[]): void {
    appStore.set('parents', newParents)
  },
  create(parentData: Omit<Parent, 'id'>): Parent {
    return appStore.create('parents', parentData)
  },
  update(id: string, parentData: Partial<Parent>): void {
    appStore.update('parents', id, parentData)
  },
  delete(id: string): void {
    appStore.remove('parents', id)
  },
  subscribe(subscriber: Subscriber): () => void {
    parentsSubscribers.add(subscriber)
    return () => {
      parentsSubscribers.delete(subscriber)
    }
  },
}

// Groups API (delegates to appStore)
export const groupsStore = {
  get(): Group[] {
    return appStore.list('groups')
  },
  set(newGroups: Group[]): void {
    appStore.set('groups', newGroups)
  },
  create(groupData: Omit<Group, 'id'>): Group {
    return appStore.create('groups', groupData)
  },
  update(id: string, groupData: Partial<Group>): void {
    appStore.update('groups', id, groupData)
  },
  delete(id: string): void {
    appStore.remove('groups', id)
  },
  subscribe(subscriber: Subscriber): () => void {
    groupsSubscribers.add(subscriber)
    return () => {
      groupsSubscribers.delete(subscriber)
    }
  },
}

// Coaches API (delegates to appStore)
export const coachesStore = {
  get(): Coach[] {
    return appStore.list('coaches')
  },
  set(newCoaches: Coach[]): void {
    appStore.set('coaches', newCoaches)
  },
  create(coachData: Omit<Coach, 'id'>): Coach {
    return appStore.create('coaches', coachData)
  },
  update(id: string, coachData: Partial<Coach>): void {
    appStore.update('coaches', id, coachData)
  },
  delete(id: string): void {
    appStore.remove('coaches', id)
  },
  subscribe(subscriber: Subscriber): () => void {
    coachesSubscribers.add(subscriber)
    return () => {
      coachesSubscribers.delete(subscriber)
    }
  },
}

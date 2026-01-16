import { useState, useEffect } from 'react'
import { membersStore, parentsStore, groupsStore, coachesStore } from './clubStore'
import type { Member, Parent, Group, Coach } from '@/types'

/**
 * Hook to access and subscribe to members store
 */
export function useMembers(): {
  members: Member[]
  createMember: (memberData: Omit<Member, 'id'>) => Member
  updateMember: (id: string, memberData: Partial<Member>) => void
  deleteMember: (id: string) => void
  setMembers: (members: Member[]) => void
} {
  const [members, setMembers] = useState<Member[]>(() => membersStore.get())

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = membersStore.subscribe(() => {
      setMembers(membersStore.get())
    })

    // Initial sync
    setMembers(membersStore.get())

    return unsubscribe
  }, [])

  return {
    members,
    createMember: (memberData) => {
      const newMember = membersStore.create(memberData)
      return newMember
    },
    updateMember: (id, memberData) => {
      membersStore.update(id, memberData)
    },
    deleteMember: (id) => {
      membersStore.delete(id)
    },
    setMembers: (newMembers) => {
      membersStore.set(newMembers)
    },
  }
}

/**
 * Hook to access parents store
 */
export function useParents(): {
  parents: Parent[]
  createParent: (parentData: Omit<Parent, 'id'>) => Parent
  updateParent: (id: string, parentData: Partial<Parent>) => void
  deleteParent: (id: string) => void
  setParents: (parents: Parent[]) => void
} {
  const [parents, setParents] = useState<Parent[]>(() => parentsStore.get())

  useEffect(() => {
    const unsubscribe = membersStore.subscribe(() => {
      // Also re-sync when members change (parents might be referenced)
      setParents(parentsStore.get())
    })
    const unsubscribeParents = parentsStore.subscribe(() => {
      setParents(parentsStore.get())
    })

    setParents(parentsStore.get())

    return () => {
      unsubscribe()
      unsubscribeParents()
    }
  }, [])

  return {
    parents,
    createParent: (parentData) => {
      return parentsStore.create(parentData)
    },
    updateParent: (id, parentData) => {
      parentsStore.update(id, parentData)
    },
    deleteParent: (id) => {
      parentsStore.delete(id)
    },
    setParents: (newParents) => {
      parentsStore.set(newParents)
    },
  }
}

/**
 * Hook to access groups store
 */
export function useGroups(): {
  groups: Group[]
  createGroup: (groupData: Omit<Group, 'id'>) => Group
  updateGroup: (id: string, groupData: Partial<Group>) => void
  deleteGroup: (id: string) => void
  setGroups: (groups: Group[]) => void
} {
  const [groups, setGroups] = useState<Group[]>(() => groupsStore.get())

  useEffect(() => {
    const unsubscribe = membersStore.subscribe(() => {
      // Also re-sync when members change (groups might be referenced)
      setGroups(groupsStore.get())
    })
    const unsubscribeGroups = groupsStore.subscribe(() => {
      setGroups(groupsStore.get())
    })

    setGroups(groupsStore.get())

    return () => {
      unsubscribe()
      unsubscribeGroups()
    }
  }, [])

  return {
    groups,
    createGroup: (groupData) => {
      return groupsStore.create(groupData)
    },
    updateGroup: (id, groupData) => {
      groupsStore.update(id, groupData)
    },
    deleteGroup: (id) => {
      groupsStore.delete(id)
    },
    setGroups: (newGroups) => {
      groupsStore.set(newGroups)
    },
  }
}

/**
 * Hook to access coaches store
 */
export function useCoaches(): {
  coaches: Coach[]
  createCoach: (coachData: Omit<Coach, 'id'>) => Coach
  updateCoach: (id: string, coachData: Partial<Coach>) => void
  deleteCoach: (id: string) => void
  setCoaches: (coaches: Coach[]) => void
} {
  const [coaches, setCoaches] = useState<Coach[]>(() => coachesStore.get())

  useEffect(() => {
    const unsubscribe = membersStore.subscribe(() => {
      // Also re-sync when members change (coaches might be referenced)
      setCoaches(coachesStore.get())
    })
    const unsubscribeCoaches = coachesStore.subscribe(() => {
      setCoaches(coachesStore.get())
    })

    setCoaches(coachesStore.get())

    return () => {
      unsubscribe()
      unsubscribeCoaches()
    }
  }, [])

  return {
    coaches,
    createCoach: (coachData) => {
      return coachesStore.create(coachData)
    },
    updateCoach: (id, coachData) => {
      coachesStore.update(id, coachData)
    },
    deleteCoach: (id) => {
      coachesStore.delete(id)
    },
    setCoaches: (newCoaches) => {
      coachesStore.set(newCoaches)
    },
  }
}

/**
 * Combined hook for all club data
 */
export function useClubStore() {
  const members = useMembers()
  const parents = useParents()
  const groups = useGroups()
  const coaches = useCoaches()

  return {
    members: members.members,
    parents: parents.parents,
    groups: groups.groups,
    coaches: coaches.coaches,
    // Members
    createMember: members.createMember,
    updateMember: members.updateMember,
    deleteMember: members.deleteMember,
    setMembers: members.setMembers,
    // Parents
    createParent: parents.createParent,
    updateParent: parents.updateParent,
    deleteParent: parents.deleteParent,
    setParents: parents.setParents,
    // Groups
    createGroup: groups.createGroup,
    updateGroup: groups.updateGroup,
    deleteGroup: groups.deleteGroup,
    setGroups: groups.setGroups,
    // Coaches
    createCoach: coaches.createCoach,
    updateCoach: coaches.updateCoach,
    deleteCoach: coaches.deleteCoach,
    setCoaches: coaches.setCoaches,
  }
}

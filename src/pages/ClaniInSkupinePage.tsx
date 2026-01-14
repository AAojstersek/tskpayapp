import { useState } from 'react'
import { MemberList, MemberForm } from '@/components/members'
import type { Member, Parent, Group, Coach } from '@/types'

// Sample data - in production, this would come from an API
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

export function ClaniInSkupinePage() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [parents] = useState<Parent[]>(initialParents)
  const [groups] = useState<Group[]>(initialGroups)
  const [coaches] = useState<Coach[]>(initialCoaches)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'archived' | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const handleCreateMember = () => {
    setEditingMember(null)
    setFormOpen(true)
  }

  const handleEditMember = (id: string) => {
    const member = members.find((m) => m.id === id)
    setEditingMember(member || null)
    setFormOpen(true)
  }

  const handleDeleteMember = (id: string) => {
    if (confirm('Ali ste prepričani, da želite izbrisati tega tekmovalca?')) {
      setMembers(members.filter((m) => m.id !== id))
    }
  }

  const handleSaveMember = (memberData: Omit<Member, 'id'>) => {
    if (editingMember) {
      // Update existing member
      setMembers(
        members.map((m) =>
          m.id === editingMember.id ? { ...m, ...memberData } : m
        )
      )
    } else {
      // Create new member
      const newMember: Member = {
        ...memberData,
        id: `mem-${Date.now()}`,
      }
      setMembers([...members, newMember])
    }
    setFormOpen(false)
    setEditingMember(null)
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'archived') => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, status } : m))
    )
  }

  const handleBulkStatusChange = (memberIds: string[], status: 'active' | 'inactive' | 'archived') => {
    setMembers(
      members.map((m) => (memberIds.includes(m.id) ? { ...m, status } : m))
    )
  }

  const handleBulkAssignGroup = (memberIds: string[], groupId: string) => {
    setMembers(
      members.map((m) => (memberIds.includes(m.id) ? { ...m, groupId } : m))
    )
  }

  const handleManageParents = () => {
    alert('Upravljanje staršev - to bo implementirano kasneje')
  }

  const handleManageCoaches = () => {
    alert('Upravljanje trenerjev - to bo implementirano kasneje')
  }

  return (
    <>
      <MemberList
        members={members}
        parents={parents}
        groups={groups}
        coaches={coaches}
        searchFilter={searchFilter}
        statusFilter={statusFilter}
        groupFilter={groupFilter}
        onViewMember={(id) => {
          const member = members.find((m) => m.id === id)
          alert(`Pregled tekmovalca: ${member?.firstName} ${member?.lastName}`)
        }}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
        onCreateMember={handleCreateMember}
        onStatusChange={handleStatusChange}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAssignGroup={handleBulkAssignGroup}
        onSearchChange={setSearchFilter}
        onStatusFilterChange={setStatusFilter}
        onGroupFilterChange={setGroupFilter}
        onManageParents={handleManageParents}
        onManageCoaches={handleManageCoaches}
      />
      <MemberForm
        member={editingMember}
        parents={parents}
        groups={groups}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveMember}
        onAddParent={() => {
          alert('Dodajanje novega starša - to bo implementirano kasneje')
        }}
      />
    </>
  )
}

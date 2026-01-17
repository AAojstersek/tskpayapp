import { useState } from 'react'
import { MemberList, MemberForm, ParentList, ParentForm, CoachList, CoachForm, RenameGroupDialog } from '@/components/members'
import type { MemberFormSaveData } from '@/components/members/MemberForm'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui'
import type { Member, Parent, Coach } from '@/types'
import { useMembers, useParents, useCoaches, useGroups } from '@/data/useAppStore'

export function ClaniInSkupinePage() {
  const [mode, setMode] = useState<'members' | 'parents' | 'coaches'>('members')
  const { members, create: createMember, update: updateMember, remove: deleteMember } = useMembers()
  const { parents, create: createParent, update: updateParent, remove: deleteParent } = useParents()
  const { groups, create: createGroup, update: updateGroup, remove: deleteGroup } = useGroups()
  const { coaches, create: createCoach, update: updateCoach, remove: deleteCoach } = useCoaches()

  const [renameGroupDialogOpen, setRenameGroupDialogOpen] = useState(false)
  const [renamingGroup, setRenamingGroup] = useState<{ coachId: string; groupId: string; currentName: string } | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'archived' | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [parentFormOpen, setParentFormOpen] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [coachFormOpen, setCoachFormOpen] = useState(false)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)

  const handleCreateMember = () => {
    setEditingMember(null)
    setMemberFormOpen(true)
  }

  const handleEditMember = (id: string) => {
    const member = members.find((m) => m.id === id)
    setEditingMember(member || null)
    setMemberFormOpen(true)
  }

  const handleDeleteMember = (id: string) => {
    if (confirm('Ali ste prepričani, da želite izbrisati tega tekmovalca?')) {
      deleteMember(id)
    }
  }

  const handleSaveMember = (memberData: MemberFormSaveData) => {
    if (editingMember) {
      // Update existing member
      const { createSelfAsParent, ...updateData } = memberData
      updateMember(editingMember.id, updateData)
    } else {
      // Create new member
      const { createSelfAsParent, ...memberCreateData } = memberData
      
      if (createSelfAsParent) {
        // Create a parent record for this self-paying member
        const newParent = createParent({
          firstName: memberCreateData.firstName,
          lastName: memberCreateData.lastName,
          email: '',
          phone: '',
        })
        
        // Create member linked to the new parent
        createMember({
          ...memberCreateData,
          parentId: newParent.id,
          parentIds: [newParent.id],
        })
      } else {
        // Regular member creation
        createMember(memberCreateData)
      }
    }
    setMemberFormOpen(false)
    setEditingMember(null)
  }

  const handleStatusChange = (id: string, status: 'active' | 'inactive' | 'archived') => {
    updateMember(id, { status })
  }

  const handleBulkStatusChange = (memberIds: string[], status: 'active' | 'inactive' | 'archived') => {
    // Persist each member update individually to SQLite
    memberIds.forEach((id) => {
      updateMember(id, { status })
    })
  }

  const handleBulkAssignGroup = (memberIds: string[], groupId: string) => {
    // Persist each member update individually to SQLite
    memberIds.forEach((id) => {
      updateMember(id, { groupId })
    })
  }

  const handleCreateParent = () => {
    setEditingParent(null)
    setParentFormOpen(true)
  }

  const handleEditParent = (id: string) => {
    const parent = parents.find((p) => p.id === id)
    setEditingParent(parent || null)
    setParentFormOpen(true)
  }

  const handleDeleteParent = (id: string) => {
    const memberCount = members.filter((m) => {
      const memberParentIds = m.parentIds && m.parentIds.length > 0
        ? m.parentIds
        : (m.parentId ? [m.parentId] : [])
      return memberParentIds.includes(id)
    }).length
    if (memberCount > 0) {
      alert(`Ne morete izbrisati starša, ker je povezan z ${memberCount} ${memberCount === 1 ? 'tekmovalcem' : 'tekmovalci'}.`)
      return
    }
    if (confirm('Ali ste prepričani, da želite izbrisati tega starša?')) {
      deleteParent(id)
    }
  }

  const handleSaveParent = (parentData: Omit<Parent, 'id'>) => {
    if (editingParent) {
      updateParent(editingParent.id, parentData)
    } else {
      createParent(parentData)
    }
    setParentFormOpen(false)
    setEditingParent(null)
  }

  const handleCreateCoach = () => {
    setEditingCoach(null)
    setCoachFormOpen(true)
  }

  const handleEditCoach = (id: string) => {
    const coach = coaches.find((c) => c.id === id)
    setEditingCoach(coach || null)
    setCoachFormOpen(true)
  }

  const handleDeleteCoach = (id: string) => {
    const memberCount = members.filter((m) => {
      const memberGroup = groups.find((g) => g.id === m.groupId)
      return memberGroup?.coachId === id
    }).length

    if (memberCount > 0) {
      alert(`Ne morete izbrisati trenerja, ker ima ${memberCount} ${memberCount === 1 ? 'tekmovalca' : 'tekmovalcev'} v skupini.`)
      return
    }

    if (confirm('Ali ste prepričani, da želite izbrisati tega trenerja? Skupina bo tudi izbrisana.')) {
      deleteCoach(id)
      // Also delete the coach's group
      const coachGroups = groups.filter((g) => g.coachId === id)
      coachGroups.forEach((g) => deleteGroup(g.id))
    }
  }

  const handleSaveCoach = (coachData: Omit<Coach, 'id'>, groupName?: string) => {
    if (editingCoach) {
      updateCoach(editingCoach.id, coachData)
    } else {
      const newCoach = createCoach(coachData)

      // Automatically create a group for the new coach
      if (groupName) {
        createGroup({
          name: groupName,
          coachId: newCoach.id,
        })
      }
    }
    setCoachFormOpen(false)
    setEditingCoach(null)
  }

  const handleRenameGroup = (coachId: string, groupId: string) => {
    const group = groups.find((g) => g.id === groupId && g.coachId === coachId)
    if (group) {
      setRenamingGroup({ coachId, groupId, currentName: group.name })
      setRenameGroupDialogOpen(true)
    }
  }

  const handleSaveGroupRename = (newName: string) => {
    if (renamingGroup) {
      updateGroup(renamingGroup.groupId, { name: newName })
      setRenameGroupDialogOpen(false)
      setRenamingGroup(null)
    }
  }

  const getPrimaryActionLabel = () => {
    switch (mode) {
      case 'members':
        return 'Dodaj tekmovalca'
      case 'parents':
        return 'Dodaj starša'
      case 'coaches':
        return 'Dodaj trenerja'
    }
  }

  const handlePrimaryAction = () => {
    switch (mode) {
      case 'members':
        handleCreateMember()
        break
      case 'parents':
        handleCreateParent()
        break
      case 'coaches':
        handleCreateCoach()
        break
    }
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Člani in skupine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Upravljanje tekmovalcev, staršev in trenerskih skupin
            </p>
          </div>
          <div className="flex gap-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as 'members' | 'parents' | 'coaches')}>
              <TabsList>
                <TabsTrigger value="members">Tekmovalci</TabsTrigger>
                <TabsTrigger value="parents">Starši</TabsTrigger>
                <TabsTrigger value="coaches">Trenerji</TabsTrigger>
              </TabsList>
            </Tabs>
            <button
              onClick={handlePrimaryAction}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {getPrimaryActionLabel()}
            </button>
          </div>
        </div>

        {mode === 'members' && (
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
            onStatusChange={handleStatusChange}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkAssignGroup={handleBulkAssignGroup}
            onSearchChange={setSearchFilter}
            onStatusFilterChange={setStatusFilter}
            onGroupFilterChange={setGroupFilter}
          />
        )}

        {mode === 'parents' && (
          <ParentList
            parents={parents}
            members={members}
            searchFilter={searchFilter}
            onEditParent={handleEditParent}
            onDeleteParent={handleDeleteParent}
            onSearchChange={setSearchFilter}
          />
        )}

        {mode === 'coaches' && (
          <CoachList
            coaches={coaches}
            groups={groups}
            searchFilter={searchFilter}
            onEditCoach={handleEditCoach}
            onDeleteCoach={handleDeleteCoach}
            onRenameGroup={handleRenameGroup}
            onSearchChange={setSearchFilter}
          />
        )}
      </div>

      <RenameGroupDialog
        groupName={renamingGroup?.currentName || ''}
        open={renameGroupDialogOpen}
        onOpenChange={setRenameGroupDialogOpen}
        onSave={handleSaveGroupRename}
      />

      <MemberForm
        member={editingMember}
        parents={parents}
        groups={groups}
        open={memberFormOpen}
        onOpenChange={setMemberFormOpen}
        onSave={handleSaveMember}
        onAddParent={handleCreateParent}
      />
      <ParentForm
        parent={editingParent}
        open={parentFormOpen}
        onOpenChange={setParentFormOpen}
        onSave={handleSaveParent}
      />
      <CoachForm
        coach={editingCoach}
        open={coachFormOpen}
        onOpenChange={setCoachFormOpen}
        onSave={handleSaveCoach}
      />
    </>
  )
}

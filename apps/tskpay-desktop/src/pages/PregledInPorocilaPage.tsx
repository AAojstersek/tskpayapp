import { useState, useMemo } from 'react'
import { DashboardView } from '@/components/dashboard'
import type {
  DashboardKPIs,
  MemberObligation,
  GroupObligation,
  FinancialReport,
  BankTransaction,
  Member,
  Parent,
  Group,
  Cost,
  Payment,
} from '@/types'
import { useMembers, useParents, useGroups, useCosts, usePayments, useBankTransactions } from '@/data/useAppStore'

// Aggregation functions
function calculateKPIs(
  costs: Cost[],
  payments: Payment[],
  unmatchedTransactions: BankTransaction[],
  periodFrom?: string,
  periodTo?: string
): DashboardKPIs {
  const openCosts = costs.filter((c) => c.status === 'pending')
  const totalOpenDebt = openCosts.reduce((sum, c) => sum + c.amount, 0)
  const openItemsCount = openCosts.length

  const filteredPayments = payments.filter((p) => {
    if (periodFrom && p.paymentDate < periodFrom) return false
    if (periodTo && p.paymentDate > periodTo) return false
    return true
  })
  const paymentsInPeriod = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

  const unmatchedTransactionsCount = unmatchedTransactions.filter(
    (t) => t.status === 'unmatched'
  ).length

  return {
    totalOpenDebt,
    openItemsCount,
    paymentsInPeriod,
    unmatchedTransactionsCount,
  }
}

function calculateMemberObligations(
  costs: Cost[],
  payments: Payment[],
  members: Member[],
  parents: Parent[],
  groups: Group[]
): MemberObligation[] {
  const membersMap = new Map(members.map((m) => [m.id, m]))
  const parentsMap = new Map(parents.map((p) => [p.id, p]))
  const groupsMap = new Map(groups.map((g) => [g.id, g]))

  // Group payments by parent
  const paymentsByParent = new Map<string, number>()
  payments.forEach((p) => {
    if (p.parentId) {
      const current = paymentsByParent.get(p.parentId) || 0
      paymentsByParent.set(p.parentId, current + p.amount)
    }
  })

  // Group members by parent to allocate payments (member can have multiple parents)
  const membersByParent = new Map<string, Member[]>()
  members.forEach((m) => {
    const memberParentIds = m.parentIds && m.parentIds.length > 0
      ? m.parentIds
      : (m.parentId ? [m.parentId] : [])
    
    memberParentIds.forEach((parentId) => {
      if (!membersByParent.has(parentId)) {
        membersByParent.set(parentId, [])
      }
      membersByParent.get(parentId)!.push(m)
    })
  })

  // Calculate obligations per member
  const obligationsMap = new Map<string, MemberObligation>()

  // Initialize obligations for all members with costs
  costs.forEach((cost) => {
    const member = membersMap.get(cost.memberId)
    if (!member) return

    if (!obligationsMap.has(cost.memberId)) {
      const memberParentIds = member.parentIds && member.parentIds.length > 0
        ? member.parentIds
        : (member.parentId ? [member.parentId] : [])
      const firstParentId = memberParentIds[0] || member.parentId
      const parentNames = memberParentIds
        .map((pid) => {
          const p = parentsMap.get(pid)
          return p ? `${p.firstName} ${p.lastName}` : null
        })
        .filter((n): n is string => n !== null)
        .join(', ') || 'Neznan'
      const group = groupsMap.get(member.groupId)

      obligationsMap.set(cost.memberId, {
        memberId: cost.memberId,
        memberName: `${member.firstName} ${member.lastName}`,
        parentId: firstParentId || '',
        parentName: parentNames,
        groupId: member.groupId,
        groupName: group?.name || 'Neznana skupina',
        status: member.status,
        balance: 0,
        openItemsCount: 0,
        overdueItemsCount: 0,
        overdueAmount: 0,
        openItems: [],
      })
    }

    const obligation = obligationsMap.get(cost.memberId)!
    if (cost.status === 'pending') {
      obligation.balance += cost.amount
      obligation.openItemsCount++
      const today = new Date()
      const dueDate = cost.dueDate ? new Date(cost.dueDate) : null
      const isOverdue = dueDate && dueDate < today

      if (isOverdue) {
        obligation.overdueItemsCount++
        obligation.overdueAmount += cost.amount
      }

      obligation.openItems.push({
        costId: cost.id,
        title: cost.title,
        amount: cost.amount,
        dueDate: cost.dueDate,
        isOverdue: isOverdue || false,
      })
    }
  })

  // Allocate payments to members (simple allocation: divide equally among members of same parent)
  obligationsMap.forEach((obligation) => {
    const member = membersMap.get(obligation.memberId)
    if (member) {
      const memberParentIds = member.parentIds && member.parentIds.length > 0
        ? member.parentIds
        : (member.parentId ? [member.parentId] : [])
      
      // Sum payments from all parents of this member
      let totalParentPayments = 0
      let totalSiblingCount = 0
      
      memberParentIds.forEach((parentId) => {
        const parentPayments = paymentsByParent.get(parentId) || 0
        const siblings = membersByParent.get(parentId) || []
        totalParentPayments += parentPayments
        totalSiblingCount += siblings.length
      })
      
      if (totalSiblingCount > 0 && totalParentPayments > 0) {
        // Simple allocation: divide payments equally among all siblings from all parents
        const allocatedPayment = totalParentPayments / totalSiblingCount
        obligation.balance = Math.max(0, obligation.balance - allocatedPayment)
      }
    }
  })

  return Array.from(obligationsMap.values())
}

function calculateGroupObligations(
  memberObligations: MemberObligation[],
  groups: Group[]
): GroupObligation[] {
  const groupsMap = new Map(groups.map((g) => [g.id, g]))
  const obligationsByGroup = new Map<string, GroupObligation>()

  memberObligations.forEach((memberObl) => {
    if (!obligationsByGroup.has(memberObl.groupId)) {
      const group = groupsMap.get(memberObl.groupId)
      obligationsByGroup.set(memberObl.groupId, {
        groupId: memberObl.groupId,
        groupName: group?.name || 'Neznana skupina',
        totalOpenDebt: 0,
        openItemsCount: 0,
        overdueItemsCount: 0,
        overdueAmount: 0,
        memberCount: 0,
      })
    }

    const groupObl = obligationsByGroup.get(memberObl.groupId)!
    groupObl.totalOpenDebt += memberObl.balance
    groupObl.openItemsCount += memberObl.openItemsCount
    groupObl.overdueItemsCount += memberObl.overdueItemsCount
    groupObl.overdueAmount += memberObl.overdueAmount
    groupObl.memberCount++
  })

  return Array.from(obligationsByGroup.values())
}

function calculateFinancialReport(
  costs: Cost[],
  payments: Payment[],
  periodFrom: string | undefined,
  periodTo: string | undefined
): FinancialReport {
  const from = periodFrom || '1970-01-01'
  const to = periodTo || '9999-12-31'
  
  const filteredCosts = costs.filter((c) => {
    const costDate = new Date(c.createdAt).toISOString().split('T')[0]
    return costDate >= from && costDate <= to
  })

  const filteredPayments = payments.filter((p) => {
    return p.paymentDate >= from && p.paymentDate <= to
  })

  const created = filteredCosts.reduce((sum, c) => sum + c.amount, 0)
  const paid = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const difference = created - paid
  const paymentRate = created > 0 ? (paid / created) * 100 : 0

  // Group by month
  const costsByMonth = new Map<string, { amount: number; count: number }>()
  const paymentsByMonth = new Map<string, { amount: number; count: number }>()

  filteredCosts.forEach((cost) => {
    const month = new Date(cost.createdAt).toISOString().slice(0, 7)
    const current = costsByMonth.get(month) || { amount: 0, count: 0 }
    costsByMonth.set(month, {
      amount: current.amount + cost.amount,
      count: current.count + 1,
    })
  })

  filteredPayments.forEach((payment) => {
    const month = payment.paymentDate.slice(0, 7)
    const current = paymentsByMonth.get(month) || { amount: 0, count: 0 }
    paymentsByMonth.set(month, {
      amount: current.amount + payment.amount,
      count: current.count + 1,
    })
  })

  // Group costs by type
  const costsByType = new Map<string, { amount: number; count: number }>()
  filteredCosts.forEach((cost) => {
    const current = costsByType.get(cost.costType) || { amount: 0, count: 0 }
    costsByType.set(cost.costType, {
      amount: current.amount + cost.amount,
      count: current.count + 1,
    })
  })

  return {
    period: { from: from, to: to },
    income: {
      total: paid,
      byMonth: Array.from(paymentsByMonth.entries()).map(([month, data]) => ({
        month,
        amount: data.amount,
        paymentCount: data.count,
      })),
    },
    costs: {
      total: created,
      byMonth: Array.from(costsByMonth.entries()).map(([month, data]) => ({
        month,
        amount: data.amount,
        costCount: data.count,
      })),
      byType: Array.from(costsByType.entries()).map(([costType, data]) => ({
        costType,
        amount: data.amount,
        costCount: data.count,
      })),
    },
    comparison: {
      created,
      paid,
      difference,
      paymentRate,
    },
  }
}

export function PregledInPorocilaPage() {
  const { members } = useMembers()
  const { parents } = useParents()
  const { groups } = useGroups()
  const { costs } = useCosts()
  const { payments } = usePayments()
  const { bankTransactions } = useBankTransactions()

  const [periodFrom, setPeriodFrom] = useState<string | undefined>(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]
  )
  const [periodTo, setPeriodTo] = useState<string | undefined>(
    new Date().toISOString().split('T')[0]
  )
  const [groupFilter, setGroupFilter] = useState<string | undefined>(undefined)
  const [memberStatusFilter, setMemberStatusFilter] = useState<'active' | 'inactive' | 'all'>('all')
  const [viewMode, setViewMode] = useState<'by-member' | 'by-group'>('by-member')

  const unmatchedTransactions = useMemo(
    () => bankTransactions.filter((t) => t.status === 'unmatched'),
    [bankTransactions]
  )

  const dashboardKPIs = useMemo(
    () => calculateKPIs(costs, payments, unmatchedTransactions, periodFrom, periodTo),
    [costs, payments, unmatchedTransactions, periodFrom, periodTo]
  )

  const memberObligations = useMemo(
    () => calculateMemberObligations(costs, payments, members, parents, groups),
    [costs, payments, members, parents, groups]
  )

  const groupObligations = useMemo(
    () => calculateGroupObligations(memberObligations, groups),
    [memberObligations, groups]
  )

  const financialReport = useMemo(
    () => calculateFinancialReport(costs, payments, periodFrom, periodTo),
    [costs, payments, periodFrom, periodTo]
  )

  const handleExportByParent = (parentId: string, format: 'csv' | 'pdf') => {
    const parent = parents.find((p) => p.id === parentId)
    alert(`Izvoz obveznosti za ${parent?.firstName} ${parent?.lastName} v formatu ${format.toUpperCase()}`)
    // TODO: Implement actual export
  }

  const handleExportByGroup = (groupId: string, format: 'csv' | 'pdf') => {
    const group = groups.find((g) => g.id === groupId)
    alert(`Izvoz obveznosti za ${group?.name} v formatu ${format.toUpperCase()}`)
    // TODO: Implement actual export
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Pregled in poročila
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Nadzorna plošča z pregledom obveznosti in finančnimi poročili
        </p>
      </div>

      <DashboardView
        dashboardKPIs={dashboardKPIs}
        memberObligations={memberObligations}
        groupObligations={groupObligations}
        financialReports={financialReport}
        periodFrom={periodFrom}
        periodTo={periodTo}
        groupFilter={groupFilter}
        memberStatusFilter={memberStatusFilter}
        viewMode={viewMode}
        onPeriodFromChange={setPeriodFrom}
        onPeriodToChange={setPeriodTo}
        onGroupFilterChange={setGroupFilter}
        onMemberStatusFilterChange={setMemberStatusFilter}
        onViewModeChange={setViewMode}
        onViewMemberDetails={(memberId) => {
          alert(`Pregled podrobnosti člana: ${memberId}`)
        }}
        onViewParentDetails={(parentId) => {
          const parent = parents.find((p) => p.id === parentId)
          alert(`Pregled podrobnosti starša: ${parent?.firstName} ${parent?.lastName}`)
        }}
        onViewGroupDetails={(groupId) => {
          const group = groups.find((g) => g.id === groupId)
          alert(`Pregled podrobnosti skupine: ${group?.name}`)
        }}
        onExportByParent={handleExportByParent}
        onExportByGroup={handleExportByGroup}
      />
    </div>
  )
}

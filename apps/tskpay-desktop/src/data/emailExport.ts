import type { Parent, Member, Cost } from '@/types'

/**
 * Format date to Slovenian locale
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Ni roka'
  const date = new Date(dateString)
  return date.toLocaleDateString('sl-SI')
}

/**
 * Generate email template for a single parent with overdue costs
 */
export function generateEmailForParent(
  parent: Parent,
  members: Member[],
  costs: Cost[]
): string {
  // Find all members for this parent
  const parentMembers = members.filter((m) => {
    const memberParentIds = m.parentIds && m.parentIds.length > 0
      ? m.parentIds
      : (m.parentId ? [m.parentId] : [])
    return memberParentIds.includes(parent.id)
  })

  if (parentMembers.length === 0) {
    return ''
  }

  // Find overdue costs for these members
  // Get today's date at midnight in local timezone for proper comparison
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0] // Format: YYYY-MM-DD

  const overdueCosts = costs.filter((c) => {
    const isForParentMember = parentMembers.some((m) => m.id === c.memberId)
    const isPending = c.status === 'pending'
    
    // Check if due date is before today (overdue)
    // Compare date strings (YYYY-MM-DD) to avoid timezone issues
    let isOverdue = false
    if (c.dueDate) {
      // dueDate should already be in YYYY-MM-DD format
      const dueDateStr = c.dueDate.split('T')[0] // Extract date part if it includes time
      isOverdue = dueDateStr < todayStr
    }
    
    // Debug logging for first few costs
    if (isForParentMember && isPending) {
      console.log(`[emailExport] Cost ${c.title}: dueDate=${c.dueDate}, dueDateStr=${c.dueDate?.split('T')[0]}, todayStr=${todayStr}, isOverdue=${isOverdue}`)
    }
    
    return isForParentMember && isPending && isOverdue
  })

  if (overdueCosts.length === 0) {
    console.log(`[emailExport] No overdue costs for parent ${parent.firstName} ${parent.lastName}`)
    return ''
  }

  // Group costs by member
  const costsByMember = new Map<string, Cost[]>()
  overdueCosts.forEach((cost) => {
    const memberCosts = costsByMember.get(cost.memberId) || []
    memberCosts.push(cost)
    costsByMember.set(cost.memberId, memberCosts)
  })

  // Generate email
  let email = `Spoštovani/na ${parent.firstName} ${parent.lastName},\n\n`
  email += `pošiljamo vam obvestilo o odprtih obveznostih za vaše člane:\n\n`

  let totalAmount = 0
  costsByMember.forEach((memberCosts, memberId) => {
    const member = parentMembers.find((m) => m.id === memberId)
    if (member) {
      email += `${member.firstName} ${member.lastName}:\n`
      memberCosts.forEach((cost) => {
        email += `  - ${cost.title}: ${cost.amount.toFixed(2)} € (rok: ${formatDate(cost.dueDate)} - PREKORAČEN)\n`
        totalAmount += cost.amount
      })
      email += '\n'
    }
  })

  email += `Skupni znesek odprtih obveznosti: ${totalAmount.toFixed(2)} €\n\n`
  email += `Prosimo vas, da obveznosti poravnate v najkrajšem možnem času.\n\n`
  email += `Lep pozdrav,\n`
  email += `TSK JUB Dol\n\n`
  email += `---\n`
  email += `Email naslov: ${parent.email}\n\n\n`

  return email
}

/**
 * Generate complete email export file for all parents with overdue costs
 */
export function generateEmailExportFile(
  parents: Parent[],
  members: Member[],
  costs: Cost[]
): string {
  // Filter parents with email addresses
  const parentsWithEmail = parents.filter(
    (p) => p.email && p.email.trim().length > 0
  )

  let fileContent = ''

  parentsWithEmail.forEach((parent) => {
    const email = generateEmailForParent(parent, members, costs)
    if (email) {
      fileContent += email
    }
  })

  if (fileContent === '') {
    return 'Ni staršev s prekoračenimi stroški in email naslovom.\n'
  }

  return fileContent
}

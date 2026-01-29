/**
 * Parser for camt.052 XML bank statement files
 */

export interface ParsedTransaction {
  id: string // AcctSvcrRef or TxId
  amount: number
  currency: string
  bookingDate: string
  valueDate: string
  payerName: string
  payerIban: string | null
  description: string
  reference: string | null
  bankFee: number
  isCredit: boolean
}

export interface ParsedBankStatement {
  messageId: string
  creationDateTime: string
  accountIban: string
  accountOwner: string
  transactions: ParsedTransaction[]
}

/**
 * Parse a camt.052 XML file content into a structured bank statement
 */
export function parseCamt052Xml(xmlContent: string): ParsedBankStatement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlContent, 'text/xml')
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    throw new Error('Invalid XML format: ' + parserError.textContent)
  }
  
  // Helper function to get text content with namespace support
  const getText = (parent: Element | Document, selector: string): string | null => {
    // Try without namespace first (some files may not use namespace prefixes)
    const el = parent.querySelector(selector)
    if (!el) {
      // Try to find by local name
      const parts = selector.split(' ')
      let current: Element | null = parent instanceof Document ? parent.documentElement : parent
      for (const part of parts) {
        if (!current) break
        const children: Element[] = Array.from(current.children)
        current = children.find((c: Element) => c.localName === part) || null
      }
      if (current) {
        return current.textContent?.trim() || null
      }
    }
    return el?.textContent?.trim() || null
  }
  
  // Parse header
  const messageId = getText(doc, 'GrpHdr MsgId') || getText(doc, 'Document BkToCstmrAcctRpt GrpHdr MsgId') || ''
  const creationDateTime = getText(doc, 'GrpHdr CreDtTm') || getText(doc, 'Document BkToCstmrAcctRpt GrpHdr CreDtTm') || ''
  
  // Parse account info
  const accountIban = getText(doc, 'Rpt Acct Id IBAN') || getText(doc, 'Document BkToCstmrAcctRpt Rpt Acct Id IBAN') || ''
  const accountOwner = getText(doc, 'Rpt Acct Ownr Nm') || getText(doc, 'Document BkToCstmrAcctRpt Rpt Acct Ownr Nm') || ''
  
  // Parse transactions (Ntry elements)
  const transactions: ParsedTransaction[] = []
  const entries = doc.querySelectorAll('Ntry')
  
  entries.forEach((entry) => {
    // Only process credit transactions (incoming payments)
    const creditDebitIndicator = getText(entry, 'CdtDbtInd')
    const isCredit = creditDebitIndicator === 'CRDT'
    
    // Skip non-credit transactions
    if (!isCredit) return
    
    // Get amount
    const amtEl = entry.querySelector('Amt')
    const amount = parseFloat(amtEl?.textContent || '0')
    const currency = amtEl?.getAttribute('Ccy') || 'EUR'
    
    // Get dates
    const bookingDate = getText(entry, 'BookgDt Dt') || ''
    const valueDate = getText(entry, 'ValDt Dt') || ''
    
    // Get unique ID
    const acctSvcrRef = getText(entry, 'AcctSvcrRef') || ''
    const txId = getText(entry, 'NtryDtls TxDtls Refs TxId') || ''
    const id = acctSvcrRef || txId || `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    // Get bank fee (Chrgs)
    const bankFee = parseFloat(getText(entry, 'Chrgs Amt') || '0')
    
    // Get payer info
    const payerName = getText(entry, 'NtryDtls TxDtls RltdPties Dbtr Nm') || 'Neznani plačnik'
    const payerIban = getText(entry, 'NtryDtls TxDtls RltdPties DbtrAcct Id IBAN')
    
    // Get description - try structured first, then unstructured
    let description = ''
    const ustrd = getText(entry, 'NtryDtls TxDtls RmtInf Ustrd')
    const addtlRmtInf = getText(entry, 'NtryDtls TxDtls RmtInf Strd AddtlRmtInf')
    description = ustrd || addtlRmtInf || ''
    
    // Get reference
    const reference = getText(entry, 'NtryDtls TxDtls RmtInf Strd CdtrRefInf Ref') ||
                      getText(entry, 'NtryDtls TxDtls Refs EndToEndId')
    
    transactions.push({
      id,
      amount,
      currency,
      bookingDate,
      valueDate,
      payerName,
      payerIban,
      description,
      reference: reference && reference !== 'NOTPROVIDED' ? reference : null,
      bankFee,
      isCredit,
    })
  })
  
  return {
    messageId,
    creationDateTime,
    accountIban,
    accountOwner,
    transactions,
  }
}

/**
 * Read an XML file and parse it
 */
export async function parseXmlFile(file: File): Promise<ParsedBankStatement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const xmlContent = e.target?.result as string
        const result = parseCamt052Xml(xmlContent)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read XML file'))
    reader.readAsText(file)
  })
}

/**
 * Match a parsed transaction to a parent by name or IBAN
 */
export interface ParentMatchResult {
  parentId: string | null
  memberId: string | null
  confidence: 'high' | 'medium' | 'low' | null
  matchReason: string | null
}

interface Parent {
  id: string
  firstName: string
  lastName: string
  iban?: string
}

interface Member {
  id: string
  firstName: string
  lastName: string
  parentIds: string[]
  parentId?: string
}

export function matchTransactionToParent(
  transaction: ParsedTransaction,
  parents: Parent[],
  members: Member[]
): ParentMatchResult {
  const payerNameNormalized = transaction.payerName.toUpperCase().trim()
  const descriptionNormalized = (transaction.description || '').toUpperCase().trim()
  
  // First, try to match by IBAN (highest confidence)
  if (transaction.payerIban) {
    const ibanNormalized = transaction.payerIban.replace(/\s/g, '')
    for (const parent of parents) {
      if (parent.iban && parent.iban.replace(/\s/g, '') === ibanNormalized) {
        // Find a member linked to this parent
        const linkedMember = members.find(m => {
          const memberParentIds = m.parentIds?.length > 0 
            ? m.parentIds 
            : (m.parentId ? [m.parentId] : [])
          return memberParentIds.includes(parent.id)
        })
        return {
          parentId: parent.id,
          memberId: linkedMember?.id || null,
          confidence: 'high',
          matchReason: `IBAN ujemanje: ${transaction.payerIban}`,
        }
      }
    }
  }
  
  // Second, try to match by full name in payer name
  for (const parent of parents) {
    const fullName = `${parent.firstName} ${parent.lastName}`.toUpperCase()
    const reverseName = `${parent.lastName} ${parent.firstName}`.toUpperCase()
    
    if (payerNameNormalized.includes(fullName) || payerNameNormalized.includes(reverseName)) {
      const linkedMember = members.find(m => {
        const memberParentIds = m.parentIds?.length > 0 
          ? m.parentIds 
          : (m.parentId ? [m.parentId] : [])
        return memberParentIds.includes(parent.id)
      })
      return {
        parentId: parent.id,
        memberId: linkedMember?.id || null,
        confidence: 'high',
        matchReason: `Ime plačnika: ${parent.firstName} ${parent.lastName}`,
      }
    }
  }
  
  // Third, try to match by last name only in payer name
  for (const parent of parents) {
    const lastName = parent.lastName.toUpperCase()
    if (lastName.length >= 3 && payerNameNormalized.includes(lastName)) {
      const linkedMember = members.find(m => {
        const memberParentIds = m.parentIds?.length > 0 
          ? m.parentIds 
          : (m.parentId ? [m.parentId] : [])
        return memberParentIds.includes(parent.id)
      })
      return {
        parentId: parent.id,
        memberId: linkedMember?.id || null,
        confidence: 'medium',
        matchReason: `Priimek v imenu plačnika: ${parent.lastName}`,
      }
    }
  }
  
  // Fourth, try to match member names in description
  for (const member of members) {
    const memberFullName = `${member.firstName} ${member.lastName}`.toUpperCase()
    const memberReverseName = `${member.lastName} ${member.firstName}`.toUpperCase()
    
    if (descriptionNormalized.includes(memberFullName) || descriptionNormalized.includes(memberReverseName)) {
      // Find the first parent of this member
      const memberParentIds = member.parentIds?.length > 0 
        ? member.parentIds 
        : (member.parentId ? [member.parentId] : [])
      const parentId = memberParentIds[0] || null
      return {
        parentId,
        memberId: member.id,
        confidence: 'medium',
        matchReason: `Ime člana v opisu: ${member.firstName} ${member.lastName}`,
      }
    }
  }
  
  // Fifth, try to match parent last names in description
  for (const parent of parents) {
    const lastName = parent.lastName.toUpperCase()
    if (lastName.length >= 3 && descriptionNormalized.includes(lastName)) {
      const linkedMember = members.find(m => {
        const memberParentIds = m.parentIds?.length > 0 
          ? m.parentIds 
          : (m.parentId ? [m.parentId] : [])
        return memberParentIds.includes(parent.id)
      })
      return {
        parentId: parent.id,
        memberId: linkedMember?.id || null,
        confidence: 'low',
        matchReason: `Priimek v opisu: ${parent.lastName}`,
      }
    }
  }
  
  // No match found
  return {
    parentId: null,
    memberId: null,
    confidence: null,
    matchReason: null,
  }
}

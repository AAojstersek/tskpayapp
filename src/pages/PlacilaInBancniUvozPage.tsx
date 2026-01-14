import { useState } from 'react'
import { TransactionList, BankStatementList } from '@/components/payments'
import type { BankStatement, BankTransaction, Payment, Parent } from '@/types'

// Sample data - in production, this would come from an API
const initialStatements: BankStatement[] = [
  {
    id: 'stmt-001',
    fileName: 'izpisek_januar_2024.pdf',
    fileType: 'pdf',
    importedAt: '2024-02-01T10:30:00Z',
    status: 'completed',
    totalTransactions: 8,
    matchedTransactions: 6,
    unmatchedTransactions: 2,
  },
  {
    id: 'stmt-002',
    fileName: 'izpisek_februar_2024.xml',
    fileType: 'xml',
    importedAt: '2024-03-01T09:15:00Z',
    status: 'completed',
    totalTransactions: 12,
    matchedTransactions: 10,
    unmatchedTransactions: 2,
  },
]

const initialTransactions: BankTransaction[] = [
  {
    id: 'txn-001',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-15',
    amount: 50.0,
    description: 'Nakazilo Janez Novak',
    reference: 'SI56012345678901234',
    accountNumber: 'SI56012345678901234',
    matchedParentId: 'par-001',
    matchConfidence: 'high',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-002',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-16',
    amount: 150.0,
    description: 'Nakazilo Janez Novak',
    reference: 'SI56012345678901234',
    accountNumber: 'SI56012345678901234',
    matchedParentId: 'par-001',
    matchConfidence: 'high',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-003',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-18',
    amount: 50.0,
    description: 'Nakazilo Maja Kovač',
    reference: 'SI56023456789012345',
    accountNumber: 'SI56023456789012345',
    matchedParentId: 'par-002',
    matchConfidence: 'high',
    status: 'confirmed',
    paymentId: 'pay-001',
  },
  {
    id: 'txn-004',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-20',
    amount: 35.0,
    description: 'Nakazilo Marko Zupan',
    reference: 'SI56034567890123456',
    accountNumber: 'SI56034567890123456',
    matchedParentId: 'par-005',
    matchConfidence: 'medium',
    status: 'matched',
    paymentId: null,
  },
  {
    id: 'txn-005',
    bankStatementId: 'stmt-001',
    transactionDate: '2024-01-22',
    amount: 75.5,
    description: 'Nakazilo neznanega plačnika',
    reference: null,
    accountNumber: 'SI56045678901234567',
    matchedParentId: null,
    matchConfidence: null,
    status: 'unmatched',
    paymentId: null,
  },
]

const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    parentId: 'par-002',
    amount: 50.0,
    paymentDate: '2024-01-18',
    paymentMethod: 'bank_transfer',
    referenceNumber: 'SI56023456789012345',
    notes: 'Plačilo za vadnine - Januar 2024',
    importedFromBank: true,
    bankTransactionId: 'txn-003',
    createdAt: '2024-01-18T12:00:00Z',
  },
]

const sampleParents: Parent[] = [
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
    id: 'par-005',
    firstName: 'Marko',
    lastName: 'Zupan',
    email: 'marko.zupan@email.si',
    phone: '+386 41 567 890',
  },
]

export function PlacilaInBancniUvozPage() {
  const [statements, setStatements] = useState<BankStatement[]>(initialStatements)
  const [transactions, setTransactions] = useState<BankTransaction[]>(initialTransactions)
  const [payments] = useState<Payment[]>(initialPayments)
  const [selectedStatementId, setSelectedStatementId] = useState<string | undefined>(undefined)
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<'matched' | 'unmatched' | 'confirmed' | 'all'>('all')
  const [statementFilter, setStatementFilter] = useState<string | undefined>(undefined)
  const [parentFilter, setParentFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)

  // Mock transaction matching logic
  const matchTransactionToParent = (transaction: BankTransaction, parents: Parent[]): { parentId: string | null; confidence: 'high' | 'medium' | 'low' | null } => {
    // Simple matching by name in description
    for (const parent of parents) {
      const fullName = `${parent.firstName} ${parent.lastName}`
      if (transaction.description.includes(fullName)) {
        return { parentId: parent.id, confidence: 'high' }
      }
      if (transaction.description.includes(parent.lastName)) {
        return { parentId: parent.id, confidence: 'medium' }
      }
    }
    return { parentId: null, confidence: null }
  }

  const handleUploadStatement = (file: File) => {
    // Mock file processing
    const newStatement: BankStatement = {
      id: `stmt-${Date.now()}`,
      fileName: file.name,
      fileType: file.name.endsWith('.pdf') ? 'pdf' : 'xml',
      importedAt: new Date().toISOString(),
      status: 'processing',
      totalTransactions: 0,
      matchedTransactions: 0,
      unmatchedTransactions: 0,
    }

    setStatements([newStatement, ...statements])

    // Simulate processing
    setTimeout(() => {
      // Mock: Create some transactions from the file
      const mockTransactions: BankTransaction[] = [
        {
          id: `txn-${Date.now()}-1`,
          bankStatementId: newStatement.id,
          transactionDate: new Date().toISOString().split('T')[0],
          amount: 100.0,
          description: `Nakazilo ${sampleParents[0].firstName} ${sampleParents[0].lastName}`,
          reference: 'SI56012345678901234',
          accountNumber: 'SI56012345678901234',
          matchedParentId: sampleParents[0].id,
          matchConfidence: 'high',
          status: 'matched',
          paymentId: null,
        },
      ]

      const matchResults = mockTransactions.map((t) => matchTransactionToParent(t, sampleParents))
      const matched = matchResults.filter((r) => r.parentId).length

      setStatements(
        statements.map((s) =>
          s.id === newStatement.id
            ? {
                ...s,
                status: 'completed',
                totalTransactions: mockTransactions.length,
                matchedTransactions: matched,
                unmatchedTransactions: mockTransactions.length - matched,
              }
            : s
        )
      )

      setTransactions([...transactions, ...mockTransactions])
    }, 2000)
  }

  const handleUpdateTransactionMatch = (transactionId: string, parentId: string | null) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction) return

    const confidence = parentId
      ? matchTransactionToParent(transaction, sampleParents).confidence || 'low'
      : null

    setTransactions(
      transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              matchedParentId: parentId,
              matchConfidence: confidence,
              status: parentId ? 'matched' : 'unmatched',
            }
          : t
      )
    )

    // Update statement stats
    const statement = statements.find((s) => s.id === transaction.bankStatementId)
    if (statement) {
      // Use updated transactions for calculation
      const updatedTransactions = transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              matchedParentId: parentId,
              matchConfidence: confidence,
              status: parentId ? 'matched' : 'unmatched',
            }
          : t
      )
      const statementTransactions = updatedTransactions.filter((t) => t.bankStatementId === statement.id)
      const matched = statementTransactions.filter((t) => t.matchedParentId).length
      const unmatched = statementTransactions.length - matched

      setStatements(
        statements.map((s) =>
          s.id === statement.id
            ? {
                ...s,
                matchedTransactions: matched,
                unmatchedTransactions: unmatched,
              }
            : s
        )
      )
    }
  }

  const handleConfirmTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction || !transaction.matchedParentId) return

    // Create payment
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      parentId: transaction.matchedParentId,
      amount: transaction.amount,
      paymentDate: transaction.transactionDate,
      paymentMethod: 'bank_transfer',
      referenceNumber: transaction.reference,
      notes: `Plačilo iz bančnega izpiska: ${transaction.description}`,
      importedFromBank: true,
      bankTransactionId: transaction.id,
      createdAt: new Date().toISOString(),
    }

    // Update transaction status
    setTransactions(
      transactions.map((t) =>
        t.id === transactionId
          ? {
              ...t,
              status: 'confirmed',
              paymentId: newPayment.id,
            }
          : t
      )
    )

    alert(`Plačilo potrjeno: ${newPayment.amount.toFixed(2)} € za ${sampleParents.find((p) => p.id === transaction.matchedParentId)?.firstName} ${sampleParents.find((p) => p.id === transaction.matchedParentId)?.lastName}`)
  }

  const handleConfirmAllTransactions = (statementId: string) => {
    const statementTransactions = transactions.filter(
      (t) => t.bankStatementId === statementId && t.status !== 'confirmed' && t.matchedParentId
    )

    if (statementTransactions.length === 0) {
      alert('Ni transakcij za potrditev')
      return
    }

    if (confirm(`Ali ste prepričani, da želite potrditi vseh ${statementTransactions.length} transakcij?`)) {
      statementTransactions.forEach((transaction) => {
        handleConfirmTransaction(transaction.id)
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Plačila in bančni uvoz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Avtomatski uvoz bančnih izpiskov in upravljanje plačil
        </p>
      </div>

      {selectedStatementId ? (
        <TransactionList
          bankStatements={statements}
          bankTransactions={transactions}
          parents={sampleParents}
          selectedStatementId={selectedStatementId}
          transactionStatusFilter={transactionStatusFilter}
          statementFilter={statementFilter}
          parentFilter={parentFilter}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onCloseStatement={() => setSelectedStatementId(undefined)}
          onUpdateTransactionMatch={handleUpdateTransactionMatch}
          onConfirmTransaction={handleConfirmTransaction}
          onConfirmAllTransactions={handleConfirmAllTransactions}
          onTransactionStatusFilterChange={setTransactionStatusFilter}
          onStatementFilterChange={setStatementFilter}
          onParentFilterChange={setParentFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      ) : (
        <BankStatementList
          statements={statements}
          onViewStatement={setSelectedStatementId}
          onUploadStatement={handleUploadStatement}
        />
      )}
    </div>
  )
}

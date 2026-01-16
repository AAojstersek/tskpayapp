import { useState } from 'react'
import { TransactionList, BankStatementList } from '@/components/payments'
import type { BankTransaction, Parent } from '@/types'
import { useBankStatements, useBankTransactions, useParents, usePayments } from '@/data/useAppStore'

export function PlacilaInBancniUvozPage() {
  const { bankStatements: statements, create: createStatement, update: updateStatement } = useBankStatements()
  const { bankTransactions: transactions, create: createTransaction, update: updateTransaction } = useBankTransactions()
  const { parents } = useParents()
  const { create: createPayment } = usePayments()
  const [selectedStatementId, setSelectedStatementId] = useState<string | undefined>(undefined)
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<'matched' | 'unmatched' | 'confirmed' | 'all'>('all')
  const [statementFilter, setStatementFilter] = useState<string | undefined>(undefined)
  const [parentFilter, setParentFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)

  // Mock transaction matching logic
  const matchTransactionToParent = (transaction: BankTransaction, parentsList: Parent[]): { parentId: string | null; confidence: 'high' | 'medium' | 'low' | null } => {
    // Simple matching by name in description
    for (const parent of parentsList) {
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
    const newStatement = createStatement({
      fileName: file.name,
      fileType: file.name.endsWith('.pdf') ? 'pdf' : 'xml',
      importedAt: new Date().toISOString(),
      status: 'processing',
      totalTransactions: 0,
      matchedTransactions: 0,
      unmatchedTransactions: 0,
    })

    // Simulate processing
    setTimeout(() => {
      // Mock: Create some transactions from the file
      const firstParent = parents[0]
      const mockTransaction = createTransaction({
        bankStatementId: newStatement.id,
        transactionDate: new Date().toISOString().split('T')[0],
        amount: 100.0,
        description: firstParent ? `Nakazilo ${firstParent.firstName} ${firstParent.lastName}` : 'Nakazilo',
        reference: 'SI56012345678901234',
        accountNumber: 'SI56012345678901234',
        matchedParentId: firstParent?.id || null,
        matchConfidence: firstParent ? 'high' : null,
        status: firstParent ? 'matched' : 'unmatched',
        paymentId: null,
      })

      const matchResult = matchTransactionToParent(mockTransaction, parents)
      const matched = matchResult.parentId ? 1 : 0

      updateStatement(newStatement.id, {
        status: 'completed',
        totalTransactions: 1,
        matchedTransactions: matched,
        unmatchedTransactions: 1 - matched,
      })
    }, 2000)
  }

  const handleUpdateTransactionMatch = (transactionId: string, parentId: string | null) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction) return

    const confidence = parentId
      ? matchTransactionToParent(transaction, parents).confidence || 'low'
      : null

    updateTransaction(transactionId, {
      matchedParentId: parentId,
      matchConfidence: confidence,
      status: parentId ? 'matched' : 'unmatched',
    })

    // Update statement stats
    const statement = statements.find((s) => s.id === transaction.bankStatementId)
    if (statement) {
      const statementTransactions = transactions.filter((t) => t.bankStatementId === statement.id)
      const matched = statementTransactions.filter((t) => t.matchedParentId).length
      const unmatched = statementTransactions.length - matched

      updateStatement(statement.id, {
        matchedTransactions: matched,
        unmatchedTransactions: unmatched,
      })
    }
  }

  const handleConfirmTransaction = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction || !transaction.matchedParentId) return

    // Create payment
    const newPayment = createPayment({
      parentId: transaction.matchedParentId,
      amount: transaction.amount,
      paymentDate: transaction.transactionDate,
      paymentMethod: 'bank_transfer',
      referenceNumber: transaction.reference,
      notes: `Plačilo iz bančnega izpiska: ${transaction.description}`,
      importedFromBank: true,
      bankTransactionId: transaction.id,
    })

    // Update transaction status
    updateTransaction(transactionId, {
      status: 'confirmed',
      paymentId: newPayment.id,
    })

    const parent = parents.find((p) => p.id === transaction.matchedParentId)
    alert(`Plačilo potrjeno: ${newPayment.amount.toFixed(2)} € za ${parent?.firstName} ${parent?.lastName}`)
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
          parents={parents}
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

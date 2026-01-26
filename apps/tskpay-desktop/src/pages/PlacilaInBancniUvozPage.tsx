import { useState, useMemo, useRef } from 'react'
import { TransactionList, BankStatementList, PaymentForm, PaymentAllocationDialog } from '@/components/payments'
import { Button, Badge, Tabs, TabsList, TabsTrigger, Select, DateInput, ConfirmDialog } from '@/components/ui'
import type { Payment } from '@/types'
import { 
  useBankStatements, 
  useBankTransactions, 
  useParents, 
  usePayments, 
  usePaymentAllocations,
  useMembers, 
  useCosts 
} from '@/data/useAppStore'
import { Plus, CreditCard, FileText, Link2, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { parseXmlFile, matchTransactionToParent } from '@/lib/xmlParser'

type ViewMode = 'statements' | 'payments'

export function PlacilaInBancniUvozPage() {
  const { bankStatements: statements, create: createStatement, update: updateStatement, remove: removeStatement } = useBankStatements()
  const { bankTransactions: transactions, create: createTransaction, update: updateTransaction, remove: removeTransaction } = useBankTransactions()
  const { parents } = useParents()
  const { members } = useMembers()
  const { payments, create: createPayment, update: updatePayment, deleteWithCascade: deletePaymentWithCascade } = usePayments()
  const { paymentAllocations, create: createAllocation } = usePaymentAllocations()
  const { costs, update: updateCost } = useCosts()
  
  const [viewMode, setViewMode] = useState<ViewMode>('payments')
  const [selectedStatementId, setSelectedStatementId] = useState<string | undefined>(undefined)
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<'matched' | 'unmatched' | 'confirmed' | 'all'>('all')
  const [statementFilter, setStatementFilter] = useState<string | undefined>(undefined)
  const [parentFilter, setParentFilter] = useState<string | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined)
  const [dateTo, setDateTo] = useState<string | undefined>(undefined)
  const [hideConfirmed, setHideConfirmed] = useState(false)

  // Manual payment dialog state
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  
  // Allocation dialog state
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false)
  const [allocatingPayment, setAllocatingPayment] = useState<Payment | null>(null)
  // Track if the allocating payment is newly created (for rollback on cancel)
  // Using a ref because React batches state updates and we need to check this synchronously
  const isNewPaymentPendingRef = useRef(false)
  
  // Payment list filters
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'pending' | 'allocated' | 'confirmed' | 'all'>('all')
  const [paymentParentFilter, setPaymentParentFilter] = useState<string | undefined>(undefined)
  const [paymentDateFrom, setPaymentDateFrom] = useState<string | undefined>(undefined)
  const [paymentDateTo, setPaymentDateTo] = useState<string | undefined>(undefined)
  
  // Delete confirmation dialog state
  const [deleteConfirmStatementId, setDeleteConfirmStatementId] = useState<string | null>(null)

  const handleUploadStatement = async (file: File) => {
    // Create statement record
    const newStatement = createStatement({
      fileName: file.name,
      fileType: file.name.endsWith('.pdf') ? 'pdf' : 'xml',
      importedAt: new Date().toISOString(),
      status: 'processing',
      totalTransactions: 0,
      matchedTransactions: 0,
      unmatchedTransactions: 0,
    })

    try {
      // Only process XML files
      if (!file.name.toLowerCase().endsWith('.xml')) {
        alert('Trenutno je podprt samo XML format (camt.052). PDF uvoz ni na voljo.')
        updateStatement(newStatement.id, { status: 'failed' })
        return
      }

      // Parse the XML file
      const parsedStatement = await parseXmlFile(file)
      
      // Create transactions from parsed data
      let matchedCount = 0
      let unmatchedCount = 0
      let skippedCount = 0
      
      for (const tx of parsedStatement.transactions) {
        // Check if transaction already exists by bankReference
        const existingTransaction = tx.id 
          ? transactions.find((t) => t.bankReference === tx.id)
          : null
        
        // Skip if transaction already exists (confirmed or not)
        if (existingTransaction) {
          skippedCount++
          continue
        }
        
        // Match transaction to parent
        const matchResult = matchTransactionToParent(tx, parents, members)
        
        // Create bank transaction record
        createTransaction({
          bankStatementId: newStatement.id,
          transactionDate: tx.bookingDate,
          amount: tx.amount,
          description: tx.description || '',
          reference: tx.reference,
          accountNumber: tx.payerIban || '',
          payerName: tx.payerName || 'Neznan plačnik',
          bankReference: tx.id || null,
          matchedParentId: matchResult.parentId,
          matchConfidence: matchResult.confidence,
          status: matchResult.parentId ? 'matched' : 'unmatched',
          paymentId: null,
        })

        if (matchResult.parentId) {
          matchedCount++
        } else {
          unmatchedCount++
        }
      }
      
      // Update statement with final counts (only newly imported transactions)
      updateStatement(newStatement.id, {
        status: 'completed',
        totalTransactions: matchedCount + unmatchedCount,
        matchedTransactions: matchedCount,
        unmatchedTransactions: unmatchedCount,
      })
      
      // Automatically view the imported statement
      setSelectedStatementId(newStatement.id)
      setViewMode('statements')
      
    } catch (error) {
      console.error('Error parsing XML file:', error)
      alert(`Napaka pri branju XML datoteke: ${error instanceof Error ? error.message : 'Neznana napaka'}`)
      updateStatement(newStatement.id, { status: 'failed' })
    }
  }

  const handleUpdateTransactionMatch = (transactionId: string, parentId: string | null) => {
    const transaction = transactions.find((t) => t.id === transactionId)
    if (!transaction) return

    // Determine confidence based on whether it was manually selected
    const confidence = parentId ? 'low' : null

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
      status: 'pending', // Will need allocation
    })

    // Update transaction status
    updateTransaction(transactionId, {
      status: 'confirmed',
      paymentId: newPayment.id,
    })

    // Open allocation dialog
    setAllocatingPayment(newPayment)
    isNewPaymentPendingRef.current = true
    setIsAllocationDialogOpen(true)
  }

  // Open delete confirmation dialog
  const handleDeleteStatementClick = (statementId: string) => {
    setDeleteConfirmStatementId(statementId)
  }

  // Actual delete logic (called when user confirms)
  const handleDeleteStatementConfirm = () => {
    if (!deleteConfirmStatementId) return
    
    const statementId = deleteConfirmStatementId
    
    // Find all transactions for this statement
    const statementTransactions = transactions.filter(
      (t) => t.bankStatementId === statementId
    )
    
    // Delete all associated transactions
    statementTransactions.forEach((transaction) => {
      removeTransaction(transaction.id)
    })
    
    // Delete the statement
    removeStatement(statementId)
    
    // Clear selection if this statement was selected
    if (selectedStatementId === statementId) {
      setSelectedStatementId(undefined)
    }
    
    // Close the dialog
    setDeleteConfirmStatementId(null)
  }

  // Build delete confirmation message
  const getDeleteConfirmMessage = () => {
    if (!deleteConfirmStatementId) return ''
    
    const statement = statements.find((s) => s.id === deleteConfirmStatementId)
    if (!statement) return ''
    
    const statementTransactions = transactions.filter(
      (t) => t.bankStatementId === deleteConfirmStatementId
    )
    
    const confirmedTransactions = statementTransactions.filter(
      (t) => t.status === 'confirmed' && t.paymentId
    )
    
    let message = `Ali ste prepričani, da želite izbrisati bančni izpisek "${statement.fileName}"?`
    
    if (confirmedTransactions.length > 0) {
      message += `\n\nOPOZORILO: ${confirmedTransactions.length} transakcij je bilo že potrjenih in pretvorjenih v plačila. Plačila bodo ostala, vendar bo povezava z bančno transakcijo izgubljena.`
    }
    
    if (statementTransactions.length > 0) {
      message += `\n\nTo bo izbrisalo ${statementTransactions.length} transakcij.`
    }
    
    return message
  }

  // Manual payment handlers
  const handleCreatePayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment = createPayment(paymentData)
    
    // If payment is linked to a parent, open allocation dialog
    if (newPayment.parentId) {
      setAllocatingPayment(newPayment)
      isNewPaymentPendingRef.current = true
      setIsAllocationDialogOpen(true)
    }
  }

  const handleOpenAllocationDialog = (payment: Payment) => {
    setAllocatingPayment(payment)
    isNewPaymentPendingRef.current = false // Not a new payment, just opening for existing
    setIsAllocationDialogOpen(true)
  }

  // Handle allocation dialog close - rollback if new payment was cancelled
  const handleAllocationDialogClose = (open: boolean) => {
    // Use the ref for synchronous check (state updates are batched by React)
    if (!open && isNewPaymentPendingRef.current && allocatingPayment) {
      // User cancelled allocation for a newly created payment - rollback
      const paymentToDelete = allocatingPayment
      
      // Revert bank transaction status if this was imported
      if (paymentToDelete.importedFromBank && paymentToDelete.bankTransactionId) {
        const transaction = transactions.find((t) => t.id === paymentToDelete.bankTransactionId)
        if (transaction) {
          const newStatus = transaction.matchedParentId ? 'matched' : 'unmatched'
          updateTransaction(transaction.id, {
            status: newStatus,
            paymentId: null,
          })
        }
      }
      
      // Delete the uncommitted payment
      deletePaymentWithCascade(paymentToDelete.id)
    }
    
    setIsAllocationDialogOpen(open)
    if (!open) {
      setAllocatingPayment(null)
      isNewPaymentPendingRef.current = false
    }
  }

  const handleAllocatePayment = (paymentId: string, allocations: Array<{ costId: string; amount: number }>, parentId?: string) => {
    // Clear the pending flag SYNCHRONOUSLY since allocation is being confirmed
    // This prevents handleAllocationDialogClose from rolling back the payment
    isNewPaymentPendingRef.current = false
    
    // Create allocation records
    allocations.forEach((allocation) => {
      createAllocation({
        paymentId,
        costId: allocation.costId,
        allocatedAmount: allocation.amount,
      })
      
      // Update cost status to paid
      const cost = costs.find((c) => c.id === allocation.costId)
      if (cost) {
        updateCost(allocation.costId, { status: 'paid' })
      }
    })
    
    // Update payment status and parent if provided
    const paymentUpdate: Partial<Payment> = { status: 'confirmed' }
    if (parentId) {
      paymentUpdate.parentId = parentId
    }
    updatePayment(paymentId, paymentUpdate)
  }

  // Delete payment handler
  const handleDeletePayment = (payment: Payment) => {
    // Build confirmation message
    let confirmMessage = `Ali ste prepričani, da želite izbrisati plačilo v višini ${payment.amount.toFixed(2)} €?`
    
    if (payment.importedFromBank) {
      confirmMessage += '\n\nTo plačilo je bilo uvoženo iz bančnega izpiska. Po brisanju bo bančna transakcija ponovno prikazana kot neknjižena.'
    }
    
    // Get allocations for this payment
    const relatedAllocations = paymentAllocations.filter((a) => a.paymentId === payment.id)
    if (relatedAllocations.length > 0) {
      confirmMessage += `\n\nPlačilo je povezano z ${relatedAllocations.length} stroški, ki bodo vrnjeni v status "Odprto".`
    }
    
    if (!confirm(confirmMessage)) {
      return
    }
    
    // Delete payment with cascading (removes allocations, re-evaluates cost statuses)
    const { bankTransactionId } = deletePaymentWithCascade(payment.id)
    
    // Revert bank transaction status if this was an imported payment
    if (bankTransactionId) {
      const transaction = transactions.find((t) => t.id === bankTransactionId)
      if (transaction) {
        // Revert to matched or unmatched based on parent match
        const newStatus = transaction.matchedParentId ? 'matched' : 'unmatched'
        updateTransaction(transaction.id, {
          status: newStatus,
          paymentId: null,
        })
      }
    }
  }

  // Filtered payments for list view
  const filteredPayments = useMemo(() => {
    let filtered = payments

    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === paymentStatusFilter)
    }

    if (paymentParentFilter) {
      filtered = filtered.filter((p) => p.parentId === paymentParentFilter)
    }

    if (paymentDateFrom) {
      filtered = filtered.filter((p) => p.paymentDate >= paymentDateFrom)
    }
    if (paymentDateTo) {
      filtered = filtered.filter((p) => p.paymentDate <= paymentDateTo)
    }

    // Sort by date, newest first
    return [...filtered].sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
  }, [payments, paymentStatusFilter, paymentParentFilter, paymentDateFrom, paymentDateTo])

  // Payment stats
  const paymentStats = useMemo(() => {
    const total = payments.length
    const pending = payments.filter((p) => p.status === 'pending').length
    const allocated = payments.filter((p) => p.status === 'allocated').length
    const confirmed = payments.filter((p) => p.status === 'confirmed').length
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    return { total, pending, allocated, confirmed, totalAmount }
  }, [payments])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI')
  }

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Potrjeno
          </Badge>
        )
      case 'allocated':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            <Link2 className="w-3 h-3 mr-1" />
            Povezano
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Odprto
          </Badge>
        )
      default:
        return null
    }
  }

  // Get existing allocations for a payment
  const getPaymentAllocations = (paymentId: string) => {
    return paymentAllocations
      .filter((a) => a.paymentId === paymentId)
      .map((a) => ({
        costId: a.costId,
        allocatedAmount: a.allocatedAmount,
      }))
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Plačila in bančni uvoz
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ročni vnos plačil in avtomatski uvoz bančnih izpiskov
        </p>
      </div>

        <Button 
          onClick={() => {
            setEditingPayment(null)
            setIsPaymentFormOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Dodaj plačilo
        </Button>
      </div>

      {/* View mode tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList>
          <TabsTrigger value="payments">
            <CreditCard className="w-4 h-4 mr-2" />
            Plačila ({paymentStats.total})
          </TabsTrigger>
          <TabsTrigger value="statements">
            <FileText className="w-4 h-4 mr-2" />
            Bančni izpiski ({statements.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {viewMode === 'payments' ? (
        <div className="space-y-6">
          {/* Payment stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">Skupaj plačil</div>
              <div className="text-2xl font-semibold mt-1 text-slate-900 dark:text-slate-100">{paymentStats.total}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
              <div className="text-sm text-amber-700 dark:text-amber-300">Odprta</div>
              <div className="text-2xl font-semibold mt-1 text-amber-700 dark:text-amber-300">
                {paymentStats.pending}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="text-sm text-blue-700 dark:text-blue-300">Povezana</div>
              <div className="text-2xl font-semibold mt-1 text-blue-700 dark:text-blue-300">
                {paymentStats.allocated}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300">Potrjena</div>
              <div className="text-2xl font-semibold mt-1 text-green-700 dark:text-green-300">
                {paymentStats.confirmed}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">Skupni znesek</div>
              <div className="text-2xl font-semibold mt-1 text-slate-900 dark:text-slate-100">
                {paymentStats.totalAmount.toFixed(2)} €
              </div>
            </div>
          </div>

          {/* Payment filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <Select
                  value={paymentStatusFilter}
                  onValueChange={(value) => setPaymentStatusFilter(value as typeof paymentStatusFilter)}
                >
                  <option value="all">Vsi statusi</option>
                  <option value="pending">Odprta</option>
                  <option value="allocated">Povezana</option>
                  <option value="confirmed">Potrjena</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Plačnik
                </label>
                <Select
                  value={paymentParentFilter || ''}
                  onValueChange={(value) => setPaymentParentFilter(value || undefined)}
                >
                  <option value="">Vsi plačniki</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Datum od
                </label>
                <DateInput
                  value={paymentDateFrom || ''}
                  onChange={(e) => setPaymentDateFrom(e.target.value || undefined)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Datum do
                </label>
                <DateInput
                  value={paymentDateTo || ''}
                  onChange={(e) => setPaymentDateTo(e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Payments list */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Datum
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Plačnik
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Znesek
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Način
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                      Opombe
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <div className="space-y-2">
                          <AlertCircle className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                          <p className="text-slate-500 dark:text-slate-400">Ni plačil</p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">
                            Dodajte plačilo s klikom na gumb "Dodaj plačilo"
                          </p>
                          <Button
                            onClick={() => {
                              setEditingPayment(null)
                              setIsPaymentFormOpen(true)
                            }}
                            className="mt-4"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj plačilo
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => {
                      const parent = parents.find((p) => p.id === payment.parentId)
                      const paymentMethodLabels = {
                        bank_transfer: 'Banka',
                        cash: 'Gotovina',
                        card: 'Kartica',
                        other: 'Drugo',
                      }

                      return (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(payment.paymentDate)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {parent 
                                ? `${parent.firstName} ${parent.lastName}` 
                                : payment.payerName || 'Neznan plačnik'}
                            </div>
                            {payment.importedFromBank && (
                              <Badge variant="outline" className="text-xs mt-1">
                                Uvoz
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                            {payment.amount.toFixed(2)} €
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                            {paymentMethodLabels[payment.paymentMethod]}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                            {payment.notes || '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {payment.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenAllocationDialog(payment)}
                                >
                                  <Link2 className="w-3 h-3 mr-1" />
                                  Poveži
                                </Button>
                              )}
                              {payment.status === 'confirmed' && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="w-4 h-4 inline" />
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeletePayment(payment)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                                title="Izbriši plačilo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedStatementId ? (
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
          hideConfirmed={hideConfirmed}
          onCloseStatement={() => setSelectedStatementId(undefined)}
          onUpdateTransactionMatch={handleUpdateTransactionMatch}
          onConfirmTransaction={handleConfirmTransaction}
          onTransactionStatusFilterChange={setTransactionStatusFilter}
          onStatementFilterChange={setStatementFilter}
          onParentFilterChange={setParentFilter}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onHideConfirmedChange={setHideConfirmed}
        />
      ) : (
        <BankStatementList
          statements={statements}
          onViewStatement={setSelectedStatementId}
          onUploadStatement={handleUploadStatement}
          onDeleteStatement={handleDeleteStatementClick}
        />
      )}

      {/* Payment Form Dialog */}
      <PaymentForm
        payment={editingPayment}
        parents={parents}
        open={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        onSave={handleCreatePayment}
      />

      {/* Payment Allocation Dialog */}
      <PaymentAllocationDialog
        payment={allocatingPayment}
        costs={costs}
        members={members}
        parents={parents}
        existingAllocations={allocatingPayment ? getPaymentAllocations(allocatingPayment.id) : []}
        open={isAllocationDialogOpen}
        onOpenChange={handleAllocationDialogClose}
        onAllocate={handleAllocatePayment}
      />

      {/* Delete Bank Statement Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmStatementId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmStatementId(null)
        }}
        title="Izbriši bančni izpisek"
        message={getDeleteConfirmMessage()}
        confirmLabel="Izbriši"
        cancelLabel="Prekliči"
        variant="destructive"
        onConfirm={handleDeleteStatementConfirm}
      />
    </div>
  )
}

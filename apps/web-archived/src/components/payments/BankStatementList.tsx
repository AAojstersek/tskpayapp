import type { BankStatement } from '@/types'
import { Badge, Button } from '@/components/ui'
import { FileText, CheckCircle2, AlertCircle, Clock, Upload } from 'lucide-react'

export interface BankStatementListProps {
  statements: BankStatement[]
  onViewStatement?: (statementId: string) => void
  onUploadStatement?: (file: File) => void
}

export function BankStatementList({
  statements,
  onViewStatement,
  onUploadStatement,
}: BankStatementListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('sl-SI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: BankStatement['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Dokončano
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Obdelava
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Napaka
          </Badge>
        )
      default:
        return null
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onUploadStatement) {
      onUploadStatement(file)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Bančni izpiski</h2>
        <div>
          <input
            type="file"
            id="file-upload"
            accept=".pdf,.xml"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Naloži izpisek
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Datum uvoza
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Datoteka
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Transakcije
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ujemanja
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300">
                  Neujemanja
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
              {statements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="space-y-2">
                      <p className="text-slate-500 dark:text-slate-400">Ni uvoženih izpiskov</p>
                      <p className="text-sm text-slate-400">Naložite prvi bančni izpisek, da začnete</p>
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="mt-4"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Naloži izpisek
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                statements.map((statement) => (
                  <tr
                    key={statement.id}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(statement.importedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{statement.fileName}</span>
                        <Badge variant="outline" className="text-xs">
                          {statement.fileType.toUpperCase()}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(statement.status)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {statement.totalTransactions}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 font-medium">
                      {statement.matchedTransactions}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
                      {statement.unmatchedTransactions}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewStatement?.(statement.id)}
                        disabled={statement.status === 'processing' || statement.status === 'failed'}
                      >
                        Odpri
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

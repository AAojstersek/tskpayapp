import { useState } from 'react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'
import { db } from '@/data/database'
import { Download, Upload, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

export function NastavitvePage() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setError(null)
    setExportSuccess(null)

    try {
      const filePath = await db.exportDatabase()
      setExportSuccess(filePath)
    } catch (err) {
      // Tauri invoke errors can be strings or objects
      let errorMessage = 'Napaka pri izvozu baze podatkov'
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message)
      } else if (err && typeof err === 'object' && 'toString' in err) {
        errorMessage = String(err)
      }
      console.error('Export error:', err)
      setError(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setShowImportConfirm(false)
    setIsImporting(true)
    setError(null)
    setImportSuccess(null)

    try {
      const backupPath = await db.importDatabase()
      setImportSuccess(backupPath)
      
      // Reload the page after a short delay to load the new database
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      // Tauri invoke errors can be strings or objects
      let errorMessage = 'Napaka pri uvozu baze podatkov'
      if (typeof err === 'string') {
        errorMessage = err
      } else if (err instanceof Error) {
        errorMessage = err.message
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message)
      } else if (err && typeof err === 'object' && 'toString' in err) {
        errorMessage = String(err)
      }
      console.error('Import error:', err)
      setError(errorMessage)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Nastavitve
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upravljanje nastavitev aplikacije in baze podatkov.
        </p>
      </div>

      {/* Database Backup Section */}
      <Card>
        <CardHeader>
          <CardTitle>Baza podatkov</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Izvoz in uvoz baze podatkov za backup ali prenos na drug računalnik.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Opomba: Uvoz baze podatkov bo zamenjal vse trenutne podatke z uvoženimi. Obstoječa baza bo avtomatsko shranjena kot backup.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting || isImporting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Izvoziram...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Izvozi bazo podatkov
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowImportConfirm(true)}
              disabled={isExporting || isImporting}
              variant="outline"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uvažam...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Uvozi bazo podatkov
                </>
              )}
            </Button>
          </div>

          {/* Success messages */}
          {exportSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Baza podatkov uspešno izvožena</p>
                <p className="text-xs mt-0.5 break-all">{exportSuccess}</p>
              </div>
            </div>
          )}

          {importSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Baza podatkov uspešno uvožena</p>
                <p className="text-xs mt-0.5">Backup obstoječe baze: {importSuccess}</p>
                <p className="text-xs mt-1">Aplikacija se bo osvežila...</p>
              </div>
            </div>
          )}

          {/* Error messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Napaka</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <Dialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <DialogContent className="max-w-md">
          <DialogClose onClose={() => setShowImportConfirm(false)} />
          <DialogHeader>
            <DialogTitle>Potrdi uvoz baze podatkov</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Ali ste prepričani, da želite uvesti bazo podatkov?
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  To bo zamenjalo vse trenutne podatke z uvoženimi. Obstoječa baza bo shranjena kot backup pred uvozom.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowImportConfirm(false)}
                className="flex-1"
              >
                Prekliči
              </Button>
              <Button
                onClick={handleImport}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Potrdi uvoz
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

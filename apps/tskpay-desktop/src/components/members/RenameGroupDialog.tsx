import { useState, useEffect } from 'react'
import { Button, Input, Label } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog'

export interface RenameGroupDialogProps {
  groupName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (newName: string) => void
}

export function RenameGroupDialog({
  groupName,
  open,
  onOpenChange,
  onSave,
}: RenameGroupDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) {
      setName(groupName)
    }
  }, [open, groupName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      return
    }

    onSave?.(name.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Preimenuj skupino</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="groupName">
              Ime skupine <span className="text-red-500">*</span>
            </Label>
            <Input
              id="groupName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vnesite ime skupine"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Prekliči
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Shrani
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

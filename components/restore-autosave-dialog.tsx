"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RestoreAutosaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timestamp: Date
  onRestore: () => void
  onDiscard: () => void
}

export default function RestoreAutosaveDialog({
  open,
  onOpenChange,
  timestamp,
  onRestore,
  onDiscard,
}: RestoreAutosaveDialogProps) {
  const formattedDate = timestamp.toLocaleDateString()
  const formattedTime = timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gespeicherte Daten gefunden</DialogTitle>
          <DialogDescription>
            Es wurden automatisch gespeicherte Daten vom {formattedDate} um {formattedTime} gefunden. Möchten Sie diese
            wiederherstellen oder verwerfen?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={onDiscard}>
            Verwerfen
          </Button>
          <Button onClick={onRestore}>Wiederherstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Backup } from "@/lib/backup-service"

interface BackupRestoreDialogProps {
  backup: Backup | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function BackupRestoreDialog({ backup, open, onOpenChange, onConfirm }: BackupRestoreDialogProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [progress, setProgress] = useState(0)

  const handleConfirm = async () => {
    try {
      setStatus("loading")

      // Simuliere Fortschritt
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + Math.floor(Math.random() * 10)
        })
      }, 300)

      await onConfirm()
      clearInterval(interval)
      setProgress(100)
      setStatus("success")

      // Schließe Dialog nach erfolgreicher Wiederherstellung
      setTimeout(() => {
        onOpenChange(false)
        setStatus("idle")
        setProgress(0)
      }, 2000)
    } catch (error) {
      setStatus("error")
    }
  }

  if (!backup) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup wiederherstellen</DialogTitle>
          <DialogDescription>
            Möchten Sie das System mit dem Backup vom {backup.createdAt.toLocaleDateString()} (
            {backup.createdAt.toLocaleTimeString()}) wiederherstellen?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Name:</span>
              <span className="font-medium">{backup.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Größe:</span>
              <span className="font-medium">{backup.size}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Typ:</span>
              <span className="font-medium">{backup.type === "manual" ? "Manuell" : "Automatisch"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Speicherort:</span>
              <span className="font-medium">{backup.location === "local" ? "Lokal" : "Cloud"}</span>
            </div>
          </div>

          {status === "loading" && (
            <div className="mt-6 space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center text-muted-foreground">Wiederherstellung läuft... {progress}%</p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 flex items-center justify-center text-green-600 gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Wiederherstellung erfolgreich abgeschlossen</span>
            </div>
          )}

          {status === "error" && (
            <div className="mt-6 flex items-center justify-center text-red-600 gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Fehler bei der Wiederherstellung</span>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={status === "loading"}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm} disabled={status === "loading" || status === "success"}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wiederherstellen...
              </>
            ) : (
              "Wiederherstellen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

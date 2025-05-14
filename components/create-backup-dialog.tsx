"use client"

import { useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateBackupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string) => Promise<void>
}

export function CreateBackupDialog({ open, onOpenChange, onConfirm }: CreateBackupDialogProps) {
  const [backupName, setBackupName] = useState("Manuelles Backup")
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

      await onConfirm(backupName)
      clearInterval(interval)
      setProgress(100)
      setStatus("success")

      // Schließe Dialog nach erfolgreicher Erstellung
      setTimeout(() => {
        onOpenChange(false)
        setStatus("idle")
        setProgress(0)
        setBackupName("Manuelles Backup")
      }, 1500)
    } catch (error) {
      setStatus("error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup erstellen</DialogTitle>
          <DialogDescription>Erstellen Sie ein manuelles Backup Ihrer Daten.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup-Name</Label>
              <Input
                id="backup-name"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Geben Sie einen Namen für das Backup ein"
                disabled={status === "loading"}
              />
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
              <p className="text-sm text-center text-muted-foreground">Backup wird erstellt... {progress}%</p>
            </div>
          )}

          {status === "success" && (
            <div className="mt-6 flex items-center justify-center text-green-600 gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Backup erfolgreich erstellt</span>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={status === "loading"}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm} disabled={status === "loading" || status === "success" || !backupName.trim()}>
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Erstellen...
              </>
            ) : (
              "Backup erstellen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

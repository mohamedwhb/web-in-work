"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Truck, CheckCircle } from "lucide-react"

interface DeliveryStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentStatus: "prepared" | "shipped" | "delivered"
  onStatusChange: (status: "prepared" | "shipped" | "delivered", trackingNumber: string, notes: string) => void
  trackingNumber?: string
  notes?: string
}

export default function DeliveryStatusDialog({
  open,
  onOpenChange,
  currentStatus,
  onStatusChange,
  trackingNumber = "",
  notes = "",
}: DeliveryStatusDialogProps) {
  const [status, setStatus] = useState<"prepared" | "shipped" | "delivered">(currentStatus)
  const [tracking, setTracking] = useState(trackingNumber)
  const [noteText, setNoteText] = useState(notes)

  const handleSubmit = () => {
    onStatusChange(status, tracking, noteText)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Lieferstatus ändern</DialogTitle>
          <DialogDescription>
            Aktualisieren Sie den Status des Lieferscheins und fügen Sie optional Tracking-Informationen hinzu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as "prepared" | "shipped" | "delivered")}
            >
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="prepared" id="prepared" />
                <Label htmlFor="prepared" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Vorbereitet
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="shipped" id="shipped" />
                <Label htmlFor="shipped" className="flex items-center gap-2 cursor-pointer">
                  <Truck className="h-4 w-4 text-amber-500" />
                  Versendet
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3">
                <RadioGroupItem value="delivered" id="delivered" />
                <Label htmlFor="delivered" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Geliefert
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNumber">Sendungsnummer</Label>
            <Input
              id="trackingNumber"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Sendungsnummer eingeben"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anmerkungen</Label>
            <Textarea
              id="notes"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Zusätzliche Informationen zur Lieferung"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

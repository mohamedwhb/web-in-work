"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Banknote, Loader2 } from "lucide-react"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onComplete: (paymentMethod: string) => void
  isProcessing?: boolean
}

export function PaymentDialog({ open, onOpenChange, total, onComplete, isProcessing = false }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashAmount, setCashAmount] = useState(total.toFixed(2))

  const cashAmountNum = Number.parseFloat(cashAmount)
  const change = cashAmountNum - total

  const handleComplete = () => {
    onComplete(paymentMethod)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (isProcessing) return // Prevent closing while processing
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Zahlung</DialogTitle>
          <DialogDescription>Wählen Sie eine Zahlungsmethode und schließen Sie den Verkauf ab.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup
            defaultValue="cash"
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="grid grid-cols-2 gap-4"
            disabled={isProcessing}
          >
            <div>
              <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
              <Label
                htmlFor="cash"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Banknote className="mb-3 h-6 w-6" />
                Bargeld
              </Label>
            </div>

            <div>
              <RadioGroupItem value="card" id="card" className="peer sr-only" />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <CreditCard className="mb-3 h-6 w-6" />
                Karte
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Erhaltener Betrag</Label>
              <Input
                id="cashAmount"
                type="number"
                step="0.01"
                min={total}
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                disabled={isProcessing}
              />

              {change >= 0 && (
                <div className="flex justify-between items-center mt-2 p-2 bg-muted rounded">
                  <span>Rückgeld:</span>
                  <span className="font-bold">{change.toFixed(2)}€</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
            <span className="font-semibold">Gesamtbetrag:</span>
            <span className="text-xl font-bold">{total.toFixed(2)}€</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Abbrechen
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isProcessing || (paymentMethod === "cash" && cashAmountNum < total)}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verarbeitung...
              </>
            ) : (
              "Zahlung abschließen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

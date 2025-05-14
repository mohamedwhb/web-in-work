"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ConvertOfferDialogProps {
  open: boolean
  onClose: () => void
  offerId: string
}

export function ConvertOfferDialog({ open, onClose, offerId }: ConvertOfferDialogProps) {
  const [paymentTerms, setPaymentTerms] = useState("14 Tage")
  const router = useRouter()
  const { toast } = useToast()

  const handleConvert = () => {
    // In a real application, you would pass the payment terms to the conversion page
    // For now, we'll just navigate to the conversion page
    router.push(`/angebot/${offerId}/convert`)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Angebot in Rechnung umwandeln</DialogTitle>
          <DialogDescription>Erstellen Sie eine Rechnung aus dem Angebot {offerId}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment-terms" className="text-right">
              Zahlungsbedingungen
            </Label>
            <Select value={paymentTerms} onValueChange={setPaymentTerms} className="col-span-3">
              <SelectTrigger id="payment-terms">
                <SelectValue placeholder="Zahlungsbedingungen wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7 Tage">7 Tage</SelectItem>
                <SelectItem value="14 Tage">14 Tage</SelectItem>
                <SelectItem value="30 Tage">30 Tage</SelectItem>
                <SelectItem value="Sofort">Sofort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleConvert}>Rechnung erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

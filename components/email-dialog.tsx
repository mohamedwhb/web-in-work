"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipient: string
  subject: string
  documentType: string
  documentData: any
}

export default function EmailDialog({
  open,
  onOpenChange,
  recipient,
  subject,
  documentType,
  documentData,
}: EmailDialogProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSendEmail = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "E-Mail gesendet",
        description: `Das ${documentType} wurde erfolgreich an ${recipient} gesendet.`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Fehler beim Senden",
        description: "Die E-Mail konnte nicht gesendet werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>E-Mail senden</DialogTitle>
          <DialogDescription>
            Senden Sie das {documentType} direkt an Ihren Kunden. Das {documentType} wird als PDF-Datei angehängt.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Empfänger</Label>
            <Input id="recipient" value={recipient} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input id="subject" value={subject} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Nachricht</Label>
            <Textarea
              id="message"
              placeholder="Geben Sie hier Ihre Nachricht ein..."
              className="min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button onClick={handleSendEmail} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Senden...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Senden
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

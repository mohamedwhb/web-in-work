"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { generatePaymentQrCode } from "@/lib/qr-payment"
import Image from "next/image"

interface PaymentQrCodeProps {
  recipient: string
  iban: string
  amount: number
  reference: string
  info?: string
  bic?: string
  className?: string
}

export function PaymentQrCode({ recipient, iban, amount, reference, info, bic, className }: PaymentQrCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadQrCode() {
      try {
        setIsLoading(true)
        setError(null)

        const dataUrl = await generatePaymentQrCode({
          recipient,
          iban,
          amount,
          reference,
          info,
          bic,
        })

        setQrCodeUrl(dataUrl)
      } catch (err) {
        console.error("Fehler beim Laden des QR-Codes:", err)
        setError("Der QR-Code konnte nicht generiert werden.")
      } finally {
        setIsLoading(false)
      }
    }

    loadQrCode()
  }, [recipient, iban, amount, reference, info, bic])

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Zahlung per QR-Code</CardTitle>
        <CardDescription>Scannen Sie den Code mit Ihrer Banking-App</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isLoading && <Skeleton className="h-[200px] w-[200px]" />}

        {error && !isLoading && <div className="text-sm text-destructive text-center p-4">{error}</div>}

        {qrCodeUrl && !isLoading && !error && (
          <div className="flex flex-col items-center gap-2">
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt="Zahlungs-QR-Code"
              width={200}
              height={200}
              className="border border-border rounded-md"
            />
            <div className="text-xs text-muted-foreground text-center mt-2 max-w-[200px]">
              <p>SEPA-Überweisung: {amount.toFixed(2)} €</p>
              <p className="truncate">An: {recipient}</p>
              <p className="truncate">IBAN: {iban}</p>
              <p className="truncate">Ref: {reference}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

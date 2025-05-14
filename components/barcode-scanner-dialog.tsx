"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { Barcode, Camera, X } from "lucide-react"

interface BarcodeScannerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (barcode: string) => void
}

export function BarcodeScannerDialog({ open, onOpenChange, onScan }: BarcodeScannerDialogProps) {
  const [barcode, setBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus on input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Handle manual barcode entry
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcode.trim()) {
      onScan(barcode.trim())
      setBarcode("")
    }
  }

  // Simulate camera scanning
  const startScanning = () => {
    setIsScanning(true)
    setCountdown(3)
  }

  // Countdown effect for simulated scanning
  useEffect(() => {
    if (!isScanning) return

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      // Generate a random barcode from our product list
      const randomBarcodes = [
        "4001234567890",
        "4001234567891",
        "4001234567892",
        "4001234567893",
        "4001234567894",
        "4001234567895",
        "4001234567896",
        "4001234567897",
        "4001234567898",
        "4001234567899",
        "4001234567900",
        "4001234567901",
      ]
      const randomBarcode = randomBarcodes[Math.floor(Math.random() * randomBarcodes.length)]

      // Simulate successful scan
      setTimeout(() => {
        setIsScanning(false)
        onScan(randomBarcode)
      }, 500)
    }
  }, [countdown, isScanning, onScan])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Barcode Scanner</DialogTitle>
          <DialogDescription>Scannen Sie einen Barcode oder geben Sie ihn manuell ein.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isScanning ? (
            <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center">
              {countdown > 0 ? (
                <div className="text-4xl font-bold">{countdown}</div>
              ) : (
                <div className="animate-pulse flex flex-col items-center">
                  <Barcode className="h-12 w-12 mb-2" />
                  <p>Scanning...</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setIsScanning(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    placeholder="Barcode eingeben..."
                    className="pl-8"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
                <Button type="submit">Hinzufügen</Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">oder</p>
                <Button type="button" onClick={startScanning} className="w-full">
                  <Camera className="mr-2 h-4 w-4" />
                  Kamera verwenden
                </Button>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

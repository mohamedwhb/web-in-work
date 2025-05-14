"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Printer, X } from "lucide-react"
import type { DocumentType, DocumentData } from "@/lib/pdf-generator"

interface PdfPreviewProps {
  type: DocumentType
  data: DocumentData
  onClose?: () => void
}

export default function PdfPreview({ type, data, onClose }: PdfPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null)

  useEffect(() => {
    async function generatePdfPreview() {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Generating PDF preview for:", { type, data })

        // Send request to the PDF generation API
        const response = await fetch("/api/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type, data }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("PDF generation failed:", errorText)
          throw new Error(
            `Failed to generate PDF: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
          )
        }

        // Get the PDF blob
        const blob = await response.blob()
        setPdfBlob(blob)

        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (error) {
        console.error("Error generating PDF preview:", error)
        setError((error as Error).message || "Failed to generate PDF preview")
      } finally {
        setIsLoading(false)
      }
    }

    generatePdfPreview()

    // Clean up on unmount
    return () => {
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [type, data])

  const documentTitle = {
    angebot: "Angebot",
    rechnung: "Rechnung",
    lieferschein: "Lieferschein",
  }[type]

  const fileName = `${documentTitle.toLowerCase()}_${data.id || "dokument"}.pdf`

  // Funktion zum Herunterladen der PDF
  const handleDownload = () => {
    if (!pdfBlob || !pdfUrl) return

    // Erstelle einen temporären Link zum Herunterladen
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Funktion zum Drucken der PDF
  const handlePrint = () => {
    if (!iframeRef) return

    // Verwende das iframe zum Drucken
    const iframe = iframeRef
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>PDF Vorschau: {documentTitle}</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isLoading || !!error}
            title="PDF herunterladen"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrint}
            disabled={isLoading || !!error}
            title="PDF drucken"
          >
            <Printer className="h-4 w-4" />
          </Button>
          {onClose && (
            <Button variant="outline" size="icon" onClick={onClose} title="Schließen">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>PDF wird generiert...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-destructive">
            <p className="mb-4">Fehler beim Generieren der PDF:</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <iframe
            ref={setIframeRef}
            src={pdfUrl || ""}
            className="w-full h-[70vh] border-0"
            title={`${documentTitle} PDF Preview`}
          />
        )}
      </CardContent>
    </Card>
  )
}

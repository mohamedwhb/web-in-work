"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import type { DocumentType, DocumentData } from "@/lib/pdf-generator"

interface PdfExportButtonProps {
  type: DocumentType
  data: DocumentData
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export default function PdfExportButton({ type, data, variant = "outline", size = "sm" }: PdfExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    try {
      setIsLoading(true)

      // Send request to the PDF generation API
      const response = await fetch("/api/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate PDF")
      }

      // Get the PDF blob
      const blob = await response.blob()

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.download = getFileName(type, data.id)

      // Append the link to the document
      document.body.appendChild(link)

      // Click the link to trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
      PDF
    </Button>
  )
}

function getFileName(type: DocumentType, id: string): string {
  const prefix = {
    angebot: "Angebot",
    rechnung: "Rechnung",
    lieferschein: "Lieferschein",
  }[type]

  return `${prefix}_${id.replace(/\s+/g, "_")}.pdf`
}

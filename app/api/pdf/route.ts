import { type NextRequest, NextResponse } from "next/server"
import { generatePDF, type DocumentType, type DocumentData } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { type, data } = body as { type: DocumentType; data: DocumentData }

    // Validate the request
    if (!type || !data) {
      console.error("Missing required fields:", { type, data })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log the request for debugging
    console.log(`Generating PDF for ${type} with ID ${data.id}`)

    try {
      // Generate the PDF
      const pdfBuffer = await generatePDF(type, data)

      // Return the PDF as a response
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${getFileName(type, data.id)}"`,
        },
      })
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError)
      return NextResponse.json(
        {
          error: "Failed to generate PDF",
          details: (pdfError as Error).message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: (error as Error).message,
      },
      { status: 400 },
    )
  }
}

function getFileName(type: DocumentType, id: string): string {
  const prefix = {
    angebot: "Angebot",
    rechnung: "Rechnung",
    lieferschein: "Lieferschein",
  }[type]

  return `${prefix}_${id.replace(/\s+/g, "_")}.pdf`
}

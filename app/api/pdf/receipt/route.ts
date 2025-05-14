import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Extend the jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Define receipt data interface
interface ReceiptData {
  id: string
  date: string
  items: {
    id: number
    product: string
    artNr: string
    quantity: number
    price: number
    total: number
  }[]
  subtotal: number
  discountPercent: number
  discountAmount: number
  tax: number
  taxRate: number
  total: number
  paymentMethod: string
  customer: {
    name: string
    address: string
    city: string
    zip: string
    country: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { data } = body as { data: ReceiptData }

    // Validate the request
    if (!data) {
      console.error("Missing required fields:", { data })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log the request for debugging
    console.log(`Generating receipt for ${data.id}`)

    // Generate the PDF
    const pdfBuffer = await generateReceiptPDF(data)

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Beleg_${data.id.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json(
      { error: "Failed to generate receipt", details: (error as Error).message },
      { status: 500 },
    )
  }
}

async function generateReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200], // Receipt width: 80mm (standard thermal receipt width)
  })

  // Initialize autoTable with the document
  autoTable(doc as any)

  // Company information
  const companyInfo = {
    name: "KMW GmbH",
    address: "Puchsbaumgasse 1",
    zip: "1100",
    city: "Wien",
    phone: "0676123456789",
    email: "office@kmw.at",
    taxId: "ATU12345678",
  }

  // Set document properties
  doc.setProperties({
    title: `Beleg ${data.id}`,
    subject: `Beleg vom ${data.date}`,
    author: companyInfo.name,
    creator: "KMW Business Management System",
  })

  // Set font size and add company header
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(companyInfo.name, 40, 10, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(companyInfo.address, 40, 15, { align: "center" })
  doc.text(`${companyInfo.zip} ${companyInfo.city}`, 40, 19, { align: "center" })
  doc.text(`Tel: ${companyInfo.phone}`, 40, 23, { align: "center" })

  // Add receipt title and info
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("BELEG", 40, 30, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`Beleg-Nr.: ${data.id}`, 40, 35, { align: "center" })
  doc.text(`Datum: ${data.date}`, 40, 39, { align: "center" })

  // Add separator line
  doc.line(5, 42, 75, 42)

  // Add items table
  doc.autoTable({
    startY: 45,
    head: [["Pos", "Artikel", "Menge", "Preis", "Summe"]],
    body: data.items.map((item, index) => [
      index + 1,
      item.product,
      item.quantity,
      `${item.price.toFixed(2)}€`,
      `${item.total.toFixed(2)}€`,
    ]),
    styles: {
      fontSize: 6,
      cellPadding: 1,
    },
    headStyles: {
      fillColor: [80, 80, 80],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 25 },
      2: { cellWidth: 10, halign: "right" },
      3: { cellWidth: 15, halign: "right" },
      4: { cellWidth: 15, halign: "right" },
    },
    margin: { left: 5, right: 5 },
  })

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 5

  // Add totals
  doc.setFontSize(7)
  doc.text("Zwischensumme:", 50, finalY, { align: "right" })
  doc.text(`${data.subtotal.toFixed(2)}€`, 75, finalY, { align: "right" })

  let currentY = finalY

  // Add discount if applicable
  if (data.discountPercent > 0) {
    currentY += 4
    doc.text(`Rabatt (${data.discountPercent}%):`, 50, currentY, { align: "right" })
    doc.text(`-${data.discountAmount.toFixed(2)}€`, 75, currentY, { align: "right" })
  }

  // Add tax
  currentY += 4
  doc.text(`MwSt. (${data.taxRate}%):`, 50, currentY, { align: "right" })
  doc.text(`${data.tax.toFixed(2)}€`, 75, currentY, { align: "right" })

  // Add total
  currentY += 4
  doc.setFont("helvetica", "bold")
  doc.text("Gesamtbetrag:", 50, currentY, { align: "right" })
  doc.text(`${data.total.toFixed(2)}€`, 75, currentY, { align: "right" })

  // Add payment method
  currentY += 8
  doc.setFont("helvetica", "normal")
  doc.text("Zahlungsart:", 50, currentY, { align: "right" })
  doc.text(data.paymentMethod === "cash" ? "Bargeld" : "Karte", 75, currentY, { align: "right" })

  // Add separator line
  currentY += 5
  doc.line(5, currentY, 75, currentY)

  // Add tax information
  currentY += 5
  doc.setFontSize(6)
  doc.text(`UID-Nr.: ${companyInfo.taxId}`, 40, currentY, { align: "center" })

  // Add thank you note
  currentY += 5
  doc.text("Vielen Dank für Ihren Einkauf!", 40, currentY, { align: "center" })

  // Return the PDF as a Uint8Array
  return doc.output("arraybuffer")
}

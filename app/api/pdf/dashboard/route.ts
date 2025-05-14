import { type NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import type { UserOptions } from "jspdf-autotable"
import { getCompanyInfo, getCompanyLogo } from "@/lib/company-service"

// Extend the jsPDF types to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: UserOptions) => jsPDF
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { widgets, title, dateRange } = body

    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Initialize autoTable with the document
    autoTable(doc as any)

    // Get company information
    const companyInfo = getCompanyInfo()
    const companyLogo = getCompanyLogo()

    // Set document properties
    doc.setProperties({
      title: title || "Dashboard Export",
      subject: "Dashboard Export",
      author: companyInfo.name,
      creator: "KMW Business Management System",
    })

    // Add company logo and header
    addHeader(doc, title || "Dashboard Export", dateRange, companyInfo, companyLogo)

    // Add widgets to PDF
    let yPosition = 50 // Starting Y position after header

    if (widgets && Array.isArray(widgets)) {
      for (const widget of widgets) {
        yPosition = addWidgetToPdf(doc, widget, yPosition)

        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20 // Reset Y position on new page
        }
      }
    }

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `${companyInfo.name} - Seite ${i} von ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      )
    }

    // Return the PDF as a response
    return new NextResponse(doc.output("arraybuffer"), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Dashboard_Export_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating dashboard PDF:", error)
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}

// Helper function to add header to PDF
function addHeader(
  doc: jsPDF,
  title: string,
  dateRange: string | undefined,
  companyInfo: any,
  companyLogo: string | null,
) {
  const yOffset = 15 // Starting Y position

  // Add company logo if available
  if (companyLogo) {
    try {
      // Calculate logo dimensions while maintaining aspect ratio
      const maxWidth = 40
      const maxHeight = 20

      // Create a temporary image to get dimensions
      const img = new Image()
      img.src = companyLogo
      img.crossOrigin = "anonymous"

      let logoWidth = maxWidth
      let logoHeight = (img.height / img.width) * maxWidth

      // If height exceeds max, scale based on height
      if (logoHeight > maxHeight) {
        logoHeight = maxHeight
        logoWidth = (img.width / img.height) * maxHeight
      }

      doc.addImage(companyLogo, "PNG", 20, yOffset, logoWidth, logoHeight)
    } catch (error) {
      console.error("Error adding logo:", error)
    }
  }

  // Add title
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(title, 20, yOffset + 25)

  // Add date range if available
  if (dateRange) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Zeitraum: ${dateRange}`, 20, yOffset + 32)
  }

  // Add current date
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Erstellt am: ${new Date().toLocaleDateString("de-DE")}`, 20, yOffset + 38)

  // Add company info on the right
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(companyInfo.name, doc.internal.pageSize.width - 20, yOffset + 15, { align: "right" })
  doc.text(`${companyInfo.street} ${companyInfo.number}`, doc.internal.pageSize.width - 20, yOffset + 20, {
    align: "right",
  })
  doc.text(`${companyInfo.zip} ${companyInfo.city}`, doc.internal.pageSize.width - 20, yOffset + 25, { align: "right" })

  // Add horizontal line
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yOffset + 42, doc.internal.pageSize.width - 20, yOffset + 42)
}

// Helper function to add a widget to the PDF
function addWidgetToPdf(doc: jsPDF, widget: any, startY: number): number {
  const widgetTitle = widget.title || "Widget"
  const widgetType = widget.type || "unknown"
  const widgetData = widget.data || {}

  // Add widget title
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(0, 0, 0)
  doc.text(widgetTitle, 20, startY)

  let yPosition = startY + 8

  // Handle different widget types
  switch (widgetType) {
    case "number":
      yPosition = addNumberWidget(doc, widgetData, yPosition)
      break
    case "chart-bar":
    case "chart-line":
    case "chart-pie":
      yPosition = addChartWidget(doc, widgetData, widgetType, yPosition)
      break
    case "list":
      yPosition = addListWidget(doc, widgetData, yPosition)
      break
    case "table":
      yPosition = addTableWidget(doc, widgetData, yPosition)
      break
    case "status":
      yPosition = addStatusWidget(doc, widgetData, yPosition)
      break
    default:
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text("Keine Daten verfügbar", 20, yPosition)
      yPosition += 5
  }

  // Add some space after the widget
  yPosition += 10

  // Add a separator line
  doc.setDrawColor(220, 220, 220)
  doc.line(20, yPosition - 5, doc.internal.pageSize.width - 20, yPosition - 5)

  return yPosition
}

// Helper functions for different widget types
function addNumberWidget(doc: jsPDF, data: any, startY: number): number {
  if (!data) return startY + 5

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")

  // Format value based on format type
  let formattedValue = data.value?.toString() || "0"
  if (data.format === "currency") {
    formattedValue = `${formattedValue} €`
  } else if (data.format === "percentage") {
    formattedValue = `${formattedValue}%`
  }

  doc.text(formattedValue, 20, startY)

  let yPosition = startY + 5

  // Add secondary value if available
  if (data.secondaryValue) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.secondaryValue} ${data.secondaryLabel || ""}`, 20, yPosition)
    yPosition += 5
  }

  // Add change information if available
  if (data.change) {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    const changeText = `${data.changeType === "increase" ? "+" : "-"}${data.change}% zum Vormonat`
    doc.text(changeText, 20, yPosition)
    yPosition += 5
  }

  return yPosition
}

function addChartWidget(doc: jsPDF, data: any, chartType: string, startY: number): number {
  if (!data) return startY + 5

  doc.setFontSize(10)
  doc.setFont("helvetica", "italic")

  // For simplicity, we'll just add a text description of the chart
  // In a real implementation, you would use a library to render the chart as an image
  const chartTypeText =
    {
      "chart-bar": "Balkendiagramm",
      "chart-line": "Liniendiagramm",
      "chart-pie": "Kreisdiagramm",
    }[chartType] || "Diagramm"

  doc.text(`${chartTypeText} (Daten im PDF vereinfacht dargestellt)`, 20, startY)

  let yPosition = startY + 8

  // Add table representation of chart data
  if (data.labels && data.values) {
    const tableData = data.labels.map((label: string, index: number) => [label, data.values[index]?.toString() || "0"])

    doc.autoTable({
      startY: yPosition,
      head: [["Kategorie", "Wert"]],
      body: tableData,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 100, 100] },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 5
  }

  return yPosition
}

function addListWidget(doc: jsPDF, data: any, startY: number): number {
  if (!data || !data.items || !data.items.length) return startY + 5

  const tableData = data.items.map((item: any) => [
    item.name || "",
    item.value?.toLocaleString("de-DE", { style: "currency", currency: "EUR" }) || "0 €",
    `${item.change >= 0 ? "+" : ""}${item.change}%`,
  ])

  doc.autoTable({
    startY: startY,
    head: [["Name", "Wert", "Änderung"]],
    body: tableData,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    headStyles: { fillColor: [100, 100, 100] },
  })

  return (doc as any).lastAutoTable.finalY + 5
}

function addTableWidget(doc: jsPDF, data: any, startY: number): number {
  if (!data || !data.rows || !data.columns) return startY + 5

  const headers = data.columns.map((col: any) => col.label || "")
  const tableData = data.rows.map((row: any) => data.columns.map((col: any) => row[col.key]?.toString() || ""))

  doc.autoTable({
    startY: startY,
    head: [headers],
    body: tableData,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    headStyles: { fillColor: [100, 100, 100] },
  })

  return (doc as any).lastAutoTable.finalY + 5
}

function addStatusWidget(doc: jsPDF, data: any, startY: number): number {
  if (!data || !data.statuses) return startY + 5

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Gesamt: ${data.total || 0}`, 20, startY)

  const tableData = data.statuses.map((status: any) => [status.label || "", status.value?.toString() || "0"])

  doc.autoTable({
    startY: startY + 5,
    head: [["Status", "Wert"]],
    body: tableData,
    margin: { left: 20, right: 20 },
    styles: { fontSize: 8 },
    headStyles: { fillColor: [100, 100, 100] },
  })

  return (doc as any).lastAutoTable.finalY + 5
}

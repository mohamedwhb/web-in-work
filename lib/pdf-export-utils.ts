/**
 * Hilfsfunktionen für den PDF-Export von Dashboard-Widgets
 */

// Formatiert Währungswerte
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value)
}

// Formatiert Prozentwerte
export function formatPercentage(value: number): string {
  return `${value}%`
}

// Formatiert Datum
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Bereitet Widget-Daten für den PDF-Export vor
export function prepareWidgetDataForExport(widget: any): any {
  if (!widget || !widget.data) return null

  const { type, data } = widget

  switch (type) {
    case "number":
      return prepareNumberWidgetData(data)
    case "chart-bar":
    case "chart-line":
    case "chart-pie":
      return prepareChartWidgetData(data)
    case "list":
      return prepareListWidgetData(data)
    case "table":
      return prepareTableWidgetData(data)
    case "status":
      return prepareStatusWidgetData(data)
    default:
      return data
  }
}

// Bereitet Zahlen-Widget-Daten vor
function prepareNumberWidgetData(data: any): any {
  return {
    value: data.value,
    format: data.format || "count",
    secondaryValue: data.secondaryValue,
    secondaryLabel: data.secondaryLabel,
    change: data.change,
    changeType: data.changeType,
  }
}

// Bereitet Diagramm-Widget-Daten vor
function prepareChartWidgetData(data: any): any {
  return {
    labels: data.labels || [],
    values: data.values || [],
    colors: data.colors || [],
  }
}

// Bereitet Listen-Widget-Daten vor
function prepareListWidgetData(data: any): any {
  return {
    items: (data.items || []).map((item: any) => ({
      name: item.name,
      value: item.value,
      change: item.change,
    })),
  }
}

// Bereitet Tabellen-Widget-Daten vor
function prepareTableWidgetData(data: any): any {
  return {
    columns: data.columns || [],
    rows: data.rows || [],
  }
}

// Bereitet Status-Widget-Daten vor
function prepareStatusWidgetData(data: any): any {
  return {
    total: data.total,
    statuses: data.statuses || [],
  }
}
